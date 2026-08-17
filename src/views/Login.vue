<template>
  <MobileLayout>
    <div class="page auth-page">
      <div class="page-content">
        <div class="auth-card card">
          <div class="logo-mark">Q</div>
          <h1>{{ t('auth.loginTitle') }}</h1>
          <p class="muted">{{ t('profile.loginHint') }}</p>
          <van-form @submit="submit">
            <van-cell-group inset>
              <van-field v-model="username" :label="t('auth.username')" autocomplete="username" />
              <van-field v-model="password" :label="t('auth.password')" type="password" autocomplete="current-password" />
            </van-cell-group>
            <van-button block round type="primary" native-type="submit" class="auth-button">{{ t('common.login') }}</van-button>
          </van-form>
          <van-button block plain round @click="router.push('/register')">{{ t('common.register') }}</van-button>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'

const { t } = useI18n()
const router = useRouter()
const username = ref('')
const password = ref('')

function submit() {
  showToast(t('home.skeleton'))
}
</script>

<style scoped>
.auth-page {
  background: linear-gradient(180deg, #0b0b0b 0%, #161616 32%, #f6f7f8 32%);
}

.auth-card {
  margin-top: 60px;
  padding: 28px 0 18px;
  text-align: center;
}

.auth-card h1 {
  margin: 12px 0 6px;
  font-size: 23px;
}

.auth-card p {
  margin: 0 18px 22px;
}

.logo-mark {
  display: grid;
  place-items: center;
  width: 56px;
  height: 56px;
  margin: 0 auto;
  border-radius: 16px;
  background: #f3b33d;
  color: #151515;
  font-size: 24px;
  font-weight: 800;
}

.auth-button {
  margin: 16px 16px 10px;
  width: calc(100% - 32px);
}
</style>
