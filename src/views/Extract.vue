<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <div class="section-title">{{ t('navigation.extractCode') }}</div>
        <div class="card panel">
          <van-field v-model="code" label="Code" placeholder="Enter extraction code" />
          <van-button type="primary" block round @click="showToast(t('home.skeleton'))">{{ t('common.confirm') }}</van-button>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import MobileLayout from '@/layouts/MobileLayout.vue'

const { t } = useI18n()
const code = ref('')
</script>

<style scoped>
.panel {
  padding: 12px;
}
</style>
