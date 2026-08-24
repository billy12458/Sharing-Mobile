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
          v-model="form.mfaCode"
          name="mfaCode"
          type="digit"
          :label="t('login.mfaCode')"
          :placeholder="t('login.mfaCodePlaceholder')"
          autocomplete="one-time-code"
          maxlength="12"
          :rules="[
            {
              required: true,
              message: t('login.mfaCodeRequired'),
            },
          ]"
        />
      </van-cell-group>

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
  reactive,
  ref,
} from 'vue'
import { useI18n } from 'vue-i18n'
import {
  showFailToast,
  showSuccessToast,
} from 'vant'

import { login } from '@/api/auth'

const emit = defineEmits<{
  forgotPassword: []
  register: []
  success: []
}>()

const { t } = useI18n()

const form = reactive({
  userName: '',
  password: '',
  mfaCode: '',
})

const agreed = ref(false)
const submitting = ref(false)

const canSubmit = computed(() => {
  return Boolean(
    form.userName.trim() &&
    form.password &&
    form.mfaCode.trim() &&
    agreed.value &&
    !submitting.value,
  )
})

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
      code: form.mfaCode.trim(),
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
  } catch (error: any) {
    showFailToast({
      message: extractMessage(error),
      duration: 2500,
    })
  } finally {
    submitting.value = false
  }
}

function handleAgreement() {
}

function handlePrivacy() {
}
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
