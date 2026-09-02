<template>
  <div class="page ai-page">
    <MobileLayout>
      <div class="ai-chat-page">
        <div ref="messagesContainer" class="messages-container">
          <div v-if="messages.length === 0" class="empty-state">
            <div class="ai-large-avatar">AI</div>
            <h2>{{ t('aiChat.welcomeTitle') }}</h2>
            <p>{{ t('aiChat.welcomeSubtitle') }}</p>
          </div>

          <div v-for="(message, index) in messages" :key="`${message.role}-${index}`" class="message-row"
            :class="message.role">
            <img v-if="message.role === 'user'" class="message-avatar user-avatar" src="../assets/images/avatar.jpg"
              :alt="t('profile.avatarAlt')" />

            <div v-else class="message-avatar ai-avatar">AI</div>

            <div class="message-bubble">
              <div v-if="message.role === 'assistant'" class="message-content markdown-body"
                v-html="renderMarkdown(message.content)"></div>
              <div v-else class="message-content">
                {{ message.content }}
              </div>
              <div v-if="message.role === 'assistant' && sending && index === messages.length - 1 && !message.content"
                class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="composer">
          <div class="composer-inner">
            <textarea v-model="input" class="composer-input" rows="1" :disabled="sending"
              :placeholder="t('aiChat.placeholder')" @keydown.enter.exact.prevent="send"></textarea>

            <button type="button" class="send-button" :disabled="sending || !input.trim()" @click="send">
              <van-icon v-if="!sending" name="guide-o" size="20" />
              <van-loading v-else size="18" />
            </button>
          </div>

          <div class="composer-hint">
            {{ t('aiChat.hint') }}
          </div>
        </div>
      </div>
    </MobileLayout>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import MobileLayout from '@/layouts/MobileLayout.vue'
import { marked } from "marked";
import DOMPurify from "dompurify";

type MessageRole = 'user' | 'assistant'

interface ChatMessage {
  role: MessageRole
  content: string
}

const STORAGE_KEY = 'qs-mobile-ai-chat-messages'
const API_BASE_URL = import.meta.env.VITE_AI_API_BASE_URL || 'https://ai.quickysharing.cn'

const { t } = useI18n()

const input = ref('')
const sending = ref(false)
const messages = ref<ChatMessage[]>([])
const messagesContainer = ref<HTMLElement | null>(null)

function loadMessages() {
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

function saveMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value))
}

async function scrollToBottom() {
  await nextTick()

  const container = messagesContainer.value
  if (!container) return

  container.scrollTop = container.scrollHeight
}

async function send() {
  const question = input.value.trim()

  if (!question || sending.value) return

  input.value = ''
  sending.value = true

  messages.value.push({
    role: 'user',
    content: question,
  })

  messages.value.push({
    role: 'assistant',
    content: '',
  })

  saveMessages()
  await scrollToBottom()

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        question,
      }),
    })

    if (!response.ok || !response.body) {
      const text = await response.text()
      throw new Error(text || `HTTP ${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { value, done } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })

      const events = buffer.split('\n\n')
      buffer = events.pop() || ''

      for (const event of events) {
        const dataLine = event
          .split('\n')
          .find((line) => line.startsWith('data:'))

        if (!dataLine) continue

        const data = dataLine.slice(5).trim()

        if (data === '[DONE]') {
          continue
        }

        try {
          const payload = JSON.parse(data)

          if (payload.error) {
            throw new Error(payload.error)
          }

          if (typeof payload.content === 'string') {
            const last = messages.value[messages.value.length - 1]

            if (last?.role === 'assistant') {
              last.content += payload.content
            }
          }

          saveMessages()
          await scrollToBottom()
        } catch (error) {
          if (error instanceof Error) {
            throw error
          }
          throw new Error(String(error))
        }
      }
    }

    const last = messages.value[messages.value.length - 1]

    if (last?.role === 'assistant' && !last.content) {
      last.content = t('aiChat.emptyResponse')
    }
  } catch (error) {
    const last = messages.value[messages.value.length - 1]

    if (last?.role === 'assistant') {
      last.content =
        error instanceof Error
          ? `${t('aiChat.requestFailed')}: ${error.message}`
          : t('aiChat.requestFailed')
    }
  } finally {
    saveMessages()
    sending.value = false
    await scrollToBottom()
  }
}

function renderMarkdown(content: string): string {
  return DOMPurify.sanitize(
    marked.parse(content)
  );
}

watch(
  messages,
  () => {
    saveMessages()
  },
  { deep: true },
)

onMounted(async () => {
  loadMessages()
  await scrollToBottom()
})
</script>

<style scoped>
.ai-page {
  padding-bottom: 0;
}

.ai-chat-page {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 56px);
  padding-bottom: calc(82px + env(safe-area-inset-bottom));
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 12px 12px 18px;
  scroll-behavior: smooth;
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
  bottom: calc(62px + env(safe-area-inset-bottom));
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
</style>
