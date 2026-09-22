// composables/useClientScreening.js
//
// TODO: this is a mock, in-memory store. It resets on page refresh.
// Once the Django API exists, replace the internals of submitScreening()
// with a real POST call and hydrate `screening`/`hasLatestScreening` from
// the API response on app load instead of defaulting to false.
//
// Shared reactive state lives at module scope (outside the exported
// function) so every component that calls useClientScreening() reads and
// writes the SAME refs — that's what lets the screening form update the
// dashboard's "Latest Screening" card without a page reload.

import { ref } from 'vue'

const hasLatestScreening = ref(false)

const screening = ref({
  height: null,        // cm
  weight: null,         // kg
  age: null,
  sex: '',
  activityLevel: '',
  weightLoss: false,
  poorAppetite: false,
  elevatedGlucose: false,
  recentHospitalization: false,
  bmi: null,
  bmiCategory: '',
  bmr: null,
  tdee: null,
  nrs: 0,
  nrsRiskLabel: '',
  lastRecordedDate: ''
})

// Every past screening, most recent first — this is what a "history" or
// "past results" view reads from, distinct from the single `screening`
// ref above which only ever holds the latest one.
const screeningHistory = ref([])

const ACTIVITY_MULTIPLIERS = {
  'Sedentary': 1.2,
  'Lightly Active': 1.375,
  'Moderately Active': 1.55,
  'Very Active': 1.725
}

function computeBmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight'
  if (bmi < 25) return 'Normal'
  if (bmi < 30) return 'Overweight'
  return 'Obese'
}

function computeNrsRiskLabel(score) {
  if (score === 0) return 'None'
  if (score <= 2) return 'Low'
  if (score <= 4) return 'Moderate'
  return 'High'
}

export function useClientScreening() {
  function submitScreening(form) {
    const heightM = form.height / 100
    const bmi = +(form.weight / (heightM * heightM)).toFixed(1)

    // Mifflin-St Jeor (WHO Asia-Pacific activity multipliers)
    const bmr = form.sex === 'Male'
      ? Math.round(10 * form.weight + 6.25 * form.height - 5 * form.age + 5)
      : Math.round(10 * form.weight + 6.25 * form.height - 5 * form.age - 161)

    const multiplier = ACTIVITY_MULTIPLIERS[form.activityLevel] || 1.2
    const tdee = Math.round(bmr * multiplier)

    // Simplified NRS-2002: weighted risk points per flagged symptom.
    let nrs = 0
    if (form.weightLoss) nrs += 1
    if (form.poorAppetite) nrs += 1
    if (form.elevatedGlucose) nrs += 2
    if (form.recentHospitalization) nrs += 2

    screening.value = {
      ...form,
      bmi,
      bmiCategory: computeBmiCategory(bmi),
      bmr,
      tdee,
      nrs,
      nrsRiskLabel: computeNrsRiskLabel(nrs),
      lastRecordedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
    hasLatestScreening.value = true
    screeningHistory.value.unshift({ ...screening.value })
  }

  return { hasLatestScreening, screening, screeningHistory, submitScreening, ACTIVITY_MULTIPLIERS, computeBmiCategory, computeNrsRiskLabel }
}