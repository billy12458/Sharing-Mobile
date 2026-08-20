<template>
  <MobileLayout>
    <div class="ranking-page">

      <van-tabs v-model:active="activeTab" @change="handleTabChange">
        <van-tab :title="$t('ranking.tabs.collection')" />
        <van-tab :title="$t('ranking.tabs.download')" />
        <van-tab :title="$t('ranking.tabs.views')" />
      </van-tabs>


      <van-loading v-if="currentLoading" class="loading" size="24px" vertical>
        {{ $t('ranking.loading') }}
      </van-loading>


      <div v-else class="ranking-table">
        <RankingItem v-for="(item, index) in currentRanking" :key="item.document?.idScore?.id || index"
          :rank="index + 1" :file="item" :type="activeTab" />

        <van-empty v-if="currentRanking.length === 0" :description="$t('ranking.empty')" />
      </div>


      <van-divider>
        {{ $t('ranking.recommendations') }}
      </van-divider>


      <van-loading v-if="recommendLoading" class="loading" size="24px" />


      <template v-else>
        <RecommendFileItem v-for="(item, index) in recommendFiles" :key="item._id || index" :file="item" />

        <van-empty v-if="recommendFiles.length === 0" :description="$t('ranking.recommendEmpty')" />
      </template>

    </div>
  </MobileLayout>
</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  ref
} from 'vue'

import MobileLayout
  from '@/layouts/MobileLayout.vue'

import RankingItem
  from '@/components/RankingItem.vue'

import RecommendFileItem
  from '@/components/RecommendFileItem.vue'

import {
  getCollectRanking,
  getDownloadRanking,
  getViewRanking,
  getRecommendFiles
} from '@/api/ranking'


const activeTab = ref(0)


const collectList = ref<any[]>([])
const downloadList = ref<any[]>([])
const viewList = ref<any[]>([])

const recommendFiles = ref<any[]>([])


const collectLoading = ref(false)
const downloadLoading = ref(false)
const viewLoading = ref(false)
const recommendLoading = ref(false)


const collectLoaded = ref(false)
const downloadLoaded = ref(false)
const viewLoaded = ref(false)


const currentLoading = computed(() => {

  if (activeTab.value === 0) {
    return collectLoading.value
  }

  if (activeTab.value === 1) {
    return downloadLoading.value
  }

  return viewLoading.value
})


const currentRanking = computed(() => {

  if (activeTab.value === 0) {

    return [...collectList.value].sort(
      (a, b) =>
        (b.document?.idScore?.score || 0) -
        (a.document?.idScore?.score || 0)
    )
  }


  if (activeTab.value === 1) {

    return [...downloadList.value].sort(
      (a, b) =>
        (b.document?.idScore?.score || 0) -
        (a.document?.idScore?.score || 0)
    )
  }


  return [...viewList.value].sort(
    (a, b) =>
      (b.document?.TypedTuple?.score || 0) -
      (a.document?.TypedTuple?.score || 0)
  )
})


async function loadCollectRanking() {

  if (collectLoaded.value) {
    return
  }

  collectLoading.value = true

  try {

    collectList.value =
      await getCollectRanking()

    collectLoaded.value = true

  } finally {

    collectLoading.value = false
  }
}


async function loadDownloadRanking() {

  if (downloadLoaded.value) {
    return
  }

  downloadLoading.value = true

  try {

    downloadList.value =
      await getDownloadRanking()

    downloadLoaded.value = true

  } finally {

    downloadLoading.value = false
  }
}


async function loadViewRanking() {

  if (viewLoaded.value) {
    return
  }

  viewLoading.value = true

  try {

    viewList.value =
      await getViewRanking()

    viewLoaded.value = true

  } finally {

    viewLoading.value = false
  }
}


async function handleTabChange(index: number) {

  if (index === 0) {
    await loadCollectRanking()
    return
  }

  if (index === 1) {
    await loadDownloadRanking()
    return
  }

  await loadViewRanking()
}


async function loadRecommendations() {

  if (recommendFiles.value.length > 0) {
    return
  }

  recommendLoading.value = true

  try {

    recommendFiles.value =
      await getRecommendFiles()

  } finally {

    recommendLoading.value = false
  }
}


onMounted(async () => {

  await loadCollectRanking()
  await loadRecommendations()

})

</script>


<style scoped>
.ranking-page {
  min-height: 100%;
  background: #f7f8fa;
}

.ranking-table {
  padding: 12px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>