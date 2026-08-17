<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <div class="card placeholder">
          <div class="icon"><van-icon name="apps-o" size="30" /></div>
          <h1>{{ label }}</h1>
          <p>{{ t('home.skeleton') }}</p>
        </div>
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MobileLayout from '@/layouts/MobileLayout.vue'

const props = defineProps<{ pageKey: string }>()
const { t } = useI18n()
const label = computed(() => t(`navigation.${props.pageKey}`))
</script>

<style scoped>
.placeholder {
  margin-top: 30px;
  padding: 34px 18px;
  text-align: center;
}

.icon {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  margin: 0 auto 14px;
  border-radius: 18px;
  background: #f1f7ff;
  color: var(--qs-primary);
}

.placeholder h1 {
  margin: 0;
  font-size: 22px;
}

.placeholder p {
  max-width: 440px;
  margin: 10px auto 0;
  line-height: 1.6;
  color: var(--qs-muted);
}
</style>
