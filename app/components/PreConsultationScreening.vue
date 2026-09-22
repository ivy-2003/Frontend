<template>
  <div class="screening-page">
    <div class="panel">
      <h1 class="screening-title">Pre-Consultation Nutritional Screening</h1>
      <p class="screening-sub">Your data auto-computes BMI, BMR, TDEE, and NRS-2002 risk score.</p>

      <div class="form-row-3">
        <div class="field">
          <label>Height (cm)</label>
          <input v-model.number="form.height" type="number" min="50" max="250" placeholder="e.g. 162" />
        </div>
        <div class="field">
          <label>Weight (kg)</label>
          <input v-model.number="form.weight" type="number" min="20" max="300" step="0.1" placeholder="e.g. 72" />
        </div>
        <div class="field">
          <label>Age</label>
          <input v-model.number="form.age" type="number" min="1" max="120" placeholder="e.g. 34" />
        </div>
      </div>

      <div class="form-row-2">
        <div class="field">
          <label>Sex</label>
          <select v-model="form.sex">
            <option value="" disabled>Select sex</option>
            <option>Female</option>
            <option>Male</option>
          </select>
        </div>
        <div class="field">
          <label>Activity Level</label>
          <select v-model="form.activityLevel">
            <option value="" disabled>Select activity level</option>
            <option v-for="level in activityLevels" :key="level">{{ level }}</option>
          </select>
        </div>
      </div>

      <label class="symptoms-label">Current Symptoms (select all that apply)</label>
      <div class="symptoms-grid">
        <label class="checkbox-row">
          <input type="checkbox" v-model="form.weightLoss" />
          Unintended weight loss
        </label>
        <label class="checkbox-row">
          <input type="checkbox" v-model="form.poorAppetite" />
          Poor appetite
        </label>
        <label class="checkbox-row">
          <input type="checkbox" v-model="form.elevatedGlucose" />
          Elevated blood glucose
        </label>
        <label class="checkbox-row">
          <input type="checkbox" v-model="form.recentHospitalization" />
          Recent hospitalization
        </label>
      </div>

      <button class="compute-btn" :disabled="!canCompute" @click="handleCompute">Compute My Health Metrics</button>

      <div v-if="showResults" class="results-panel">
        <span class="results-eyebrow">Auto-Computed Results (Mifflin-St Jeor · WHO Asia-Pacific)</span>
        <div class="results-grid">
          <div class="result-box">
            <p class="result-label">BMI</p>
            <p class="result-value">{{ screening.bmi }}</p>
            <p class="result-tag" :class="bmiTagClass">{{ screening.bmiCategory }}</p>
          </div>
          <div class="result-box">
            <p class="result-label">BMR</p>
            <p class="result-value">{{ screening.bmr }}</p>
            <p class="result-unit">kcal/day</p>
          </div>
          <div class="result-box">
            <p class="result-label">TDEE</p>
            <p class="result-value">{{ screening.tdee }}</p>
            <p class="result-unit">kcal/day</p>
          </div>
          <div class="result-box">
            <p class="result-label">NRS-2002</p>
            <p class="result-value">Score: {{ screening.nrs }}</p>
            <p class="result-tag" :class="nrsTagClass">{{ screening.nrsRiskLabel }}</p>
          </div>
        </div>
      </div>

      <div v-if="showResults" class="complete-banner">
        <p class="complete-title"><CheckCircle2 :size="16" /> Screening Complete</p>
        <p class="complete-text">This summary has been shared with your RND, who will review it before your consultation.</p>
        <p class="complete-text">You can now proceed to find your RND and book a consultation.</p>
        <NuxtLink to="/find-rnd" class="find-rnd-btn">Find an RND <ArrowRight :size="15" /></NuxtLink>
      </div>
    </div>

    <!-- SUCCESS TOAST -->
    <Transition name="toast-fade">
      <div v-if="toastVisible" class="toast">
        <CheckCircle2 :size="16" /> Screening computed and saved!
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { reactive, computed, ref } from 'vue'
import { CheckCircle2, ArrowRight } from 'lucide-vue-next'
import { useClientScreening } from '~/composables/useClientScreening'

// TODO: pull from the real client profile once that endpoint exists.
const rndName = 'RND Ivy Hope Alba'

const activityLevels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active']

const form = reactive({
  height: null,
  weight: null,
  age: null,
  sex: '',
  activityLevel: '',
  weightLoss: false,
  poorAppetite: false,
  elevatedGlucose: false,
  recentHospitalization: false
})

const { screening, submitScreening } = useClientScreening()

const canCompute = computed(() =>
  form.height > 0 && form.weight > 0 && form.age > 0 && form.sex !== '' && form.activityLevel !== ''
)

const showResults = ref(false)
const toastVisible = ref(false)
let toastTimer = null

function handleCompute() {
  if (!canCompute.value) return
  submitScreening({ ...form })
  showResults.value = true

  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { toastVisible.value = false }, 4000)
}

const bmiTagClass = computed(() => {
  if (screening.value.bmiCategory === 'Normal') return 'tag-green'
  if (screening.value.bmiCategory === 'Underweight') return 'tag-blue'
  return 'tag-gold'
})
const nrsTagClass = computed(() => {
  const label = screening.value.nrsRiskLabel
  if (label === 'None' || label === 'Low') return 'tag-gold'
  return 'tag-red'
})
</script>

<style scoped>
* { box-sizing: border-box; }
.screening-page { font-family: 'Inter', sans-serif; max-width: 760px; margin: 0 auto; }

.panel { background: #fff; border-radius: 16px; border: 1px solid #eceeec; padding: 28px 30px; }
.screening-title { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; color: #1a3a1a; margin: 0 0 6px; }
.screening-sub { font-size: 0.87rem; color: #9aaa9a; margin: 0 0 24px; }

.form-row-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }
.form-row-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px; }
.field { display: flex; flex-direction: column; gap: 6px; }
.field label { font-size: 0.82rem; font-weight: 600; color: #6a7a6a; }
.field input, .field select {
  border: 1px solid #d5dad5; border-radius: 8px; padding: 11px 13px; font-size: 0.9rem; font-family: inherit; color: #1a3a1a; width: 100%; background: #fff;
}

.symptoms-label { display: block; font-size: 0.82rem; font-weight: 600; color: #6a7a6a; margin-bottom: 12px; }
.symptoms-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
.checkbox-row { display: flex; align-items: center; gap: 10px; background: #f7f9f7; border-radius: 8px; padding: 12px 14px; font-size: 0.87rem; color: #2a2a2a; cursor: pointer; }
.checkbox-row input { width: 17px; height: 17px; accent-color: #14301a; cursor: pointer; }

.compute-btn { width: 100%; background: #14301a; color: #fff; border: none; border-radius: 999px; padding: 15px; font-weight: 700; font-size: 0.94rem; cursor: pointer; }
.compute-btn:disabled { opacity: 0.5; cursor: not-allowed; }

.results-panel { background: #e3f3ea; border-radius: 12px; padding: 20px 22px; margin-top: 22px; }
.results-eyebrow { display: block; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; font-weight: 700; color: #1f8f5c; margin-bottom: 14px; }
.results-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
.result-box { background: #fff; border-radius: 10px; padding: 14px; text-align: center; }
.result-label { font-size: 0.72rem; color: #9aaa9a; font-weight: 600; margin: 0 0 4px; }
.result-value { font-family: 'Playfair Display', serif; font-size: 1.15rem; font-weight: 700; color: #1a3a1a; margin: 0; }
.result-unit { font-size: 0.72rem; color: #9aaa9a; margin: 3px 0 0; }
.result-tag { font-size: 0.76rem; font-weight: 700; margin: 4px 0 0; }
.tag-green { color: #1f8f5c; }
.tag-gold { color: #b8860b; }
.tag-blue { color: #2a5a8a; }
.tag-red { color: #c0392b; }

.complete-banner { background: #e3f3ea; border-radius: 12px; padding: 16px 20px; margin-top: 14px; }
.complete-title { display: flex; align-items: center; gap: 7px; font-weight: 700; color: #1f8f5c; font-size: 0.9rem; margin: 0 0 5px; }
.complete-text { font-size: 0.84rem; color: #3a6b4a; line-height: 1.5; margin: 0; }
.complete-text + .complete-text { margin-top: 6px; }
.find-rnd-btn {
  display: inline-flex; align-items: center; gap: 6px; background: #14301a; color: #fff; text-decoration: none;
  padding: 10px 18px; border-radius: 8px; font-weight: 700; font-size: 0.85rem; margin-top: 14px;
}

/* TOAST */
.toast {
  position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 200;
  display: flex; align-items: center; gap: 8px; background: #00382a; color: #fff;
  padding: 13px 22px; border-radius: 999px; font-size: 0.86rem; font-weight: 600; box-shadow: 0 8px 24px rgba(0,0,0,0.18);
  white-space: nowrap;
}
.toast-fade-enter-active, .toast-fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.toast-fade-enter-from, .toast-fade-leave-to { opacity: 0; transform: translateX(-50%) translateY(8px); }

@media (max-width: 640px) {
  .form-row-3, .form-row-2, .symptoms-grid, .results-grid { grid-template-columns: 1fr 1fr; }
}
</style>