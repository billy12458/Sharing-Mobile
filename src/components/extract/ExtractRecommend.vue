<template>
  <van-divider>
    {{ t('ranking.recommendations') }}
  </van-divider>

  <RecommendFileItem
    v-for="(item,index) in files"
    :key="item._id || index"
    :file="item"
  />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import RecommendFileItem from '@/components/RecommendFileItem.vue'

defineProps<{
  files:any[]
}>()

const { t } = useI18n()
</script>
