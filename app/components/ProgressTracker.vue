<template>
  <div class="progress-page">
    <div class="toolbar-row">
      <div class="range-dropdown" ref="rangeDropdownEl">
        <button class="range-trigger" @click="rangeDropdownOpen = !rangeDropdownOpen">
          {{ selectedRange }} <ChevronDown :size="14" :class="{ open: rangeDropdownOpen }" />
        </button>
        <div v-if="rangeDropdownOpen" class="range-menu">
          <button v-for="r in ranges" :key="r" class="range-item" :class="{ active: selectedRange === r }" @click="selectedRange = r; rangeDropdownOpen = false">{{ r }}</button>
        </div>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon"><Scale :size="16" /></div>
        <p class="stat-value">{{ latest.weight }} <span class="unit">kg</span></p>
        <p class="stat-label">Latest Weight</p>
        <p class="stat-delta down">↓ {{ weightDelta }} kg total</p>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><Activity :size="16" /></div>
        <p class="stat-value">{{ latest.bmi }}</p>
        <p class="stat-label">Latest BMI</p>
        <p class="stat-delta down">↓ {{ bmiDelta }} since start</p>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><HeartPulse :size="16" /></div>
        <p class="stat-value">{{ latest.systolic }}/{{ latest.diastolic }}</p>
        <p class="stat-label">Blood Pressure</p>
        <span class="status-pill pill-green">✓ Within range</span>
      </div>
      <div class="stat-card">
        <div class="stat-icon"><Droplet :size="16" /></div>
        <p class="stat-value">{{ latest.glucose }} <span class="unit">mg/dL</span></p>
        <p class="stat-label">Fasting Glucose</p>
        <p class="stat-delta down">↓ {{ glucoseDelta }} mg/dL improved</p>
      </div>
    </div>

    <!-- CHARTS -->
    <div class="chart-grid">
      <div class="panel">
        <h3 class="chart-title">Weight Trend (kg)</h3>
        <svg viewBox="0 0 460 190" width="100%" class="chart-svg">
          <defs><linearGradient id="gradWeight" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a3a1a" stop-opacity=".18" /><stop offset="100%" stop-color="#1a3a1a" stop-opacity="0" /></linearGradient></defs>
          <g v-for="(gl, i) in gridLines" :key="'gw'+i"><line :x1="40" :x2="440" :y1="gl.y" :y2="gl.y" stroke="#f0f2f0" /><text :x="34" :y="gl.y + 3" font-size="9" fill="#aab5aa" text-anchor="end" font-family="Inter, sans-serif">{{ gl.label(weightChart) }}</text></g>
          <polygon :points="weightChart.fillPoints" fill="url(#gradWeight)" />
          <polyline :points="weightChart.points" stroke="#1a3a1a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="(p, i) in weightChart.dots" :key="i" :cx="p.x" :cy="p.y" r="3.5" fill="#1a3a1a" />
          <text v-for="(p, i) in weightChart.dots" :key="'l'+i" :x="p.x" y="182" font-size="10" fill="#8aaa8a" text-anchor="middle" font-family="Inter, sans-serif">{{ months[i] }}</text>
        </svg>
      </div>

      <div class="panel">
        <h3 class="chart-title gold">BMI Trend</h3>
        <svg viewBox="0 0 460 190" width="100%" class="chart-svg">
          <defs><linearGradient id="gradBmi" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#D4A017" stop-opacity=".22" /><stop offset="100%" stop-color="#D4A017" stop-opacity="0" /></linearGradient></defs>
          <g v-for="(gl, i) in gridLines" :key="'gb'+i"><line :x1="40" :x2="440" :y1="gl.y" :y2="gl.y" stroke="#f0f2f0" /><text :x="34" :y="gl.y + 3" font-size="9" fill="#aab5aa" text-anchor="end" font-family="Inter, sans-serif">{{ gl.label(bmiChart) }}</text></g>
          <polygon :points="bmiChart.fillPoints" fill="url(#gradBmi)" />
          <polyline :points="bmiChart.points" stroke="#D4A017" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="(p, i) in bmiChart.dots" :key="i" :cx="p.x" :cy="p.y" r="3.5" fill="#D4A017" />
          <text v-for="(p, i) in bmiChart.dots" :key="'l'+i" :x="p.x" y="182" font-size="10" fill="#c9ad6b" text-anchor="middle" font-family="Inter, sans-serif">{{ months[i] }}</text>
        </svg>
      </div>

      <div class="panel">
        <h3 class="chart-title">Blood Pressure (mmHg)</h3>
        <svg viewBox="0 0 460 190" width="100%" class="chart-svg">
          <g v-for="(gl, i) in gridLines" :key="'gp'+i"><line :x1="40" :x2="440" :y1="gl.y" :y2="gl.y" stroke="#f0f2f0" /><text :x="34" :y="gl.y + 3" font-size="9" fill="#aab5aa" text-anchor="end" font-family="Inter, sans-serif">{{ gl.label(systolicChart) }}</text></g>
          <polyline :points="systolicChart.points" stroke="#1a3a1a" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="(p, i) in systolicChart.dots" :key="'s'+i" :cx="p.x" :cy="p.y" r="3.5" fill="#1a3a1a" />
          <polyline :points="diastolicChart.points" stroke="#D4A017" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="(p, i) in diastolicChart.dots" :key="'d'+i" :cx="p.x" :cy="p.y" r="3.5" fill="#D4A017" />
          <text v-for="(p, i) in systolicChart.dots" :key="'l'+i" :x="p.x" y="182" font-size="10" fill="#8aaa8a" text-anchor="middle" font-family="Inter, sans-serif">{{ months[i] }}</text>
        </svg>
        <div class="chart-legend">
          <span class="legend-item"><span class="legend-dot" style="background:#1a3a1a"></span> Systolic</span>
          <span class="legend-item"><span class="legend-dot" style="background:#D4A017"></span> Diastolic</span>
        </div>
      </div>

      <div class="panel">
        <h3 class="chart-title red">Fasting Blood Glucose (mg/dL)</h3>
        <svg viewBox="0 0 460 190" width="100%" class="chart-svg">
          <defs><linearGradient id="gradGlucose" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c0392b" stop-opacity=".18" /><stop offset="100%" stop-color="#c0392b" stop-opacity="0" /></linearGradient></defs>
          <g v-for="(gl, i) in gridLines" :key="'gg'+i"><line :x1="40" :x2="440" :y1="gl.y" :y2="gl.y" stroke="#f0f2f0" /><text :x="34" :y="gl.y + 3" font-size="9" fill="#aab5aa" text-anchor="end" font-family="Inter, sans-serif">{{ gl.label(glucoseChart) }}</text></g>
          <polygon :points="glucoseChart.fillPoints" fill="url(#gradGlucose)" />
          <polyline :points="glucoseChart.points" stroke="#c0392b" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <circle v-for="(p, i) in glucoseChart.dots" :key="i" :cx="p.x" :cy="p.y" r="3.5" fill="#c0392b" />
          <text v-for="(p, i) in glucoseChart.dots" :key="'l'+i" :x="p.x" y="182" font-size="10" fill="#e0a89f" text-anchor="middle" font-family="Inter, sans-serif">{{ months[i] }}</text>
        </svg>
      </div>
    </div>

    <!-- RECORD HISTORY -->
    <div class="panel">
      <h3 class="chart-title">Record History</h3>
      <table class="history-table">
        <thead>
          <tr><th>DATE</th><th>WEIGHT</th><th>BMI</th><th>BP</th><th>GLUCOSE</th></tr>
        </thead>
        <tbody>
          <tr v-for="row in reversedHistory" :key="row.date">
            <td class="date-cell">{{ row.date }}</td>
            <td>{{ row.weight }} kg</td>
            <td>{{ row.bmi }}</td>
            <td>{{ row.systolic }}/{{ row.diastolic }}</td>
            <td>{{ row.glucose }} mg/dL</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Scale, Activity, HeartPulse, Droplet, ChevronDown } from 'lucide-vue-next'

// TODO: local mock data — move into the shared mock db (db.progressHistory)
// once the client-side data model is defined, and swap in a real API call.
const history = ref([
  { date: 'Mar 12, 2026', weight: 72.3, bmi: 24.9, systolic: 128, diastolic: 82, glucose: 130 },
  { date: 'Apr 18, 2026', weight: 70.5, bmi: 24.2, systolic: 124, diastolic: 80, glucose: 126 },
  { date: 'May 20, 2026', weight: 69.0, bmi: 23.7, systolic: 120, diastolic: 78, glucose: 118 },
  { date: 'Jun 15, 2026', weight: 68.2, bmi: 23.4, systolic: 118, diastolic: 76, glucose: 112 }
])
const reversedHistory = computed(() => [...history.value].reverse())
const months = ['Mar', 'Apr', 'May', 'Jun']

const latest = computed(() => history.value[history.value.length - 1])
const first = computed(() => history.value[0])
const weightDelta = computed(() => (first.value.weight - latest.value.weight).toFixed(1))
const bmiDelta = computed(() => (first.value.bmi - latest.value.bmi).toFixed(1))
const glucoseDelta = computed(() => first.value.glucose - latest.value.glucose)

const ranges = ['Last 3 Months', 'Last 6 Months', 'Last Year']
const selectedRange = ref('Last 6 Months')
const rangeDropdownOpen = ref(false)
const rangeDropdownEl = ref(null)
function handleClickOutside(e) {
  if (rangeDropdownEl.value && !rangeDropdownEl.value.contains(e.target)) rangeDropdownOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

function buildChart(values, padTop = 15, padBottom = 25) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = (max - min) || 1
  const chartW = 400
  const chartH = 190 - padTop - padBottom
  const dots = values.map((v, i) => ({
    x: 40 + (i / (values.length - 1)) * chartW,
    y: padTop + chartH - ((v - min) / range) * chartH,
    value: v
  }))
  const points = dots.map(p => `${p.x},${p.y}`).join(' ')
  const fillPoints = points + ` ${dots[dots.length - 1].x},${padTop + chartH} ${dots[0].x},${padTop + chartH}`
  return { dots, points, fillPoints, min, max }
}

const weightChart = computed(() => buildChart(history.value.map(h => h.weight)))
const bmiChart = computed(() => buildChart(history.value.map(h => h.bmi)))
const glucoseChart = computed(() => buildChart(history.value.map(h => h.glucose)))
const systolicChart = computed(() => buildChart(history.value.map(h => h.systolic)))
const diastolicChart = computed(() => buildChart(history.value.map(h => h.diastolic)))

const gridLines = [
  { y: 15, label: c => c.max },
  { y: 15 + (190 - 40) / 3, label: c => Math.round(c.max - (c.max - c.min) / 3) },
  { y: 15 + 2 * (190 - 40) / 3, label: c => Math.round(c.min + (c.max - c.min) / 3) },
  { y: 165, label: c => c.min }
]
</script>

<style scoped>
* { box-sizing: border-box; }
.progress-page { font-family: 'Inter', sans-serif; }

.toolbar-row { display: flex; justify-content: flex-end; margin-bottom: 16px; }
.range-dropdown { position: relative; }
.range-trigger { display: inline-flex; align-items: center; gap: 6px; border: 1px solid #d5dad5; background: #fff; color: #1a3a1a; border-radius: 8px; padding: 9px 14px; font-size: 0.83rem; font-weight: 600; cursor: pointer; }
.range-trigger svg.open { transform: rotate(180deg); }
.range-menu { position: absolute; top: calc(100% + 6px); right: 0; z-index: 20; min-width: 160px; background: #fff; border: 1px solid #eceeec; border-radius: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 6px; }
.range-item { display: block; width: 100%; text-align: left; border: none; background: none; padding: 9px 12px; border-radius: 8px; font-size: 0.83rem; font-weight: 600; color: #4a5a4a; cursor: pointer; }
.range-item:hover { background: #f7f9f7; }
.range-item.active { background: #eef3ee; color: #14301a; }

/* STAT CARDS */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 15px; }
.stat-card { background: #fff; border-radius: 14px; padding: 18px 20px; border: 1px solid #eceeec; }
.stat-icon { width: 32px; height: 32px; border-radius: 9px; background: #eef3ec; display: flex; align-items: center; justify-content: center; color: #1e4a26; margin-bottom: 10px; }
.stat-value { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; color: #1a3a1a; margin: 0; }
.unit { font-size: 0.78rem; font-weight: 400; color: #9aaa9a; }
.stat-label { font-size: 0.78rem; color: #8a9a8a; margin: 3px 0 6px; }
.stat-delta { font-size: 0.76rem; font-weight: 700; margin: 0; }
.stat-delta.down { color: #1f8f5c; }
.status-pill { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 12px; }
.pill-green { background: #e3f3ea; color: #1f8f5c; }

/* CHARTS */
.chart-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 20px; }
.panel { background: #fff; border-radius: 14px; border: 1px solid #eceeec; padding: 15px 130px; margin-bottom: 16px; }
.chart-title { font-family: 'Playfair Display', serif; font-size: 0.98rem; color: #1a3a1a; margin: 0 0 12px; }
.chart-title.gold { color: #b8860b; }
.chart-title.red { color: #c0392b; }
.chart-svg { overflow: visible; }
.chart-legend { display: flex; gap: 5px; margin-top: 5px; }
.legend-item { display: flex; align-items: center; gap: 3px; font-size: 0.70rem; color: #6a7a6a; font-weight: 400; }
.legend-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }

/* HISTORY TABLE */
.history-table { width: 100%; border-collapse: collapse; }
.history-table th { text-align: left; font-size: 0.7rem; letter-spacing: 0.05em; color: #9aaa9a; font-weight: 700; padding: 0 16px 10px 0; }
.history-table td { padding: 12px 16px 12px 0; border-top: 1px solid #f2f4f2; font-size: 0.85rem; color: #2a2a2a; }
.date-cell { color: #2a5a8a; font-weight: 600; }

@media (max-width: 900px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
  .chart-grid { grid-template-columns: 1fr; }
}
</style>