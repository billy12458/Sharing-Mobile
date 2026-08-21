<template>
  <section class="recommend-section">
    <van-divider>
      {{ t('ranking.recommendations') }}
    </van-divider>

    <van-loading
      v-if="loading"
      class="loading"
      size="24px"
    />

    <template v-else>
      <RecommendFileItem
        v-for="(item, index) in files"
        :key="item._id || index"
        :file="item"
      />

      <van-empty
        v-if="files.length === 0"
        :description="t('ranking.recommendEmpty')"
      />
    </template>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import RecommendFileItem from '@/components/RecommendFileItem.vue'
import { getRecommendFiles } from '@/api/recommend'

const { t } = useI18n()

const files = ref<any[]>([])
const loading = ref(false)

async function load() {
  loading.value = true

  try {
    files.value = await getRecommendFiles()
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>