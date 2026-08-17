<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <van-search v-model="query" shape="round" :placeholder="t('search.placeholder')" @search="submit" />
        <div class="section-title">{{ t('search.history') }}</div>
        <div v-if="history.length" class="history-list">
          <van-cell v-for="item in history" :key="item" :title="item" is-link @click="query = item; submit()" />
        </div>
        <van-empty v-else :description="t('search.history')" />
      </div>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MobileLayout from '@/layouts/MobileLayout.vue'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const query = ref(String(route.query.q || ''))
const history = ref<string[]>(query.value ? [query.value] : [])

function submit() {
  const value = query.value.trim()
  if (!value) return
  history.value = [value, ...history.value.filter((item) => item !== value)].slice(0, 8)
  router.replace({ path: '/search', query: { q: value } })
}
</script>

<style scoped>
.history-list {
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
}
</style>
