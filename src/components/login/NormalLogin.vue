<template>
  <div class="login-card">
    <div class="title">
      {{ t('login.title') }}
    </div>

    <van-form @submit="handleSubmit">
      <van-cell-group inset>
        <van-field
          v-model="form.userName"
          name="username"
          :label="t('login.username')"
          :placeholder="t('login.usernamePlaceholder')"
          autocomplete="username"
          clearable
          :rules="[
            {
              required: true,
              message: t('login.usernameRequired'),
            },
          ]"
        />

        <van-field
          v-model="form.password"
          name="password"
          type="password"
          :label="t('login.password')"
          :placeholder="t('login.passwordPlaceholder')"
          autocomplete="current-password"
          clearable
          :rules="[
            {
              required: true,
              message: t('login.passwordRequired'),
            },
          ]"
        />

        <van-field
          v-model="form.code"
          name="code"
          :label="t('login.captcha')"
          :placeholder="t('login.captchaPlaceholder')"
          autocomplete="off"
          maxlength="10"
          :rules="[
            {
              required: true,
              message: t('login.captchaRequired'),
            },
          ]"
        >
          <template #button>
            <button
              type="button"
              class="captcha-button"
              :aria-label="t('login.refreshCaptcha')"
              @click="refreshCaptcha"
            >
              <img
                v-if="captchaImage"
                class="captcha-image"
                :src="captchaImage"
                :alt="t('login.captchaAlt')"
              />

              <span
                v-else
                class="captcha-placeholder"
              >
                {{ t('login.captchaLoading') }}
              </span>
            </button>
          </template>
        </van-field>
      </van-cell-group>

      <div class="captcha-meta">
        {{ t('login.captchaExpiresIn', { seconds: captchaSeconds }) }}
      </div>

      <van-checkbox
        v-model="agreed"
        shape="square"
        class="agreement"
      >
        <span>{{ t('login.agreementPrefix') }}</span>
        <a
          href="#"
          @click.prevent="handleAgreement"
        >
          {{ t('login.userAgreement') }}
        </a>
        <span>{{ t('login.and') }}</span>
        <a
          href="#"
          @click.prevent="handlePrivacy"
        >
          {{ t('login.privacyPolicy') }}
        </a>
      </van-checkbox>

      <van-button
        class="submit-button"
        type="primary"
        block
        round
        native-type="submit"
        :loading="submitting"
        :disabled="!canSubmit"
      >
        {{ t('login.submit') }}
      </van-button>
    </van-form>

    <div class="auxiliary-actions">
      <button
        type="button"
        class="link-button"
        @click="$emit('forgotPassword')"
      >
        {{ t('login.forgotPassword') }}
      </button>

      <button
        type="button"
        class="link-button"
        @click="$emit('register')"
      >
        {{ t('login.register') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  showFailToast,
  showSuccessToast,
} from 'vant'

import { getCaptcha, login } from '@/api/auth'

const emit = defineEmits<{
  forgotPassword: []
  register: []
  success: []
}>()

const { t } = useI18n()

const form = reactive({
  userName: '',
  password: '',
  code: '',
})

const agreed = ref(false)
const submitting = ref(false)

const captchaImage = ref('')
const captchaSeconds = ref(300)

let timer: ReturnType<typeof setInterval> | null = null

const canSubmit = computed(() => {
  return Boolean(
    form.userName.trim() &&
    form.password &&
    form.code.trim() &&
    agreed.value &&
    !submitting.value,
  )
})

function normalizeCaptcha(value: string) {
  if (!value) return ''

  if (value.startsWith('data:image/')) {
    return value
  }

  return `data:image/png;base64,${value}`
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  captchaSeconds.value = 300

  timer = setInterval(() => {
    if (captchaSeconds.value <= 0) {
      stopTimer()
      return
    }

    captchaSeconds.value -= 1
  }, 1000)
}

async function refreshCaptcha() {
  try {
    const value = await getCaptcha()
    captchaImage.value = normalizeCaptcha(value)
    startTimer()
  } catch {
    captchaImage.value = ''
    captchaSeconds.value = 0
  }
}

function extractMessage(error: any): string {
  const msg = error?.response?.data?.msg

  if (typeof msg === 'string' && msg.trim()) {
    return msg
  }

  if (Array.isArray(msg)) {
    return msg.filter(Boolean).join('\n')
  }

  return t('login.loginFailed')
}

async function handleSubmit() {
  if (!canSubmit.value) return

  submitting.value = true

  try {
    const result = await login({
      userName: form.userName.trim(),
      password: form.password,
      code: form.code.trim(),
    })

    if (result.status === 210) {
      showSuccessToast({
        message: t('login.loginSuccess'),
        duration: 2000,
      })

      emit('success')
      return
    }

    showFailToast({
      message:
        typeof result.msg === 'string'
          ? result.msg
          : result.msg.join('\n'),
      duration: 2500,
    })

    form.code = ''
    await refreshCaptcha()
  } catch (error: any) {
    showFailToast({
      message: extractMessage(error),
      duration: 2500,
    })

    form.code = ''
    await refreshCaptcha()
  } finally {
    submitting.value = false
  }
}

function handleAgreement() {
}

function handlePrivacy() {
}

onMounted(refreshCaptcha)
onBeforeUnmount(stopTimer)
</script>

<style scoped>
.login-card {
  padding: 18px 0 24px;
}

.title {
  margin-bottom: 16px;
  text-align: center;
  color: #222;
  font-size: 22px;
  font-weight: 600;
}

.captcha-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 108px;
  height: 40px;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 6px;
  background: #f7f8fa;
  cursor: pointer;
}

.captcha-image {
  display: block;
  width: 108px;
  height: 40px;
  object-fit: cover;
}

.captcha-placeholder {
  color: #999;
  font-size: 12px;
  white-space: nowrap;
}

.captcha-meta {
  padding: 6px 20px 0;
  color: #999;
  font-size: 12px;
  text-align: right;
}

.agreement {
  padding: 14px 20px 4px;
  color: #666;
  font-size: 13px;
  line-height: 20px;
}

.agreement a {
  color: #1989fa;
}

.submit-button {
  margin: 18px 12px 0;
  width: calc(100% - 24px);
}

.auxiliary-actions {
  display: flex;
  justify-content: space-between;
  padding: 16px 20px 0;
}

.link-button {
  border: 0;
  background: transparent;
  color: #1989fa;
  font-size: 13px;
}
</style>
