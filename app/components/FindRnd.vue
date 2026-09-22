<template>
  <div class="find-rnd-page">
    <!-- FILTER BAR -->
    <div class="filter-bar">
      <div class="filter-row">
        <div class="field">
          <label>Specialization</label>
          <select v-model="specialization">
            <option>All Specializations</option>
            <option v-for="s in specializations" :key="s">{{ s }}</option>
          </select>
        </div>
        <div class="field">
          <label>Language</label>
          <select v-model="language">
            <option>Any Language</option>
            <option v-for="l in languages" :key="l">{{ l }}</option>
          </select>
        </div>
        <div class="field">
          <label>Consultation Mode</label>
          <select v-model="mode">
            <option>Any Mode</option>
            <option v-for="m in modes" :key="m">{{ m }}</option>
          </select>
        </div>
        <button class="search-btn"><Search :size="15" /> Search</button>
      </div>
    </div>

    <div class="results-row">
      <p class="results-count">Showing {{ filteredRnds.length }} of {{ totalRnds }}+ verified RNDs</p>
      <select v-model="sortBy" class="sort-select">
        <option>Sort: Highest Rated</option>
        <option>Sort: Most Reviews</option>
        <option>Sort: Lowest Fee</option>
      </select>
    </div>

    <!-- RND CARD GRID -->
    <div class="rnd-grid">
      <div v-for="rnd in sortedRnds" :key="rnd.name" class="rnd-card">
        <div class="rnd-card-top">
          <div class="rnd-avatar" :style="{ background: rnd.avatarColor, color: rnd.avatarTextColor || '#fff' }">{{ rnd.initials }}</div>
          <div>
            <p class="rnd-name">{{ rnd.name }} <BadgeCheck :size="13" class="verified-icon" /></p>
            <p class="rnd-specialty">{{ rnd.specialty }}</p>
            <p class="rnd-rating">★ {{ rnd.rating }} <span class="rnd-review-count">({{ rnd.reviews }} reviews)</span></p>
          </div>
        </div>
        <p class="rnd-desc">{{ rnd.description }}</p>
        <div class="rnd-tags">
          <span v-for="lang in rnd.languages" :key="lang" class="lang-chip">{{ lang }}</span>
          <span class="mode-pill"><component :is="modeIcon(rnd.consultMode)" :size="12" /> {{ rnd.consultMode }}</span>
        </div>
        <div class="rnd-footer">
          <span class="rnd-price">₱{{ rnd.fee }}<span class="rnd-price-unit">/session</span></span>
          <button class="outline-btn" @click="navigateTo(`/rnd-profile-view?rnd=${rnd.name}`)">View Profile</button>
        </div>
      </div>
    </div>

    <!-- PAGINATION -->
    <div class="pagination-row">
      <button class="page-btn" :disabled="page === 1" @click="page--"><ChevronLeft :size="14" /> Prev</button>
      <span class="page-current">Page {{ page }}</span>
      <button class="page-btn page-btn-primary" @click="page++">Next <ChevronRight :size="14" /></button>
    </div>
  </div>
</template>

<script setup>
import { Search, BadgeCheck, Video, MessageCircle, Users, ChevronLeft, ChevronRight } from 'lucide-vue-next'

// TODO: this is local mock data — there's no public RND directory in
// mockDatabase.js yet. Move this into the shared mock db once the
// client-facing RND directory data model is defined.
const rnds = ref([
  { name: 'RND Ivy Hope Alba', initials: 'IA', avatarColor: '#1e4a26', specialty: 'Diabetes · Renal Nutrition', rating: 4.9, reviews: 38, description: 'Specializes in diabetic and renal MNT with a decade of clinical hospital experience.', languages: ['Cebuano', 'English'], consultMode: 'Video', fee: 800 },
  { name: 'RND Marco Reyes', initials: 'MR', avatarColor: '#D4A017', avatarTextColor: '#1a3a1a', specialty: 'Hypertension · Cardiac Care', rating: 4.8, reviews: 27, description: 'Focused on DASH-aligned meal planning for hypertensive and post-cardiac patients.', languages: ['Tagalog', 'English'], consultMode: 'Chat', fee: 650 },
  { name: 'RND Camille Tan', initials: 'CT', avatarColor: '#7aa87a', specialty: 'Weight Management', rating: 4.7, reviews: 19, description: 'Behavior-based weight management approach combining FNRI exchanges and habit coaching.', languages: ['Ilocano', 'English'], consultMode: 'In-Person', fee: 700 },
  { name: 'RND Dexter Paz', initials: 'DP', avatarColor: '#3a6b3a', specialty: 'Pediatric Nutrition', rating: 5.0, reviews: 12, description: 'Supports growth monitoring and dietary diversity scoring for children under 12.', languages: ['Tagalog', 'Cebuano'], consultMode: 'Video', fee: 750 },
  { name: 'RND Lara Mendoza', initials: 'LM', avatarColor: '#f0dca8', avatarTextColor: '#1a3a1a', specialty: 'General Practice', rating: 4.6, reviews: 45, description: 'Generalist MNT practice with a strong record across diverse dietary conditions.', languages: ['English'], consultMode: 'Chat', fee: 600 },
  { name: 'RND Rico Santos', initials: 'RS', avatarColor: '#00382a', specialty: 'Renal Nutrition', rating: 4.9, reviews: 31, description: 'Dialysis-stage renal diet specialist working closely with nephrology referrals.', languages: ['Tagalog', 'English'], consultMode: 'In-Person', fee: 900 }
])

const totalRnds = 200

const specializations = ['Diabetes Management', 'Renal Nutrition', 'Hypertension & Cardiac Care', 'Weight Management', 'Pediatric Nutrition']
const languages = ['Tagalog', 'Cebuano', 'Ilocano', 'English']
const modes = ['Video', 'Chat', 'In-Person']

const specialization = ref('All Specializations')
const language = ref('Any Language')
const mode = ref('Any Mode')
const sortBy = ref('Sort: Highest Rated')
const page = ref(1)

const filteredRnds = computed(() => {
  return rnds.value.filter(r => {
    const matchesSpec = specialization.value === 'All Specializations' || r.specialty.includes(specialization.value.split(' ')[0])
    const matchesLang = language.value === 'Any Language' || r.languages.includes(language.value)
    const matchesMode = mode.value === 'Any Mode' || r.consultMode === mode.value
    return matchesSpec && matchesLang && matchesMode
  })
})

const sortedRnds = computed(() => {
  const list = [...filteredRnds.value]
  if (sortBy.value === 'Sort: Highest Rated') return list.sort((a, b) => b.rating - a.rating)
  if (sortBy.value === 'Sort: Most Reviews') return list.sort((a, b) => b.reviews - a.reviews)
  if (sortBy.value === 'Sort: Lowest Fee') return list.sort((a, b) => a.fee - b.fee)
  return list
})

function modeIcon(m) {
  if (m === 'Video') return Video
  if (m === 'Chat') return MessageCircle
  return Users
}
</script>

<style scoped>
* { box-sizing: border-box; }

.find-rnd-page { font-family: 'Inter', sans-serif; }

/* FILTER BAR */
.filter-bar { background: #fff; border-radius: 14px; border: 1px solid #eceeec; padding: 20px; margin-bottom: 20px; }
.filter-row { display: grid; grid-template-columns: 1.4fr 1fr 1fr auto; gap: 16px; align-items: end; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.78rem; font-weight: 600; color: #4a5a4a; }
.field select { border: 1px solid #d5dad5; border-radius: 8px; padding: 11px 12px; font-size: 0.85rem; font-family: inherit; color: #2a2a2a; background: #fff; cursor: pointer; }
.search-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  background: #14301a; color: #fff; border: none; border-radius: 8px;
  padding: 11px 20px; font-weight: 700; font-size: 0.85rem; cursor: pointer; white-space: nowrap;
}

/* RESULTS ROW */
.results-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.results-count { font-size: 0.85rem; color: #6a7a6a; margin: 0; }
.sort-select { border: 1px solid #d5dad5; border-radius: 8px; padding: 9px 12px; font-size: 0.83rem; color: #2a2a2a; background: #fff; cursor: pointer; }

/* RND GRID */
.rnd-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; margin-bottom: 24px; }
.rnd-card {
  background: #fff; border-radius: 14px; border: 1.5px solid #eceeec; padding: 22px;
  display: flex; flex-direction: column; transition: border-color 0.15s ease, box-shadow 0.15s ease;
}
.rnd-card:hover { border-color: #1f8f5c; box-shadow: 0 4px 14px rgba(31,143,92,0.1); }

.rnd-card-top { display: flex; gap: 14px; margin-bottom: 14px; }
.rnd-avatar { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
.rnd-name { display: flex; align-items: center; gap: 5px; font-weight: 700; color: #1a3a1a; margin: 0; font-size: 0.92rem; }
.verified-icon { color: #D4A017; }
.rnd-specialty { font-size: 0.78rem; color: #8a9a8a; margin: 3px 0 0; }
.rnd-rating { font-size: 0.8rem; color: #b8860b; font-weight: 700; margin: 3px 0 0; }
.rnd-review-count { color: #9aaa9a; font-weight: 400; }

.rnd-desc { font-size: 0.83rem; color: #6a7a6a; line-height: 1.5; margin: 0 0 14px; flex: 1; }

.rnd-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
.lang-chip { font-size: 0.7rem; background: #eef3ec; color: #1a5a2a; padding: 3px 10px; border-radius: 20px; font-weight: 600; }
.mode-pill { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; background: #e3ecf7; color: #2a5a8a; padding: 3px 10px; border-radius: 20px; font-weight: 600; }

.rnd-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid #f0f2f0; }
.rnd-price { font-weight: 700; color: #1a3a1a; font-size: 0.92rem; }
.rnd-price-unit { font-size: 0.72rem; font-weight: 400; color: #9aaa9a; }
.outline-btn { border: 1px solid #d5dad5; background: #fff; color: #1a3a1a; border-radius: 8px; padding: 8px 16px; font-weight: 600; font-size: 0.82rem; cursor: pointer; }

/* PAGINATION */
.pagination-row { display: flex; align-items: center; justify-content: center; gap: 16px; }
.page-btn { display: flex; align-items: center; gap: 4px; border: 1px solid #d5dad5; background: #fff; color: #4a5a4a; border-radius: 8px; padding: 9px 16px; font-size: 0.83rem; font-weight: 600; cursor: pointer; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-btn-primary { background: #14301a; color: #fff; border-color: #14301a; }
.page-current { font-size: 0.85rem; color: #4a5a4a; font-weight: 600; }

@media (max-width: 1150px) {
  .rnd-grid { grid-template-columns: repeat(2, 1fr); }
  .filter-row { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 700px) {
  .rnd-grid { grid-template-columns: 1fr; }
  .filter-row { grid-template-columns: 1fr; }
}
</style>