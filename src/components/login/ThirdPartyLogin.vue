<template>
  <div class="third-party-login">
    <div class="title">
      {{ t('login.thirdPartyTitle') }}
    </div>

    <button
      type="button"
      class="github-login-btn"
      :disabled="loading"
      @click="loginWithGithub"
    >
      <svg class="github-icon" viewBox="0 0 16 16" aria-hidden="true">
        <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
      </svg>
      <span>{{ t('login.continueWithGithub') }}</span>
    </button>

    <p class="hint">
      {{ t('login.thirdPartyHint') }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  success: []
}>()

const { t } = useI18n()

const loading = ref(false)

const GITHUB_CLIENT_ID = 'Ov23li0fTiYZmsTCSpjx'

function loginWithGithub() {
  if (loading.value) return

  loading.value = true

  // 与网页端保持一致：跳转到 GitHub OAuth 授权页。
  // GitHub 会使用该 OAuth 应用已登记的默认回调地址完成授权，
  // 授权结果由服务端换取会话，前端无需处理 code。
  window.location.href = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=user%3Aemail`
}
</script>

<style scoped>
.third-party-login {
  padding: 18px 0 24px;
}

.title {
  margin-bottom: 16px;
  text-align: center;
  color: #222;
  font-size: 22px;
  font-weight: 600;
}

.github-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: calc(100% - 24px);
  margin: 0 12px;
  height: 46px;
  border: none;
  border-radius: 8px;
  background-color: #24292e;
  color: #fff;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.github-login-btn:active {
  background-color: #2f363d;
}

.github-login-btn:disabled {
  opacity: 0.6;
}

.github-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
}

.hint {
  margin: 14px 20px 0;
  color: #999;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}
</style>
