<template>
  <div class="appointments-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">My Appointments</h1>
        <p class="page-count">{{ filteredAppointments.length }} {{ filteredAppointments.length === 1 ? 'appointment' : 'appointments' }}</p>
      </div>
      <button class="primary-btn" @click="navigateTo('/find-rnd')"><Plus :size="15" /> Book New Appointment</button>
    </div>

    <div class="filter-tabs">
      <button v-for="f in filters" :key="f.key" class="filter-tab" :class="{ active: activeFilter === f.key }" @click="activeFilter = f.key">
        {{ f.label }}
      </button>
    </div>

    <div class="appt-list">
      <div v-if="!filteredAppointments.length" class="empty-state">
        <CalendarX :size="28" class="empty-icon" />
        <p class="empty-title">No {{ activeFilter === 'all' ? '' : activeFilter + ' ' }}appointments</p>
        <p class="empty-sub">Appointments you book with an RND will show up here.</p>
      </div>

      <div v-for="appt in filteredAppointments" :key="appt.id" class="appt-card" :class="[statusAccent(appt.status), { dimmed: appt.status === 'cancelled' }]">
        <div class="appt-date-block" :class="dateBlockClass(appt.status)">
          <span class="d-num">{{ appt.day }}</span>
          <span class="d-mon">{{ appt.month }}</span>
        </div>

        <div class="appt-info">
          <div class="appt-info-row">
            <span class="appt-rnd">{{ appt.rnd }}</span>
            <span class="status-pill" :class="pillClass(appt.status)">{{ statusLabel(appt.status) }}</span>
          </div>
          <p class="appt-meta"><CalendarDays :size="13" /> {{ appt.dateLabel }} <span class="dot">·</span> <Clock :size="13" /> {{ appt.timeLabel }}</p>
        </div>

        <div class="modality-icon" :class="dateBlockClass(appt.status)">
          <component :is="appt.modality === 'video' ? Video : MessageCircle" :size="16" />
        </div>

        <div class="appt-actions">
          <a v-if="appt.status === 'confirmed'" href="#" class="primary-btn small" @click.prevent="navigateTo('/consultation-room')"><Video :size="14" /> Join Video Call</a>
          <button v-if="appt.status === 'pending'" class="outline-btn small" disabled><Hourglass :size="13" /> Awaiting Confirmation</button>
          <a v-if="appt.status === 'completed'" href="#" class="outline-btn small" @click.prevent="navigateTo('/invoices-billing')"><Receipt :size="13" /> View Invoice</a>
          <button v-if="appt.status === 'completed'" class="outline-btn small" @click="openReviewModal(appt)"><Star :size="13" /> Leave Review</button>
          <a v-if="appt.status === 'cancelled'" href="#" class="outline-btn small" @click.prevent="navigateTo('/find-rnd')"><RotateCcw :size="13" /> Book Again</a>
          <button v-if="appt.status === 'confirmed' || appt.status === 'pending'" class="ghost-btn small" @click="openCancelModal(appt)">Cancel</button>
        </div>
      </div>
    </div>

    <!-- CANCEL MODAL -->
    <div v-if="cancelTarget" class="modal-overlay" @click.self="closeCancelModal">
      <div class="modal-box">
        <div class="modal-title-row">
          <AlertTriangle :size="18" class="modal-warn-icon" />
          <h3 class="modal-title">Cancel Appointment?</h3>
        </div>
        <label class="field-label">Reason for cancellation <span class="optional">(optional)</span></label>
        <textarea v-model="cancelReason" rows="2" placeholder="Let your RND know why..."></textarea>
        <div class="modal-actions">
          <button class="ghost-btn" @click="closeCancelModal">Keep Appointment</button>
          <button class="danger-outline-btn" @click="confirmCancel">Confirm Cancellation</button>
        </div>
      </div>
    </div>

    <!-- REVIEW MODAL -->
    <div v-if="reviewTarget" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-box">
        <h3 class="modal-title">Rate Your Consultation</h3>
        <div class="star-row">
          <Star
            v-for="n in 5" :key="n" :size="26"
            :fill="n <= reviewStars ? '#D4A017' : 'none'"
            :stroke="n <= reviewStars ? '#D4A017' : '#c8c8c8'"
            @click="reviewStars = n"
            style="cursor: pointer;"
          />
        </div>
        <textarea v-model="reviewText" rows="3" placeholder="Share your experience..."></textarea>
        <div class="modal-actions">
          <button class="ghost-btn" @click="closeReviewModal">Cancel</button>
          <button class="primary-btn" @click="submitReview">Submit Review</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Video, MessageCircle, AlertTriangle, Star, CalendarDays, Clock, CalendarX, Hourglass, Receipt, RotateCcw } from 'lucide-vue-next'

// TODO: local mock data — move into the shared mock db (db.appointments)
// once the client-side data model is defined, and swap in a real API call.
const appointments = ref([
  { id: 1, day: '04', month: 'Jul', rnd: 'RND Ivy Hope Alba', status: 'confirmed', dateLabel: 'Friday, July 4, 2026', timeLabel: '2:00 PM – 3:00 PM', modality: 'video' },
  { id: 2, day: '18', month: 'Jul', rnd: 'RND Ivy Hope Alba', status: 'pending', dateLabel: 'Saturday, July 18, 2026', timeLabel: '10:30 AM – 11:00 AM', modality: 'chat' },
  { id: 3, day: '15', month: 'Jun', rnd: 'RND Ivy Hope Alba', status: 'completed', dateLabel: 'Monday, June 15, 2026', timeLabel: '2:00 PM – 3:00 PM', modality: 'video' },
  { id: 4, day: '02', month: 'Jun', rnd: 'RND Ivy Hope Alba', status: 'cancelled', dateLabel: 'Tuesday, June 2, 2026', timeLabel: 'Cancelled by client', modality: 'chat' }
])

const filters = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' }
]
const activeFilter = ref('all')

const filteredAppointments = computed(() =>
  activeFilter.value === 'all' ? appointments.value : appointments.value.filter(a => a.status === activeFilter.value)
)

function statusLabel(status) {
  return { confirmed: 'Confirmed', pending: 'Pending', completed: 'Completed', cancelled: 'Cancelled' }[status] || status
}
function pillClass(status) {
  return { confirmed: 'pill-green', pending: 'pill-gold', completed: 'pill-muted', cancelled: 'pill-red' }[status] || 'pill-muted'
}
function statusAccent(status) {
  return { confirmed: 'accent-green', pending: 'accent-gold', completed: 'accent-muted', cancelled: 'accent-red' }[status] || 'accent-muted'
}
function dateBlockClass(status) {
  return { confirmed: 'tint-green', pending: 'tint-gold', completed: 'tint-muted', cancelled: 'tint-muted' }[status] || 'tint-muted'
}

/* ---------- CANCEL MODAL ---------- */
const cancelTarget = ref(null)
const cancelReason = ref('')
function openCancelModal(appt) { cancelTarget.value = appt; cancelReason.value = '' }
function closeCancelModal() { cancelTarget.value = null }
function confirmCancel() {
  if (cancelTarget.value) {
    // TODO: wire up to a real cancel-appointment API call, passing cancelReason.value
    cancelTarget.value.status = 'cancelled'
    cancelTarget.value.timeLabel = 'Cancelled by client'
  }
  closeCancelModal()
}

/* ---------- REVIEW MODAL ---------- */
const reviewTarget = ref(null)
const reviewStars = ref(5)
const reviewText = ref('')
function openReviewModal(appt) { reviewTarget.value = appt; reviewStars.value = 5; reviewText.value = '' }
function closeReviewModal() { reviewTarget.value = null }
function submitReview() {
  // TODO: wire up to a real submit-review API call
  console.log('Review submitted', { apptId: reviewTarget.value?.id, stars: reviewStars.value, text: reviewText.value })
  closeReviewModal()
}
</script>

<style scoped>
* { box-sizing: border-box; }
.appointments-page { font-family: 'Inter', sans-serif; }

.page-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; flex-wrap: wrap; }
.page-title { font-family: 'Playfair Display', serif; font-size: 1.7rem; font-weight: 700; color: #1a3a1a; margin: 0 0 4px; }
.page-count { font-size: 0.85rem; color: #9aaa9a; margin: 0; }

.filter-tabs { display: flex; gap: 4px; background: #fff; padding: 5px; border-radius: 999px; border: 1px solid #eceeec; box-shadow: 0 1px 2px rgba(0,0,0,0.03); width: fit-content; margin-bottom: 20px; }
.filter-tab { border: none; background: none; padding: 8px 18px; border-radius: 999px; font-size: 0.83rem; font-weight: 600; color: #8a9a8a; cursor: pointer; transition: background 0.15s, color 0.15s; }
.filter-tab:hover:not(.active) { background: #f7f9f7; color: #4a5a4a; }
.filter-tab.active { background: #14301a; color: #fff; }

.appt-list { display: flex; flex-direction: column; gap: 12px; }
.empty-state { background: #fff; border-radius: 14px; border: 1px solid #eceeec; padding: 48px 32px; text-align: center; }
.empty-icon { color: #c5d0c5; margin-bottom: 10px; }
.empty-title { font-size: 0.95rem; font-weight: 700; color: #4a5a4a; margin: 0 0 4px; text-transform: capitalize; }
.empty-sub { font-size: 0.83rem; color: #9aaa9a; margin: 0; }

.appt-card {
  background: #fff; border-radius: 14px; padding: 20px 22px; border: 1px solid #eceeec; border-left: 4px solid #eceeec;
  display: flex; align-items: center; gap: 18px; flex-wrap: wrap;
  box-shadow: 0 1px 2px rgba(0,0,0,0.03); transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.appt-card:hover { box-shadow: 0 6px 18px rgba(0,0,0,0.06); }
.appt-card.dimmed { opacity: 0.7; }
.appt-card.accent-green:hover { border-color: #1f8f5c; }
.appt-card.accent-gold { border-left-color: #D4A017; }
.appt-card.accent-gold:hover { border-color: #D4A017; }
.appt-card.accent-green { border-left-color: #1f8f5c; }
.appt-card.accent-red { border-left-color: #e3a49a; }
.appt-card.accent-muted { border-left-color: #d5dad5; }

.appt-date-block { width: 60px; height: 60px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0; }
.tint-green { background: #e3f3ea; }
.tint-green .d-num { color: #1f8f5c; }
.tint-gold { background: #fdf1d6; }
.tint-gold .d-num { color: #b8860b; }
.tint-muted { background: #f2f3f1; }
.tint-muted .d-num { color: #9aaa9a; }
.appt-date-block .d-num { font-weight: 700; font-size: 1.25rem; line-height: 1; }
.appt-date-block .d-mon { font-size: 0.65rem; color: #9aaa9a; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 2px; }

.appt-info { flex: 1; min-width: 200px; }
.appt-info-row { display: flex; align-items: center; gap: 8px; }
.appt-rnd { font-weight: 700; color: #1a3a1a; font-size: 0.94rem; }
.appt-meta { display: flex; align-items: center; gap: 5px; font-size: 0.8rem; color: #9aaa9a; margin: 5px 0 0; }
.appt-meta .dot { margin: 0 1px; }

.modality-icon { width: 34px; height: 34px; border-radius: 50%; color: #1a3a1a; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.modality-icon.tint-green { color: #1f8f5c; }
.modality-icon.tint-gold { color: #b8860b; }
.modality-icon.tint-muted { color: #9aaa9a; }

.appt-actions { display: flex; gap: 8px; flex-wrap: wrap; }

.status-pill { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 12px; white-space: nowrap; }
.pill-green { background: #e3f3ea; color: #1f8f5c; }
.pill-gold { background: #fdf1d6; color: #b8860b; }
.pill-muted { background: #eceeec; color: #8a9a8a; }
.pill-red { background: #fbe5e2; color: #c0392b; }

.primary-btn { background: #D4A017; color: #1a3a1a; border: none; border-radius: 8px; padding: 10px 16px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
.primary-btn.small { padding: 8px 14px; font-size: 0.8rem; }
.outline-btn { border: 1px solid #d5dad5; background: #fff; color: #1a3a1a; border-radius: 8px; padding: 10px 16px; font-weight: 600; font-size: 0.85rem; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; }
.outline-btn.small { padding: 8px 14px; font-size: 0.8rem; }
.outline-btn:hover:not(:disabled) { background: #f7f9f7; }
.outline-btn:disabled { opacity: 0.55; cursor: not-allowed; }
.ghost-btn { background: none; border: none; color: #8a9a8a; font-weight: 600; font-size: 0.85rem; cursor: pointer; padding: 10px 12px; }
.ghost-btn:hover { color: #c0392b; }
.ghost-btn.small { padding: 8px 10px; font-size: 0.8rem; }
.danger-outline-btn { border: 1px solid #c0392b; background: #fff; color: #c0392b; border-radius: 8px; padding: 10px 16px; font-weight: 700; font-size: 0.85rem; cursor: pointer; }

/* MODAL */
.modal-overlay { position: fixed; inset: 0; background: rgba(20,30,20,0.45); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 16px; }
.modal-box { background: #fff; border-radius: 14px; padding: 26px; width: 100%; max-width: 420px; }
.modal-title-row { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
.modal-warn-icon { color: #c0392b; }
.modal-title { font-family: 'Playfair Display', serif; font-size: 1.1rem; color: #1a3a1a; margin: 0 0 14px; }
.modal-title-row .modal-title { margin: 0; }
.field-label { display: block; font-size: 0.82rem; font-weight: 600; color: #4a5a4a; margin-bottom: 8px; }
.optional { font-weight: 400; color: #9aaa9a; }
.modal-box textarea { width: 100%; border: 1px solid #d5dad5; border-radius: 8px; padding: 10px 12px; font-size: 0.85rem; font-family: inherit; resize: vertical; margin-bottom: 16px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
.star-row { display: flex; gap: 6px; justify-content: center; margin-bottom: 16px; }

@media (max-width: 640px) {
  .appt-card { flex-direction: column; align-items: flex-start; }
  .appt-actions { width: 100%; }
}
</style>