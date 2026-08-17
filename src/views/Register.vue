<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <div class="auth-card card">
          <div class="logo-mark">Q</div>
          <h1>{{ t('auth.registerTitle') }}</h1>
          <van-cell-group inset>
            <van-field :label="t('auth.username')" />
            <van-field :label="t('auth.email')" type="email" />
            <van-field :label="t('auth.password')" type="password" />
          </van-cell-group>
          <van-button block round type="primary" class="auth-button" @click="showToast(t('home.skeleton'))">{{ t('common.register') }}</van-button>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import MobileLayout from '@/layouts/MobileLayout.vue'

const { t } = useI18n()
</script>

<style scoped>
.auth-card {
  margin-top: 24px;
  padding: 24px 0 18px;
  text-align: center;
}

.auth-card h1 {
  margin: 12px 0 20px;
  font-size: 23px;
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
  margin: 16px;
  width: calc(100% - 32px);
}
</style>
