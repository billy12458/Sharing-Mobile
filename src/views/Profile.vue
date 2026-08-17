<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <section class="profile-head card">
          <div class="avatar">Q</div>
          <div class="profile-copy">
            <h1>{{ userStore.loggedIn ? 'Quicky User' : t('profile.notLoggedIn') }}</h1>
            <p>{{ t('profile.loginHint') }}</p>
          </div>
          <van-button v-if="!userStore.loggedIn" size="small" type="primary" round @click="router.push('/login')">{{ t('common.login') }}</van-button>
        </section>

        <div class="section-title">{{ t('profile.account') }}</div>
        <van-cell-group inset>
          <van-cell :title="t('profile.account')" is-link />
          <van-cell :title="t('profile.preferences')" is-link />
          <van-cell :title="t('common.language')" :value="locale === 'zh-CN' ? t('common.chinese') : t('common.english')" is-link />
        </van-cell-group>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'
import { useUserStore } from '@/stores/user'

const { t, locale } = useI18n()
const router = useRouter()
const userStore = useUserStore()
</script>

<style scoped>
.profile-head {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 14px;
}

.avatar {
  display: grid;
  place-items: center;
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #f3b33d;
  color: #151515;
  font-weight: 800;
  font-size: 20px;
}

.profile-copy {
  min-width: 0;
  flex: 1;
}

.profile-copy h1 {
  margin: 0;
  font-size: 18px;
}

.profile-copy p {
  margin: 6px 0 0;
  color: var(--qs-muted);
  line-height: 1.45;
  font-size: 12px;
}
</style>
