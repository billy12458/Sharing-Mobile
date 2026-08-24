<template>
  <MobileLayout>
    <div class="login-page">
      <van-tabs v-model:active="activeTab">
        <van-tab :title="$t('login.tabs.normal')" />
        <van-tab :title="$t('login.tabs.mfa')" />
        <van-tab :title="$t('login.tabs.thirdParty')" />
      </van-tabs>

      <NormalLogin v-if="activeTab === 0" @success="handleLoginSuccess" @forgot-password="handleForgotPassword"
        @register="handleRegister" />

      <MfaLogin v-else-if="activeTab === 1" @success="handleLoginSuccess" @forgot-password="handleForgotPassword"
        @register="handleRegister" />

      <van-empty v-else :description="$t('login.thirdPartyComingSoon')" />
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import MobileLayout from '@/layouts/MobileLayout.vue'
import NormalLogin from '@/components/login/NormalLogin.vue'
import MfaLogin from '@/components/login/MfaLogin.vue'

const router = useRouter()

const activeTab = ref(0)

async function handleLoginSuccess() {
  const redirect =
    typeof router.currentRoute.value.query.redirect === 'string'
      ? router.currentRoute.value.query.redirect
      : '/'

  await router.push(redirect)
}

function handleForgotPassword() {
}

function handleRegister() {
}
</script>

<style scoped>
.login-page {
  min-height: 100%;
  padding-bottom: 24px;
  background: #f7f8fa;
}
</style>
