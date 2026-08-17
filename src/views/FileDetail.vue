<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <van-nav-bar :title="t('files.detail')" left-arrow @click-left="router.back()" />
        <div class="detail-card card">
          <div class="detail-icon"><van-icon name="description" size="42" /></div>
          <h1>{{ t('files.detail') }}</h1>
          <p class="muted">ID: {{ id }}</p>
          <van-cell-group inset>
            <van-cell :title="t('files.size')" value="2.4 MB" />
            <van-cell :title="t('files.updated')" value="2026-08-13" />
          </van-cell-group>
          <van-button block type="primary" round class="detail-button">{{ t('files.preview') }}</van-button>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const id = String(route.params.id || '')
</script>

<style scoped>
.detail-card {
  padding: 22px 16px 18px;
  text-align: center;
}

.detail-icon {
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  margin: 10px auto 14px;
  border-radius: 20px;
  background: #f1f7ff;
  color: var(--qs-primary);
}

.detail-card h1 {
  margin: 0;
  font-size: 22px;
}

.detail-card p {
  margin: 6px 0 18px;
}

.detail-button {
  margin-top: 16px;
}
</style>
