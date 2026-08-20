<template>
  <MobileLayout>
    <div class="tags-page">
      <div class="breadcrumb">
        <span class="breadcrumb-link" @click="goHome">
          {{ $t('common.home') }}
        </span>
        <span class="separator">/</span>
        <span class="breadcrumb-link" @click="goTags">
          {{ $t('tags.breadcrumb') }}
        </span>
        <span class="separator">/</span>
        <span class="breadcrumb-current">{{ currentTag }}</span>
      </div>

      <div class="header-card">
        <div class="tag-title">
          <span
            class="tag-pill"
            :class="`tag-color-${activeTagIndex}`"
          >
            {{ currentTag }}
          </span>
        </div>

        <div class="summary-list" v-if="!loading">
          <div class="summary-item">
            {{ $t('tags.totalFiles', { count: pageData.totalElements }) }}
          </div>

          <div
            class="summary-item"
            v-if="latestUploadDate"
          >
            {{ $t('tags.lastUpload', { date: latestUploadDate }) }}
          </div>

          <div class="summary-item">
            {{ $t('tags.currentPage', { page: pageNum }) }}
          </div>

          <div class="summary-item">
            {{ $t('tags.pageSize', { size: pageSize }) }}
          </div>
        </div>
      </div>

      <div class="tag-cloud">
        <!-- <div class="section-title"> -->
        <div>
          {{ $t('tags.allTags') }}
        </div>
        <br />

        <div class="tag-list">
          <van-tag
            v-for="(tag, index) in tags"
            :key="tag"
            size="medium"
            round
            :class="[
              'selectable-tag',
              `tag-color-${index % tagColorCount}`,
              { active: tag === currentTag },
            ]"
            @click="selectTag(tag)"
          >
            {{ tag }}
          </van-tag>
        </div>
      </div>

      <van-loading
        v-if="loading"
        class="loading"
        size="24px"
        vertical
      >
        {{ $t('tags.loading') }}
      </van-loading>

      <template v-else>
        <div class="file-list">
          <TagFileItem
            v-for="(item, index) in pageData.content"
            :key="item.id || item.content?.id || index"
            :file="item"
          />
        </div>

        <van-empty
          v-if="pageData.empty || pageData.content.length === 0"
          :description="$t('tags.empty')"
        />

        <div
          v-else
          class="pagination"
        >
          <van-pagination
            v-model="pageNum"
            :total-items="pageData.totalElements"
            :items-per-page="pageSize"
            :page-count="pageData.totalPages"
            force-ellipses
            @change="handlePageChange"
          />
        </div>
      </template>

      <van-divider>
        {{ $t('ranking.recommendations') }}
      </van-divider>

      <van-loading
        v-if="recommendLoading"
        class="loading"
        size="24px"
      />

      <template v-else>
        <RecommendFileItem
          v-for="(item, index) in recommendFiles"
          :key="item._id || index"
          :file="item"
        />

        <van-empty
          v-if="recommendFiles.length === 0"
          :description="$t('ranking.recommendEmpty')"
        />
      </template>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import MobileLayout from '@/layouts/MobileLayout.vue'
import TagFileItem from '@/components/TagFileItem.vue'
import RecommendFileItem from '@/components/RecommendFileItem.vue'

import { getTagFiles, type TagPageData } from '@/api/tags'
import { getRecommendFiles } from '@/api/ranking'

const route = useRoute()
const router = useRouter()

const tags = [
  '生活',
  '风景',
  '语文',
  '编程',
  '数学',
  '外语',
  '物理',
  '化学',
  '生物',
  '地理',
  '政治',
  '历史',
  '配置文件',
  '教程',
  '演讲',
  '报告',
  '简历',
  '大学',
  '实习',
  '实训',
  '游戏',
  '建筑',
  '水利',
  '机械',
  '图像',
  '体育',
  '书法',
  '其他',
]

const tagColorCount = 8
const pageSize = 10
const pageNum = ref(1)

const currentTag = computed(() => {
  const routeTag = route.params.tag

  if (typeof routeTag === 'string' && tags.includes(routeTag)) {
    return routeTag
  }

  return tags[7]
})

const activeTagIndex = computed(() => {
  return tags.indexOf(currentTag.value) % tagColorCount
})

const pageData = ref<TagPageData>({
  content: [],
  totalPages: 0,
  totalElements: 0,
  number: 0,
  size: pageSize,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
})

const loading = ref(false)

const recommendFiles = ref<any[]>([])
const recommendLoading = ref(false)

const latestUploadDate = computed(() => {
  const dates = pageData.value.content
    .map((item) => item.content?.uploadDate)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))

  if (dates.length === 0) {
    return ''
  }

  const latest = new Date(
    Math.max(...dates.map((date) => date.getTime())),
  )

  return formatDate(latest)
})

function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function loadTagFiles() {
  loading.value = true

  try {
    pageData.value = await getTagFiles(
      currentTag.value,
      pageNum.value,
      pageSize,
    )
  } finally {
    loading.value = false
  }
}

async function selectTag(tag: string) {
  if (tag === currentTag.value) {
    return
  }

  await router.push({
    name: 'Tags',
    params: {
      tag,
    },
  })
}

async function handlePageChange(page: number) {
  window.scrollTo({
    top: 0,
    behavior: 'auto'
    });
  pageNum.value = page
  await loadTagFiles()
}

async function goHome() {
  await router.push('/')
}

async function goTags() {
  await router.push({
    name: 'Tags',
    params: {
      tag: currentTag.value,
    },
  })
}

async function loadRecommendations() {
  recommendLoading.value = true
  try {
    recommendFiles.value = await getRecommendFiles()
  } finally {
    recommendLoading.value = false
  }
}

watch(
  () => route.params.tag,
  async () => {
    pageNum.value = 1
    await loadTagFiles()
  },
)

onMounted(async () => {
  await loadTagFiles()
  await loadRecommendations()
})
</script>

<style scoped>
.tags-page {
  min-height: 100%;
  padding: 10px 12px 24px;
  background: #f7f8fa;
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 4px 2px 10px;
  color: #999;
  font-size: 12px;
}

.breadcrumb-link {
  color: #666;
  cursor: pointer;
}

.breadcrumb-current {
  color: #333;
  font-weight: 500;
}

.separator {
  color: #bbb;
}

.header-card,
.tag-cloud {
  margin-bottom: 12px;
  padding: 14px;
  background: #fff;
  border-radius: 10px;
}

.tag-title {
  display: flex;
  align-items: center;
  min-height: 34px;
}

.tag-pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.summary-list {
  margin-top: 10px;
}

.summary-item {
  margin-top: 4px;
  color: #777;
  font-size: 12px;
  line-height: 18px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.selectable-tag {
  border: none;
  color: #fff;
  cursor: pointer;
  opacity: 0.9;
}

.selectable-tag.active {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.12);
  opacity: 1;
}

.tag-color-0 {
  background: #4f8cff !important;
}

.tag-color-1 {
  background: #7b61ff !important;
}

.tag-color-2 {
  background: #3bb273 !important;
}

.tag-color-3 {
  background: #f59f00 !important;
}

.tag-color-4 {
  background: #e8590c !important;
}

.tag-color-5 {
  background: #e64980 !important;
}

.tag-color-6 {
  background: #15aabf !important;
}

.tag-color-7 {
  background: #845ef7 !important;
}

.file-list {
  padding-top: 0;
}

.pagination {
  padding: 4px 0 8px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
