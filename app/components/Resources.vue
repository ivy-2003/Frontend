<template>
  <div class="resources-page">
    <div class="toolbar">
      <div class="search-wrap">
        <Search :size="15" class="search-icon" />
        <input v-model="searchQuery" type="text" placeholder="Search resources..." />
      </div>

      <div class="filter-dropdown" ref="dropdownEl">
        <button class="dropdown-trigger" @click="dropdownOpen = !dropdownOpen">
          <component v-if="activeType !== 'all'" :is="currentTypeIcon" :size="14" />
          {{ currentTypeLabel }}
          <ChevronDown :size="15" class="dropdown-chevron" :class="{ open: dropdownOpen }" />
        </button>
        <div v-if="dropdownOpen" class="dropdown-menu">
          <button class="dropdown-item" :class="{ active: activeType === 'all' }" @click="selectType('all')">All</button>
          <button v-for="t in types" :key="t.key" class="dropdown-item" :class="{ active: activeType === t.key }" @click="selectType(t.key)">
            <component :is="t.icon" :size="14" /> {{ t.label }}
          </button>
        </div>
      </div>
    </div>

    <div class="resource-grid">
      <div v-if="!filteredResources.length" class="empty-state">
        <p>No resources found.</p>
      </div>

      <div v-for="r in filteredResources" :key="r.id" class="resource-card">
        <div class="resource-icon" :class="iconClass(r.type)">
          <component :is="typeIcon(r.type)" :size="18" />
        </div>
        <span class="status-pill" :class="pillClass(r.type)">{{ r.badge }}</span>
        <h3 class="resource-title">{{ r.title }}</h3>
        <p class="resource-desc">{{ r.description }}</p>
        <div class="resource-footer">
          <span class="resource-uploaded">{{ r.uploaded }}</span>
          <button class="icon-action-btn" @click="handleAction(r)">
            <component :is="actionIcon(r.type)" :size="15" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, FileText, PlayCircle, BookOpen, Link2, Download, Play, ArrowRight, ExternalLink, ChevronDown } from 'lucide-vue-next'

// TODO: local mock data — move into the shared mock db (db.resources)
// once the client-side data model is defined, and swap in a real API call.
const resources = ref([
  { id: 1, type: 'pdf', badge: 'PDF', title: 'FNRI Food Exchange List Guide', description: 'A complete reference for the 4th edition FNRI exchange categories with portion sizes.', uploaded: 'Uploaded 2 days ago', url: '' },
  { id: 2, type: 'video', badge: 'Video · 6 min', title: 'Reading Nutrition Labels', description: 'Learn how to interpret sodium, sugar, and serving size info on Filipino packaged foods.', uploaded: 'Uploaded 5 days ago', url: '' },
  { id: 3, type: 'article', badge: 'Article · 4 min read', title: 'Managing Carb Cravings', description: 'Practical, culturally-relevant strategies for managing sweet and starchy food cravings.', uploaded: 'Uploaded 1 week ago', url: '' },
  { id: 4, type: 'article', badge: 'Article · 5 min read', title: 'Cooking Low-Sodium Filipino Dishes', description: 'Adapt adobo, sinigang, and tinola recipes for hypertension-friendly diets.', uploaded: 'Uploaded 2 weeks ago', url: '' },
  { id: 5, type: 'link', badge: 'External Link', title: 'DOH Pinggang Pinoy Guide', description: 'Official Department of Health visual food guide for balanced Filipino meals.', uploaded: 'Uploaded 3 weeks ago', url: '' },
  { id: 6, type: 'video', badge: 'Video · 9 min', title: 'Light Exercise for Diabetic Patients', description: 'Safe, low-impact movement routines to pair with your meal plan.', uploaded: 'Uploaded 1 month ago', url: '' }
])

const types = [
  { key: 'pdf', label: 'PDF', icon: FileText },
  { key: 'video', label: 'Video', icon: PlayCircle },
  { key: 'article', label: 'Article', icon: BookOpen },
  { key: 'link', label: 'Link', icon: Link2 }
]

const activeType = ref('all')
const searchQuery = ref('')

const dropdownOpen = ref(false)
const dropdownEl = ref(null)
function selectType(key) { activeType.value = key; dropdownOpen.value = false }
function handleClickOutside(e) {
  if (dropdownEl.value && !dropdownEl.value.contains(e.target)) dropdownOpen.value = false
}
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const currentTypeLabel = computed(() => activeType.value === 'all' ? 'All' : types.find(t => t.key === activeType.value)?.label)
const currentTypeIcon = computed(() => types.find(t => t.key === activeType.value)?.icon)

const filteredResources = computed(() =>
  resources.value.filter(r =>
    (activeType.value === 'all' || r.type === activeType.value) &&
    r.title.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)

function typeIcon(type) {
  return { pdf: FileText, video: PlayCircle, article: BookOpen, link: Link2 }[type] || FileText
}
function iconClass(type) {
  return { pdf: 'icon-pdf', video: 'icon-video', article: 'icon-article', link: 'icon-link' }[type] || 'icon-article'
}
function pillClass(type) {
  return { pdf: 'pill-red', video: 'pill-blue', article: 'pill-green', link: 'pill-gold' }[type] || 'pill-muted'
}
function actionIcon(type) {
  return { pdf: Download, video: Play, article: ArrowRight, link: ExternalLink }[type] || ArrowRight
}
function handleAction(resource) {
  // TODO: wire up to real file download / video player / article / external link navigation
  console.log('Resource action', resource.id, resource.type)
}
</script>

<style scoped>
* { box-sizing: border-box; }
.resources-page { font-family: 'Inter', sans-serif; }

.toolbar { display: flex; align-items: center; gap: 10px; margin: 4px 0 40px; flex-wrap: wrap; }

.search-wrap { position: relative; width: 300px; }
.search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9aaa9a; }
.search-wrap input { width: 100%; border: 1px solid #d5dad5; border-radius: 10px; padding: 10px 14px 10px 38px; font-size: 0.85rem; font-family: inherit; background: #fff; }

.filter-dropdown { position: relative; width: fit-content; }
.dropdown-trigger {
  display: inline-flex; align-items: center; gap: 8px; border: 1px solid #d5dad5; background: #fff; color: #4a5a4a;
  padding: 10px 20px; border-radius: 10px; font-size: 0.85rem; font-weight: 700; cursor: pointer;
}
.dropdown-chevron { transition: transform 0.15s; margin-left: 2px; }
.dropdown-chevron.open { transform: rotate(180deg); }
.dropdown-menu {
  position: absolute; top: calc(100% + 6px); left: 0; z-index: 20; min-width: 180px;
  background: #fff; border: 1px solid #eceeec; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.1); padding: 6px; overflow: hidden;
}
.dropdown-item {
  display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; border: none; background: none;
  padding: 9px 12px; border-radius: 8px; font-size: 0.85rem; font-weight: 600; color: #4a5a4a; cursor: pointer;
}
.dropdown-item:hover { background: #f7f9f7; }
.dropdown-item.active { background: #eef3ee; color: #14301a; }

.resource-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
.empty-state { grid-column: 1 / -1; background: #fff; border-radius: 14px; border: 1px solid #eceeec; padding: 32px; text-align: center; color: #9aaa9a; font-size: 0.87rem; }

.resource-card { background: #fff; border-radius: 14px; border: 1px solid #eceeec; padding: 22px; display: flex; flex-direction: column; transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; cursor: pointer; }
.resource-card:hover { border-color: #14301a; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
.resource-icon { width: 40px; height: 50px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.icon-pdf { background: #fbe5e2; color: #c0392b; }
.icon-video { background: #e3ecf7; color: #2a5a8a; }
.icon-article { background: #eef3ee; color: #1e4a26; }
.icon-link { background: #fdf1d6; color: #b8860b; }

.status-pill { font-size: 0.72rem; font-weight: 700; padding: 3px 10px; border-radius: 12px; white-space: nowrap; align-self: flex-start; margin-bottom: 12px; }
.pill-green { background: #e3f3ea; color: #1f8f5c; }
.pill-gold { background: #fdf1d6; color: #b8860b; }
.pill-muted { background: #eceeec; color: #8a9a8a; }
.pill-red { background: #fbe5e2; color: #c0392b; }
.pill-blue { background: #e3ecf7; color: #2a5a8a; }

.resource-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: #1a3a1a; margin: 0 0 8px; }
.resource-desc { font-size: 0.84rem; color: #6a7a6a; line-height: 1.5; margin: 0; flex: 1; }

.resource-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 18px; }
.resource-uploaded { font-size: 0.78rem; color: #9aaa9a; }
.icon-action-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #d5dad5; background: #fff; color: #1a3a1a; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.icon-action-btn:hover { background: #f7f9f7; }

@media (max-width: 1100px) {
  .resource-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 640px) {
  .resource-grid { grid-template-columns: 1fr; }
  .search-wrap { width: 100%; }
}
</style>