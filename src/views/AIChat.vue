<template>
  <div class="page ai-page">
    <MobileLayout>
      <div class="ai-chat-page">
        <!-- Conversation sidebar -->
        <transition name="sidebar">
          <aside v-if="sidebarOpen" class="conversation-sidebar">
            <div class="sidebar-header">
              <div class="sidebar-title">{{ t('aiChat.conversations', 'Conversations') }}</div>
              <button type="button" class="sidebar-close" @click="sidebarOpen = false">
                <van-icon name="cross" size="18" />
              </button>
            </div>

            <button type="button" class="new-chat-button" @click="startNewConversation">
              <van-icon name="plus" size="18" />
              <span>{{ t('aiChat.newChat', 'New chat') }}</span>
            </button>

            <div
              ref="conversationList"
              class="conversation-list"
              @scroll.passive="handleConversationScroll"
            >
              <div v-if="conversations.length === 0 && !conversationsLoading" class="conversation-empty">
                {{ t('aiChat.noConversations', 'No conversations yet') }}
              </div>

              <div
                v-for="conversation in conversations"
                :key="conversation.conversation_id"
                class="conversation-item"
                :class="{ active: conversation.conversation_id === currentConversationId }"
                @click="selectConversation(conversation.conversation_id)"
              >
                <div class="conversation-item-title">
                  {{ conversation.title }}
                </div>
                <div class="conversation-item-time">
                  {{ formatConversationTime(conversation.updated_at) }}
                </div>

                <button
                  type="button"
                  class="conversation-delete"
                  @click.stop="deleteConversation(conversation.conversation_id)"
                >
                  <van-icon name="delete-o" size="16" />
                </button>
              </div>

              <div v-if="conversationsLoading" class="conversation-loading">
                <van-loading size="18" />
              </div>

              <button
                v-else-if="conversationsHasMore && conversations.length > 0"
                type="button"
                class="conversation-load-more"
                @click.stop="loadConversations(false)"
              >
                <van-icon name="arrow-down" size="15" />
                <span>{{ t('aiChat.loadMoreConversations', '加载更多会话') }}</span>
              </button>

              <div v-else-if="!conversationsHasMore && conversations.length > 0" class="conversation-end">
                {{ t('aiChat.noMoreConversations', '没有更多会话了') }}
              </div>
            </div>
          </aside>
        </transition>

        <div
          v-if="sidebarOpen"
          class="sidebar-overlay"
          @click="sidebarOpen = false"
        ></div>

        <!-- Main chat -->
        <div class="chat-main">
          <div class="chat-header">
            <button type="button" class="sidebar-toggle" @click="sidebarOpen = true">
              <van-icon name="bars" size="21" />
            </button>

            <div class="chat-header-title">
              {{ currentConversation?.title || t('aiChat.title', 'AI Chat') }}
            </div>

            <button type="button" class="header-new-chat" @click="startNewConversation">
              <van-icon name="edit" size="19" />
            </button>
          </div>

          <div
            ref="messagesContainer"
            class="messages-container"
            @scroll.passive="handleMessageScroll"
          >
            <div
              v-if="messagesHasMore && !messagesLoadingMore"
              class="load-older-wrapper"
            >
              <button
                type="button"
                class="load-older-button"
                @click="loadMessages(false)"
              >
                <van-icon name="arrow-up" size="15" />
                <span>{{ t('aiChat.loadEarlier', '加载更早消息') }}</span>
              </button>
            </div>

            <div v-if="messagesLoadingMore" class="messages-loading">
              <van-loading size="18" />
            </div>

            <div v-if="messages.length === 0 && !messagesLoadingMore" class="empty-state">
              <div class="ai-large-avatar">AI</div>
              <h2>{{ t('aiChat.welcomeTitle') }}</h2>
              <p>{{ t('aiChat.welcomeSubtitle') }}</p>
            </div>

            <div
              v-for="(message, index) in messages"
              :key="message.message_id ?? `${message.role}-${message.created_at}-${index}`"
              class="message-row"
              :class="message.role"
            >
              <img
                v-if="message.role === 'user'"
                class="message-avatar user-avatar"
                src="https://api.quickysharing.cn/user/avatar/my"
                :alt="t('profile.avatarAlt')"
              />

              <div v-else class="message-avatar ai-avatar">AI</div>

              <div class="message-bubble">
                <div
                  v-if="message.role === 'assistant'"
                  class="message-content markdown-body"
                  v-html="renderMarkdown(message.content)"
                ></div>

                <div v-else class="message-content message-text">
                  {{ message.content }}
                </div>

                <div
                  v-if="
                    message.role === 'assistant' &&
                    sending &&
                    index === messages.length - 1 &&
                    !message.content
                  "
                  class="typing-indicator"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <div class="composer">
            <div class="composer-inner">
              <textarea
                v-model="input"
                class="composer-input"
                rows="1"
                :disabled="sending"
                :placeholder="t('aiChat.placeholder')"
                @keydown.enter.exact.prevent="send"
              ></textarea>

              <button
                type="button"
                class="send-button"
                :disabled="sending || !input.trim()"
                @click="send"
              >
                <van-icon v-if="!sending" name="guide-o" size="20" />
                <van-loading v-else size="18" />
              </button>
            </div>

            <div class="composer-hint">
              {{ t('aiChat.hint') }}
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MobileLayout from '@/layouts/MobileLayout.vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import {
  getConversations,
  deleteConversation as removeConversation,
  getMessages,
  streamChat,
  type ChatMessage,
  type Conversation,
} from '@/api/aiChat'

const STORAGE_KEY = 'qs-mobile-ai-chat-messages'
const CURRENT_CONVERSATION_KEY = 'qs-mobile-ai-current-conversation-id'
const { t } = useI18n()

const input = ref('')
const sending = ref(false)
const messages = ref<ChatMessage[]>([])
const messagesContainer = ref<HTMLElement | null>(null)

const sidebarOpen = ref(false)
const conversationList = ref<HTMLElement | null>(null)

const conversations = ref<Conversation[]>([])
const conversationsLoading = ref(false)
const conversationsHasMore = ref(true)

const currentConversationId = ref<number | null>(null)
const messagesLoadingMore = ref(false)
const messagesHasMore = ref(false)

const currentConversation = computed(() =>
  conversations.value.find(
    (item) => item.conversation_id === currentConversationId.value,
  ) || null,
)

function loadCurrentConversationId() {
  try {
    const raw = localStorage.getItem(CURRENT_CONVERSATION_KEY)
    if (!raw) {
      currentConversationId.value = null
      return
    }

    const parsed = Number(raw)
    currentConversationId.value = Number.isFinite(parsed) ? parsed : null
  } catch {
    currentConversationId.value = null
  }
}

function saveCurrentConversationId() {
  if (currentConversationId.value == null) {
    localStorage.removeItem(CURRENT_CONVERSATION_KEY)
    return
  }

  localStorage.setItem(
    CURRENT_CONVERSATION_KEY,
    String(currentConversationId.value),
  )
}

function loadCachedMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return

    messages.value = parsed.filter(
      (item): item is ChatMessage =>
        item &&
        (item.role === 'user' || item.role === 'assistant') &&
        typeof item.content === 'string',
    )
  } catch {
    messages.value = []
  }
}

function saveCachedMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
}

function getConversationCursor(): { updated_at: string; conversation_id: number } | null {
  if (conversations.value.length === 0) {
    return null
  }

  const last = conversations.value[conversations.value.length - 1]

  return {
    updated_at: last.updated_at,
    conversation_id: last.conversation_id,
  }
}

async function loadConversations(reset = false) {
  if (conversationsLoading.value) return
  if (!reset && !conversationsHasMore.value) return

  conversationsLoading.value = true

  try {
    const cursor = reset ? null : getConversationCursor()

    const payload = await getConversations({
      limit: 3,
      updated_at: cursor?.updated_at,
      conversation_id: cursor?.conversation_id,
    })

    const page = Array.isArray(payload.conversations)
      ? payload.conversations
      : []

    if (reset) {
      conversations.value = page
    } else {
      conversations.value.push(...page)
    }

    conversationsHasMore.value = payload.has_more === true

    // if (
    //   currentConversationId.value != null &&
    //   !conversations.value.some(
    //     (item) => item.conversation_id === currentConversationId.value,
    //   )
    // ) {
    //   // Current conversation may no longer exist.
    //   currentConversationId.value = null
    //   saveCurrentConversationId()
    //   messages.value = []
    // }
  } catch (error) {
    console.error('Failed to load conversations:', error)
  } finally {
    conversationsLoading.value = false
  }
}

function handleConversationScroll(event: Event) {
  const element = event.target as HTMLElement

  const nearBottom =
    element.scrollTop + element.clientHeight >= element.scrollHeight - 40

  if (nearBottom && conversationsHasMore.value && !conversationsLoading.value) {
    loadConversations(false)
  }
}

async function selectConversation(conversationId: number) {
  if (sending.value || currentConversationId.value === conversationId) {
    sidebarOpen.value = false
    return
  }

  currentConversationId.value = conversationId
  saveCurrentConversationId()

  messages.value = []
  messagesHasMore.value = false
  sidebarOpen.value = false

  await loadMessages(true)
}

function startNewConversation() {
  currentConversationId.value = null
  saveCurrentConversationId()

  messages.value = []
  input.value = ''
  messagesHasMore.value = false

  sidebarOpen.value = false

  nextTick(() => {
    const container = messagesContainer.value
    if (container) {
      container.scrollTop = 0
    }
  })
}

async function deleteConversation(conversationId: number) {
  try {
    await removeConversation(conversationId)

    conversations.value = conversations.value.filter(
      (item) => item.conversation_id !== conversationId,
    )

    if (currentConversationId.value === conversationId) {
      startNewConversation()
    }
  } catch (error) {
    console.error('Failed to delete conversation:', error)
  }
}

function getOldestMessageCursor():
  | { created_at: string; message_id: number }
  | null {
  const first = messages.value[0]

  if (!first?.created_at || first.message_id == null) {
    return null
  }

  return {
    created_at: first.created_at,
    message_id: first.message_id,
  }
}

async function loadMessages(initial = false) {
  if (currentConversationId.value == null) {
    messages.value = []
    messagesHasMore.value = false
    return
  }

  if (messagesLoadingMore.value) return
  if (!initial && !messagesHasMore.value) return

  messagesLoadingMore.value = true

  const container = messagesContainer.value
  const previousScrollHeight = container?.scrollHeight ?? 0
  const previousScrollTop = container?.scrollTop ?? 0

  try {
    const cursor = initial ? null : getOldestMessageCursor()

    const payload = await getMessages(currentConversationId.value, {
      limit: 6,
      before_created_at: cursor?.created_at,
      before_message_id: cursor?.message_id,
    })

    const page = Array.isArray(payload.messages)
      ? payload.messages
      : []

    if (initial) {
      messages.value = page
      messagesHasMore.value = payload.has_more === true

      await nextTick()
      await scrollToBottom()
    } else {
      messages.value = [...page, ...messages.value]
      messagesHasMore.value = payload.has_more === true

      await nextTick()

      const newContainer = messagesContainer.value
      if (newContainer) {
        const heightDiff = newContainer.scrollHeight - previousScrollHeight
        newContainer.scrollTop = previousScrollTop + heightDiff
      }
    }

    saveCachedMessages()
  } catch (error) {
    console.error('Failed to load messages:', error)
  } finally {
    messagesLoadingMore.value = false
  }
}

function handleMessageScroll(event: Event) {
  const element = event.target as HTMLElement

  if (
    element.scrollTop <= 40 &&
    currentConversationId.value != null &&
    messagesHasMore.value &&
    !messagesLoadingMore.value
  ) {
    loadMessages(false)
  }
}

async function scrollToBottom() {
  await nextTick()

  const container = messagesContainer.value
  if (!container) return

  container.scrollTop = container.scrollHeight
}

function formatConversationTime(value: string): string {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function send() {
  const question = input.value.trim()

  if (!question || sending.value) return

  input.value = ''
  sending.value = true

  // New conversation: no DB row is created here on the frontend.
  // Backend creates it when conversation_id is null.
  const requestConversationId = currentConversationId.value

  messages.value.push({
    role: 'user',
    content: question,
  })

  messages.value.push({
    role: 'assistant',
    content: '',
  })

  saveCachedMessages()
  await scrollToBottom()

  try {
    await streamChat(
      question,
      requestConversationId,
      async (payload) => {
        if (payload.conversationId != null) {
          const parsedId = Number(payload.conversationId)

          if (Number.isFinite(parsedId)) {
            currentConversationId.value = parsedId
            saveCurrentConversationId()
          }
        }

        if (payload.conversation_id != null) {
          const parsedId = Number(payload.conversation_id)

          if (Number.isFinite(parsedId)) {
            currentConversationId.value = parsedId
            saveCurrentConversationId()
          }
        }

        if (typeof payload.content === 'string') {
          const last = messages.value[messages.value.length - 1]

          if (last?.role === 'assistant') {
            last.content += payload.content
          }
        }

        saveCachedMessages()
        await scrollToBottom()
      },
    )

    const last = messages.value[messages.value.length - 1]

    if (last?.role === 'assistant' && !last.content) {
      last.content = t('aiChat.emptyResponse')
    }

    saveCachedMessages()

    // Refresh the sidebar after the conversation has been created/updated.
    await loadConversations(true)
  } catch (error) {
    const last = messages.value[messages.value.length - 1]

    if (last?.role === 'assistant') {
      last.content =
        error instanceof Error
          ? `${t('aiChat.requestFailed')}: ${error.message}`
          : t('aiChat.requestFailed')
    }
  } finally {
    sending.value = false
    saveCachedMessages()
    await scrollToBottom()
  }
}

function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(marked.parse(content))
}

watch(
  messages,
  () => {
    saveCachedMessages()
  },
  { deep: true },
)

watch(
  currentConversationId,
  async (value, oldValue) => {
    if (value === oldValue) return

    if (value == null) {
      messages.value = []
      messagesHasMore.value = false
      return
    }

    if (oldValue != null) {
      await loadMessages(true)
    }
  },
)

onMounted(async () => {
  loadCurrentConversationId()

  // localStorage is used only as a quick client-side state/cache.
  // The database remains the source of truth and is loaded on every page entry.
  loadCachedMessages()

  await loadConversations(true)

  if (currentConversationId.value != null) {
    await loadMessages(true)
  } else {
    messages.value = []
  }
})
</script>

<style scoped>
.ai-page {
  padding-bottom: 0;
}

.ai-chat-page {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 56px);
  padding-bottom: calc(82px + env(safe-area-inset-bottom));
  background: #f6f7f8;
}

.chat-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: calc(100vh - 56px);
}

.chat-header {
  position: sticky;
  top: 0;
  z-index: 12;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 10px;
  background: rgba(246, 247, 248, 0.96);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(14px);
}

.sidebar-toggle,
.header-new-chat,
.sidebar-close {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #222;
}

.sidebar-toggle:active,
.header-new-chat:active,
.sidebar-close:active {
  background: rgba(0, 0, 0, 0.06);
}

.chat-header-title {
  min-width: 0;
  flex: 1;
  margin: 0 8px;
  overflow: hidden;
  color: #222;
  font-size: 15px;
  font-weight: 700;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messages-container {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 8px 12px calc(88px + env(safe-area-inset-bottom));
  scroll-behavior: smooth;
}

.load-older-wrapper {
  display: flex;
  justify-content: center;
  padding: 2px 0 6px;
}

.load-older-button,
.conversation-load-more {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 7px 12px;
  border: 1px solid var(--qs-border);
  border-radius: 999px;
  background: #fff;
  color: #5f6368;
  font-size: 12px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.04);
}

.load-older-button:active,
.conversation-load-more:active {
  background: #f0f1f3;
}

.messages-loading {
  display: flex;
  justify-content: center;
  padding: 4px 0 10px;
}

.empty-state {
  min-height: 52vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 36px 24px;
  text-align: center;
}

.ai-large-avatar {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #111;
  color: #fff;
  font-weight: 800;
  font-size: 18px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
}

.empty-state h2 {
  margin: 16px 0 6px;
  font-size: 22px;
}

.empty-state p {
  margin: 0;
  max-width: 320px;
  color: var(--qs-muted);
  line-height: 1.6;
}

.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin: 10px 0;
}

.message-row.user {
  justify-content: flex-end;
}

.message-row.user .message-bubble {
  order: 1;
  background: #111;
  color: #fff;
  border-bottom-right-radius: 4px;
}

.message-row.user .user-avatar {
  order: 2;
}

.message-row.assistant {
  justify-content: flex-start;
}

.message-row.assistant .message-bubble {
  background: #fff;
  color: var(--qs-text);
  border-bottom-left-radius: 4px;
}

.message-avatar {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.ai-avatar {
  display: grid;
  place-items: center;
  background: #111;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
}

.message-bubble {
  max-width: min(82%, 680px);
  padding: 10px 13px;
  border-radius: 16px;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
}

.message-content {
  overflow-wrap: anywhere;
}

.message-text {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
  font-size: 15px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 18px;
}

.typing-indicator span {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #999;
  animation: blink 1.1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.15s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes blink {
  0%,
  80%,
  100% {
    opacity: 0.25;
  }

  40% {
    opacity: 1;
  }
}

.composer {
  position: fixed;
  right: 0;
  bottom: env(safe-area-inset-bottom);
  left: 0;
  z-index: 14;
  padding: 8px 10px 10px;
  background: rgba(246, 247, 248, 0.96);
  backdrop-filter: blur(14px);
}

.composer-inner {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  max-width: 760px;
  margin: 0 auto;
  padding: 7px 7px 7px 13px;
  border: 1px solid var(--qs-border);
  border-radius: 24px;
  background: #fff;
  box-shadow: 0 2px 14px rgba(0, 0, 0, 0.07);
}

.composer-input {
  flex: 1;
  min-height: 34px;
  max-height: 120px;
  padding: 5px 0;
  resize: none;
  border: 0;
  outline: 0;
  background: transparent;
  line-height: 1.45;
}

.composer-input::placeholder {
  color: #a0a4aa;
}

.send-button {
  display: grid;
  place-items: center;
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #111;
  color: #fff;
}

.send-button:disabled {
  opacity: 0.35;
}

.composer-hint {
  max-width: 760px;
  margin: 5px auto 0;
  padding: 0 8px;
  color: #9a9da3;
  font-size: 10px;
  text-align: center;
}

/* Sidebar */
.conversation-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 30;
  display: flex;
  flex-direction: column;
  width: min(320px, 84vw);
  background: #fff;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 6px 0 24px rgba(0, 0, 0, 0.12);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  z-index: 25;
  background: rgba(0, 0, 0, 0.32);
}

.sidebar-enter-active,
.sidebar-leave-active {
  transition: transform 0.22s ease;
}

.sidebar-enter-from,
.sidebar-leave-to {
  transform: translateX(-100%);
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 10px 0 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.sidebar-title {
  font-size: 16px;
  font-weight: 700;
}

.new-chat-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin: 12px;
  padding: 10px 14px;
  border: 1px solid var(--qs-border);
  border-radius: 12px;
  background: #fff;
  color: #111;
  font-weight: 600;
}

.conversation-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 8px 16px;
}

.conversation-item {
  position: relative;
  display: block;
  width: 100%;
  padding: 11px 38px 10px 12px;
  margin: 4px 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: #222;
  text-align: left;
}

.conversation-item.active {
  background: #f1f2f4;
}

.conversation-item:active {
  background: #e9eaec;
}

.conversation-item-title {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conversation-item-time {
  margin-top: 4px;
  color: #90949b;
  font-size: 11px;
}

.conversation-delete {
  position: absolute;
  top: 50%;
  right: 8px;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #8d9198;
  transform: translateY(-50%);
}

.conversation-delete:active {
  background: rgba(0, 0, 0, 0.08);
}

.conversation-load-more {
  width: calc(100% - 8px);
  margin: 8px 4px 4px;
}

.conversation-empty,
.conversation-end,
.conversation-loading {
  padding: 18px 8px;
  color: #9a9da3;
  font-size: 12px;
  text-align: center;
}

@media (min-width: 800px) {
  .conversation-sidebar {
    width: 300px;
  }

  .chat-main {
    margin-left: 0;
  }

  .sidebar-overlay {
    display: none;
  }
}
</style>
