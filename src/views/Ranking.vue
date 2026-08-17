<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <div class="section-title">{{ t('navigation.ranking') }}</div>
        <van-cell-group inset>
          <van-cell v-for="n in 5" :key="n" :title="`#${n} Quicky User ${n}`" :value="`${n * 120}`" />
        </van-cell-group>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import MobileLayout from '@/layouts/MobileLayout.vue'
const { t } = useI18n()
</script>
