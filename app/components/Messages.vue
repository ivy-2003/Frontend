<template>
  <div class="messages-page">
    <div class="messages-layout">
      <!-- CONVERSATIONS LIST -->
      <aside class="conv-list">
        <div class="conv-list-header">
          <h3 class="conv-title">Conversations</h3>
          <span class="ra-badge"><Lock :size="11" /> RA 10173</span>
        </div>
        <div class="conv-search-row">
          <div class="conv-search-wrap">
            <Search :size="14" class="conv-search-icon" />
            <input v-model="searchQuery" type="text" placeholder="Search conversations..." />
          </div>
          <button class="new-conv-btn"><Plus :size="16" /></button>
        </div>

        <div class="conv-items">
          <button
            v-for="c in filteredConversations" :key="c.id"
            class="conv-item" :class="{ active: activeConvId === c.id }"
            @click="activeConvId = c.id"
          >
            <div class="conv-avatar" :style="{ background: c.avatarColor }">
              {{ c.initials }}
              <span v-if="c.online" class="online-dot"></span>
            </div>
            <div class="conv-info">
              <div class="conv-info-row">
                <span class="conv-name">{{ c.name }}</span>
                <span class="conv-time">{{ c.time }}</span>
              </div>
              <p class="conv-preview">{{ c.lastMessage }}</p>
            </div>
            <span v-if="c.unread" class="conv-unread">{{ c.unread }}</span>
          </button>
        </div>
      </aside>

      <!-- CHAT THREAD -->
      <section class="chat-thread" v-if="activeConversation">
        <div class="thread-header">
          <div class="thread-header-left">
            <div class="conv-avatar" :style="{ background: activeConversation.avatarColor }">{{ activeConversation.initials }}</div>
            <div>
              <p class="thread-name">{{ activeConversation.name }}</p>
              <p class="thread-sub">RA 10173-compliant · {{ activeConversation.specialty }}</p>
            </div>
          </div>
          <span class="online-status" v-if="activeConversation.online"><span class="online-status-dot"></span> Online</span>
        </div>

        <div class="thread-messages">
          <div class="date-divider"><span>Today</span></div>

          <div v-for="(m, i) in activeConversation.messages" :key="i" class="message-row" :class="m.sender === 'me' ? 'from-me' : 'from-them'">
            <p v-if="m.sender === 'them'" class="message-sender">{{ activeConversation.name }}</p>
            <div class="message-bubble">{{ m.text }}</div>
            <p class="message-time">{{ m.time }}</p>
          </div>

          <div v-if="activeConversation.typing" class="message-row from-them">
            <div class="typing-bubble"><span></span><span></span><span></span></div>
          </div>
        </div>

        <div class="thread-input-row">
          <button class="attach-btn"><Paperclip :size="17" /></button>
          <input v-model="draftMessage" type="text" placeholder="Type a message..." @keyup.enter="sendMessage" />
          <button class="send-btn" @click="sendMessage"><Send :size="16" /></button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Lock, Search, Plus, Paperclip, Send } from 'lucide-vue-next'

// TODO: local mock data — move into the shared mock db (db.conversations)
// once the client-side data model is defined, and swap in a real API/websocket.
const conversations = ref([
  {
    id: 1, name: 'RND Ivy Alba', initials: 'AR', avatarColor: '#1e4a26', specialty: 'Diabetes & Renal MNT',
    time: '9:15 AM', unread: 2, online: true, typing: true,
    lastMessage: "Great job keeping a food diary! Please join the video...",
    messages: [
      { sender: 'them', text: "Good morning Maria! I reviewed your pre-screening results. Your blood glucose is slightly elevated — we'll adjust your meal plan in today's session.", time: '8:30 AM' },
      { sender: 'me', text: "Thank you po! I'll eat a light breakfast before our session. I also logged my meals yesterday.", time: '9:00 AM' },
      { sender: 'them', text: "Great job keeping a food diary! Please join the video session at exactly 10 AM — I'll have your updated meal plan ready.", time: '9:15 AM' }
    ]
  },
  {
    id: 2, name: 'Client Support', initials: 'CS', avatarColor: '#7a7a7a', specialty: 'NutriMatch Support',
    time: 'Yesterday', unread: 0, online: false, typing: false,
    lastMessage: 'Your May invoice has been generated.',
    messages: [
      { sender: 'them', text: 'Your May invoice has been generated. You can view and pay it from the Billing page.', time: 'Yesterday, 2:14 PM' }
    ]
  },
  {
    id: 3, name: 'RND Merian Felizarta', initials: 'MF', avatarColor: '#00382a', specialty: 'General Practice',
    time: 'Apr 28', unread: 0, online: false, typing: false,
    lastMessage: 'Thank you for the referral question — happy to...',
    messages: [
      { sender: 'them', text: 'Thank you for the referral question — happy to help once your current RND signs off.', time: 'Apr 28, 11:02 AM' }
    ]
  }
])

const searchQuery = ref('')
const activeConvId = ref(1)
const draftMessage = ref('')

const filteredConversations = computed(() =>
  conversations.value.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)
const activeConversation = computed(() => conversations.value.find(c => c.id === activeConvId.value))

function sendMessage() {
  if (!draftMessage.value.trim() || !activeConversation.value) return
  // TODO: wire up to a real send-message API call / websocket
  activeConversation.value.messages.push({ sender: 'me', text: draftMessage.value, time: 'Just now' })
  activeConversation.value.lastMessage = draftMessage.value
  draftMessage.value = ''
}
</script>

<style scoped>
* { box-sizing: border-box; }
.messages-page { font-family: 'Inter', sans-serif; height: calc(100vh - 160px); min-height: 500px; }

.messages-layout {
  display: grid; grid-template-columns: 300px 1fr; height: 100%;
  background: #fff; border-radius: 16px; border: 1px solid #eceeec; overflow: hidden;
}

/* CONVERSATIONS LIST */
.conv-list { border-right: 1px solid #eceeec; display: flex; flex-direction: column; overflow: hidden; }
.conv-list-header { display: flex; align-items: center; justify-content: space-between; padding: 18px 18px 14px; }
.conv-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; color: #1a3a1a; margin: 0; }
.ra-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 0.68rem; font-weight: 700; background: #e3f3ea; color: #1f8f5c; padding: 3px 9px; border-radius: 999px; }

.conv-search-row { display: flex; align-items: center; gap: 8px; padding: 0 18px 14px; }
.conv-search-wrap { position: relative; flex: 1; }
.conv-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: #9aaa9a; }
.conv-search-wrap input { width: 100%; border: 1px solid #d5dad5; border-radius: 8px; padding: 8px 10px 8px 32px; font-size: 0.82rem; font-family: inherit; }
.new-conv-btn { width: 34px; height: 34px; border-radius: 8px; border: none; background: #14301a; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }

.conv-items { flex: 1; overflow-y: auto; }
.conv-item {
  display: flex; align-items: center; gap: 11px; width: 100%; text-align: left; border: none; background: none; cursor: pointer;
  padding: 12px 18px; border-left: 3px solid transparent; border-bottom: 1px solid #f5f6f5;
}
.conv-item:hover { background: #f7f9f7; }
.conv-item.active { background: #f7f9f7; border-left-color: #D4A017; }
.conv-avatar { position: relative; width: 38px; height: 38px; border-radius: 50%; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.78rem; flex-shrink: 0; }
.online-dot { position: absolute; bottom: -1px; right: -1px; width: 9px; height: 9px; border-radius: 50%; background: #1f8f5c; border: 2px solid #fff; }
.conv-info { flex: 1; min-width: 0; }
.conv-info-row { display: flex; align-items: center; justify-content: space-between; gap: 6px; }
.conv-name { font-weight: 700; color: #1a3a1a; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-time { font-size: 0.7rem; color: #9aaa9a; flex-shrink: 0; }
.conv-preview { font-size: 0.78rem; color: #8a9a8a; margin: 2px 0 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.conv-unread { background: #D4A017; color: #1a3a1a; font-size: 0.68rem; font-weight: 800; border-radius: 999px; padding: 2px 7px; flex-shrink: 0; }

/* CHAT THREAD */
.chat-thread { display: flex; flex-direction: column; overflow: hidden; }
.thread-header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 22px; border-bottom: 1px solid #eceeec; flex-shrink: 0; }
.thread-header-left { display: flex; align-items: center; gap: 12px; }
.thread-name { font-weight: 700; color: #1a3a1a; font-size: 0.92rem; margin: 0; }
.thread-sub { font-size: 0.78rem; color: #9aaa9a; margin: 2px 0 0; }
.online-status { display: flex; align-items: center; gap: 5px; font-size: 0.78rem; color: #1f8f5c; font-weight: 600; }
.online-status-dot { width: 6px; height: 6px; border-radius: 50%; background: #1f8f5c; }

.thread-messages { flex: 1; overflow-y: auto; padding: 20px 26px; }
.date-divider { text-align: center; margin-bottom: 18px; }
.date-divider span { font-size: 0.7rem; letter-spacing: 0.08em; text-transform: uppercase; color: #9aaa9a; font-weight: 700; }

.message-row { margin-bottom: 18px; max-width: 65%; }
.message-row.from-them { margin-right: auto; }
.message-row.from-me { margin-left: auto; text-align: right; }
.message-sender { font-size: 0.78rem; font-weight: 700; color: #1a3a1a; margin: 0 0 5px; }
.message-bubble { border-radius: 12px; padding: 12px 16px; font-size: 0.87rem; line-height: 1.5; display: inline-block; text-align: left; }
.from-them .message-bubble { background: #f2f4f2; color: #2a2a2a; }
.from-me .message-bubble { background: #14301a; color: #fff; }
.message-time { font-size: 0.7rem; color: #9aaa9a; margin: 4px 0 0; }

.typing-bubble { display: inline-flex; gap: 4px; background: #f2f4f2; border-radius: 12px; padding: 12px 16px; }
.typing-bubble span { width: 6px; height: 6px; border-radius: 50%; background: #9aaa9a; animation: typingBounce 1.2s infinite ease-in-out; }
.typing-bubble span:nth-child(2) { animation-delay: 0.15s; }
.typing-bubble span:nth-child(3) { animation-delay: 0.3s; }
@keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.5; } 30% { transform: translateY(-3px); opacity: 1; } }

.thread-input-row { display: flex; align-items: center; gap: 10px; padding: 14px 20px; border-top: 1px solid #eceeec; flex-shrink: 0; }
.attach-btn { border: none; background: none; color: #6a7a6a; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.thread-input-row input { flex: 1; border: 1px solid #d5dad5; border-radius: 999px; padding: 11px 16px; font-size: 0.87rem; font-family: inherit; }
.send-btn { width: 38px; height: 38px; border-radius: 50%; border: none; background: #14301a; color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }

@media (max-width: 800px) {
  .messages-layout { grid-template-columns: 1fr; }
  .conv-list { border-right: none; border-bottom: 1px solid #eceeec; max-height: 240px; }
}
</style>