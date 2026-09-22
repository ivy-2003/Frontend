<template>
  <div class="meal-plan-page">
    <div class="targets-card">
      <div class="targets-header">
        <div>
          <h3 class="targets-title">Daily Nutrition Targets</h3>
          <p class="targets-sub">Recommended intake for today's meal plan.</p>
        </div>
        <span class="progress-pill">{{ completionPct }}% Completed</span>
      </div>
      <div class="targets-grid">
        <div class="target-box">
          <p class="target-label">Calories</p>
          <p class="target-value">{{ plan.calories.toLocaleString() }}</p>
        </div>
        <div class="target-box">
          <p class="target-label">Carbs</p>
          <p class="target-value gold">{{ plan.carbs }}g</p>
        </div>
        <div class="target-box">
          <p class="target-label">Protein</p>
          <p class="target-value green">{{ plan.protein }}g</p>
        </div>
        <div class="target-box">
          <p class="target-label">Fat</p>
          <p class="target-value brown">{{ plan.fat }}g</p>
        </div>
      </div>
    </div>

    <div class="notes-panel">
      <p class="notes-title">{{ plan.rndName }}'s Notes</p>
      <p class="notes-text">{{ plan.notes }}</p>
    </div>

    <div class="meal-tabs">
      <button
        v-for="(meal, i) in meals" :key="meal.name"
        class="meal-tab" :class="{ active: activeMealIndex === i }"
        @click="activeMealIndex = i"
      >
        {{ meal.name }}
      </button>
    </div>

    <div class="meal-card">
      <div class="meal-header">
        <div>
          <h3 class="meal-name">{{ activeMeal.name }}</h3>
          <p class="meal-time">Scheduled Time: {{ activeMeal.time }}</p>
        </div>
        <span class="status-pill" :class="activeMeal.status === 'followed' ? 'pill-green' : 'pill-gold'">{{ activeMeal.status === 'followed' ? 'Followed' : 'Pending' }}</span>
      </div>

      <div class="meal-body">
        <div class="meal-col">
          <span class="col-eyebrow">Planned Meal</span>
          <div class="planned-item" v-for="item in activeMeal.planned" :key="item.name">
            <span class="planned-dot" :class="{ watch: item.watch }"></span>
            {{ item.name }}
          </div>
        </div>

        <div class="meal-col">
          <span class="col-eyebrow">Actual Food Intake</span>
          <label class="dropzone-inline">
            <input type="file" accept="image/*" class="dropzone-input" @change="onMealPhotoSelected(activeMeal, $event)" />
            <UploadCloud :size="20" class="dropzone-icon" />
            <span class="dropzone-text"><template v-if="activeMeal.photoName">{{ activeMeal.photoName }}</template><template v-else>Upload a photo of what you ate</template></span>
          </label>
          <div class="meal-log-row">
            <div class="field">
              <label>Time Logged</label>
              <div class="time-input-wrap">
                <input v-model="activeMeal.timeLogged" type="time" />
                <Clock :size="14" class="time-icon" />
              </div>
            </div>
            <div class="field">
              <label>Meal Status</label>
              <select v-model="activeMeal.mealStatus">
                <option value="">Select status</option>
                <option v-for="s in mealStatusOptions" :key="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <div v-if="activeMeal.mealStatus === 'Partially Followed' || activeMeal.mealStatus === 'Did Not Follow'" class="field notes-field">
            <label>Reason / Notes</label>
            <textarea v-model="activeMeal.reasonNotes" rows="2" placeholder="e.g. Ran out of time, ate something else instead..."></textarea>
          </div>

          <button v-if="activeMeal.mealStatus" class="save-log-btn" @click="saveMealLog(activeMeal)">
            <Save :size="15" /> Save
          </button>
        </div>
      </div>
    </div>

    <!-- SAVE TOAST -->
    <Transition name="toast-fade">
      <div v-if="toastVisible" class="toast">
        <CheckCircle2 :size="16" /> {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Clock, UploadCloud, Save, CheckCircle2 } from 'lucide-vue-next'

// TODO: local mock data — move into the shared mock db (db.mealPlan)
// once the client-side data model is defined, and swap in a real API call.
const plan = ref({
  rndName: 'RND Alba',
  dietType: 'Diabetes diet',
  preparedDate: 'Apr 21, 2026',
  calories: 1800,
  carbs: 180,
  protein: 75,
  fat: 50,
  notes: 'Limit rice intake to ½ cup per meal. Avoid sugary beverages and increase water intake to at least 8 glasses daily. Include more vegetables and monitor food intake consistently.'
})

const mealStatusOptions = ['Followed Plan', 'Partially Followed', 'Did Not Follow']

const meals = ref([
  {
    name: 'Breakfast', time: '7:00 AM', status: 'followed',
    planned: [{ name: 'Sinangag ½ cup' }, { name: 'Boiled Egg' }, { name: 'Kamatis', watch: true }],
    photoName: 'breakfast-photo.jpg', photoFile: null, timeLogged: '07:15', mealStatus: 'Followed Plan', reasonNotes: ''
  },
  {
    name: 'AM Snack', time: '10:00 AM', status: 'pending',
    planned: [{ name: 'Banana Saba ½ pc' }],
    photoName: '', photoFile: null, timeLogged: '', mealStatus: '', reasonNotes: ''
  },
  {
    name: 'Lunch', time: '12:00 PM', status: 'pending',
    planned: [{ name: 'Brown Rice ½ cup' }, { name: 'Grilled Chicken' }, { name: 'Ampalaya', watch: true }],
    photoName: '', photoFile: null, timeLogged: '', mealStatus: '', reasonNotes: ''
  },
  {
    name: 'PM Snack', time: '3:00 PM', status: 'pending',
    planned: [{ name: 'Unsweetened Yogurt 100g' }],
    photoName: '', photoFile: null, timeLogged: '', mealStatus: '', reasonNotes: ''
  },
  {
    name: 'Dinner', time: '7:00 PM', status: 'pending',
    planned: [{ name: 'Brown Rice ½ cup' }, { name: 'Tinolang Manok' }],
    photoName: '', photoFile: null, timeLogged: '', mealStatus: '', reasonNotes: ''
  }
])

function onMealPhotoSelected(meal, e) {
  const file = e.target.files?.[0]
  if (file) {
    meal.photoFile = file
    meal.photoName = file.name
  }
}

/* ---------- SAVE + NOTIFY RND ---------- */
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer = null
function saveMealLog(meal) {
  // TODO: wire up to a real save-meal-log API call (notifies the RND)
  console.log('Meal log saved', {
    meal: meal.name, status: meal.mealStatus, timeLogged: meal.timeLogged, reasonNotes: meal.reasonNotes, photo: meal.photoName
  })
  meal.status = meal.mealStatus === 'Followed Plan' ? 'followed' : 'pending'

  toastMessage.value = `${meal.name} log saved & sent to ${plan.value.rndName}!`
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 4000)
}

const activeMealIndex = ref(0)
const activeMeal = computed(() => meals.value[activeMealIndex.value])

const completionPct = computed(() => {
  const followed = meals.value.filter(m => m.status === 'followed').length
  return Math.round((followed / meals.value.length) * 100)
})
</script>

<style scoped>
* { box-sizing: border-box; }
.meal-plan-page { font-family: 'Inter', sans-serif; }

.targets-card { background: #fff; border: 1px solid #eceeec; border-radius: 16px; padding: 26px 28px; margin-bottom: 22px; }
.targets-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 22px; }
.targets-title { font-family: 'Playfair Display', serif; font-size: 1.25rem; color: #1a3a1a; margin: 0 0 5px; }
.targets-sub { font-size: 0.9rem; color: #9aaa9a; margin: 0; }
.progress-pill { font-size: 0.82rem; font-weight: 700; background: #e3f3ea; color: #1f8f5c; padding: 6px 15px; border-radius: 999px; white-space: nowrap; }

.targets-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.target-box { background: #f7f9f7; border: 1px solid #eceeec; border-radius: 12px; padding: 18px; }
.target-label { font-size: 0.76rem; letter-spacing: 0.06em; text-transform: uppercase; color: #9aaa9a; font-weight: 700; margin: 0 0 8px; }
.target-value { font-family: 'Playfair Display', serif; font-size: 1.65rem; font-weight: 700; color: #1a3a1a; margin: 0; }
.target-value.gold { color: #D4A017; }
.target-value.green { color: #1f8f5c; }
.target-value.brown { color: #b8860b; }

.notes-panel { background: #fdf1d6; border-left: 4px solid #D4A017; border-radius: 12px; padding: 20px 24px; margin-bottom: 24px; }
.notes-title { font-weight: 700; color: #b8860b; font-size: 0.92rem; letter-spacing: 0.03em; margin: 0 0 8px; }
.notes-text { font-size: 0.95rem; color: #5a5240; line-height: 1.65; margin: 0; }

.meal-tabs { display: flex; gap: 6px; margin-bottom: 16px; flex-wrap: wrap; }
.meal-tab {
  display: inline-flex; align-items: center; gap: 8px; border: 1px solid #eceeec; background: #fff;
  padding: 10px 18px; border-radius: 999px; font-size: 0.88rem; font-weight: 600; color: #6a7a6a; cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.meal-tab:hover:not(.active) { background: #f7f9f7; }
.meal-tab.active { background: #14301a; border-color: #14301a; color: #fff; }
.tab-status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dot-green { background-color: #1f8f5c; }
.dot-gold { background-color: #D4A017; }

.meal-card { background: #fff; border: 1px solid #eceeec; border-radius: 16px; overflow: hidden; margin-bottom: 20px; }
.meal-header { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 20px 28px; background: #f2f7f3; }
.meal-name { font-family: 'Playfair Display', serif; font-size: 1.2rem; color: #1a3a1a; margin: 0; }
.meal-time { font-size: 0.86rem; color: #9aaa9a; margin: 3px 0 0; }

.meal-body { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; padding: 26px 28px; }
.col-eyebrow { display: block; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; color: #1e4a26; margin-bottom: 16px; }

.planned-item { display: flex; align-items: center; gap: 12px; background: #f7f9f7; border: 1px solid #eceeec; border-radius: 10px; padding: 14px 16px; font-size: 0.94rem; color: #2a2a2a; margin-bottom: 10px; }
.planned-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #D4A017; flex-shrink: 0; }
.planned-dot.watch { background-color: #c0392b; }

.dropzone-inline {
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px;
  background: #f7f9f7; border: 1.5px dashed #b8c8b8; border-radius: 10px;
  min-height: 84px; padding: 20px; cursor: pointer; margin-bottom: 16px; text-align: center;
}
.dropzone-input { display: none; }
.dropzone-icon { color: #1a5a2a; flex-shrink: 0; }
.dropzone-text { font-size: 0.92rem; color: #4a5a4a; }
.meal-log-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.field label { display: block; font-size: 0.8rem; letter-spacing: 0.05em; text-transform: uppercase; font-weight: 700; color: #9aaa9a; margin-bottom: 8px; }
.field select {
  width: 100%; border: 1px solid #d5dad5; border-radius: 8px; padding: 12px 14px; font-size: 0.92rem; font-family: inherit; color: #2a2a2a; background: #fff;
}
.time-input-wrap { position: relative; }
.time-input-wrap input { width: 100%; border: 1px solid #d5dad5; border-radius: 8px; padding: 12px 34px 12px 14px; font-size: 0.92rem; font-family: inherit; color: #2a2a2a; }
.time-icon { position: absolute; right: 11px; top: 50%; transform: translateY(-50%); color: #9aaa9a; pointer-events: none; }

.status-pill { font-size: 0.8rem; font-weight: 700; padding: 5px 13px; border-radius: 12px; white-space: nowrap; }
.pill-green { background: #e3f3ea; color: #1f8f5c; }
.pill-gold { background: #fdf1d6; color: #b8860b; }

.notes-field { margin-top: 16px; }
.notes-field textarea {
  width: 100%; border: 1px solid #d5dad5; border-radius: 8px; padding: 10px 12px; font-size: 0.88rem; font-family: inherit; color: #2a2a2a; resize: vertical;
}

.save-log-btn {
  display: inline-flex; align-items: center; gap: 7px; background: #14301a; color: #fff; border: none;
  border-radius: 8px; padding: 11px 20px; font-weight: 700; font-size: 0.87rem; cursor: pointer; margin-top: 18px;
}
.save-log-btn:hover { background: #1c421f; }

/* TOAST */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 200;
  display: flex; align-items: center; gap: 8px; background: #00382a; color: #fff;
  padding: 13px 22px; border-radius: 10px; font-size: 0.86rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  white-space: nowrap;
}
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

@media (max-width: 800px) {
  .targets-grid { grid-template-columns: repeat(2, 1fr); }
  .meal-body { grid-template-columns: 1fr; }
}
</style>