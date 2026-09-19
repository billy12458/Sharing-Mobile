<template>
  <MobileLayout>
    <div class="search-page">
      <div class="mode-switch">
        <van-tabs v-model:active="searchMode" type="card" @change="handleModeChange">
          <van-tab name="filename" :title="t('search.fileNameMode')" />
          <van-tab name="tags" :title="t('search.tagMode')" />
        </van-tabs>
      </div>

      <van-search v-if="searchMode === 'filename'" v-model="query" shape="round" clearable
        :placeholder="t('search.placeholder')" @search="submitFilenameSearch" />

      <template v-if="searchMode === 'filename'">
        <div class="section-header">
          <div class="section-title">
            {{ t('search.history') }}
          </div>

          <van-button v-if="history.length" size="small" plain type="danger" @click="clearHistory">
            {{ t('search.clearHistory') }}
          </van-button>
        </div>

        <div v-if="history.length" class="history-list">
          <van-cell v-for="item in visibleHistory" :key="item" :title="item" is-link @click="useHistory(item)" />

          <van-cell v-if="history.length > HISTORY_VISIBLE_LIMIT" class="history-toggle" :title="historyExpanded
              ? t('search.collapseHistory')
              : t('search.expandHistory')
            " is-link @click="historyExpanded = !historyExpanded" />
        </div>

        <van-empty v-else :description="t('search.noHistory')" />
      </template>

      <template v-else>
        <div class="tag-header">
          <div>
            <div class="section-title">
              {{ t('search.selectedTags', {
                count: selectedTags.length,
              }) }}
            </div>

            <div class="tag-subtitle">
              {{ t('search.tagSelectionHint') }}
            </div>
          </div>

          <van-button v-if="selectedTags.length" size="small" plain type="primary" @click="clearTags">
            {{ t('search.clearTags') }}
          </van-button>
        </div>

        <div v-if="selectedTags.length" class="selected-tags">
          <van-tag v-for="tag in selectedTags" :key="tag" type="primary" closeable size="medium"
            @close="removeTag(tag)">
            {{ tag }}
          </van-tag>
        </div>

        <div class="tag-section-header">
          <div class="tag-section-title">
            {{ t('search.popularTags') }}
          </div>

          <van-button size="small" plain type="primary" @click="tagPopupVisible = true">
            {{ t('search.moreTags') }}
          </van-button>
        </div>

        <div class="tag-grid">
          <van-tag v-for="(tag, index) in popularTags" :key="tag" size="medium"
            :color="selectedTags.includes(tag) ? '#323233' : tagColors[index % tagColors.length]"
            class="tag-option" @click="toggleTag(tag)">
            {{ tag }}
          </van-tag>
        </div>

        <van-button block type="primary" class="tag-search-button" :disabled="selectedTags.length === 0"
          :loading="loading" @click="submitTagSearch">
          {{ t('search.search') }}
        </van-button>

        <div v-if="hasSearchResult" class="tag-result-clear">
          <van-button size="small" plain type="danger" @click="clearResults">
            {{ t('search.clearResults') }}
          </van-button>
        </div>
      </template>

      <template v-if="hasSearchResult">
        <div class="result-header">
          <div class="result-title">
            {{ t('search.resultCount', {
              count: pageData.totalElements,
            }) }}
          </div>

          <van-button v-if="searchMode === 'filename'" size="small" plain type="danger" @click="clearResults">
            {{ t('search.clearResults') }}
          </van-button>
        </div>

        <van-loading v-if="loading" class="loading" size="24px" vertical>
          {{ t('search.loading') }}
        </van-loading>

        <template v-else>
          <div class="result-list">
            <SearchResultItem v-for="item in pageData.content" :key="getItemKey(item)" :file="item"
              @actions="openActions" />
          </div>

          <van-empty v-if="pageData.content.length === 0" :description="t('search.empty')" />

          <van-pagination v-if="pageData.totalPages > 1" v-model="pageNum" :total-items="pageData.totalElements"
            :items-per-page="pageSize" :page-count="pageData.totalPages" force-ellipses @change="handlePageChange" />
        </template>
      </template>

      <van-action-sheet v-model:show="actionVisible" :actions="actionList" :cancel-text="t('common.cancel')"
        close-on-click-action @select="handleAction" />

      <van-popup v-model:show="tagPopupVisible" position="bottom" round closeable class="tag-popup">
        <div class="tag-popup-content">
          <div class="tag-popup-title">
            {{ t('search.allTags') }}
          </div>

          <div class="tag-popup-count">
            {{ t('search.selectedTags', {
              count: selectedTags.length,
            }) }}
          </div>

          <div class="all-tag-grid">
            <van-tag v-for="(tag, index) in allTags" :key="tag" size="medium"
                :color="selectedTags.includes(tag) ? '#323233' : tagColors[index % tagColors.length]"
                class="tag-option" @click="toggleTag(tag)">
              {{ tag }}
            </van-tag>
          </div>
        </div>
      </van-popup>

      <van-dialog v-model:show="downloadVisible" :title="t('search.downloadPassword')" :show-cancel-button="true"
        @confirm="confirmDownload">
        <div class="download-dialog-content">
          <van-field v-model="downloadPassword" type="password" clearable :placeholder="t('search.downloadPasswordPlaceholder')
            " />

          <div class="download-dialog-hint">
            {{ t('search.downloadPasswordHint') }}
          </div>
        </div>
      </van-dialog>

      <van-dialog v-model:show="codeVisible" :title="t('search.extractionCode')" :show-cancel-button="false">
        <div class="code-content">
          {{ fileCode || '-' }}
        </div>
      </van-dialog>

      <RecommendFileList />
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'
import {
  useI18n,
} from 'vue-i18n'
import {
  useRoute,
  useRouter,
} from 'vue-router'
import {
  showFailToast,
} from 'vant'

import MobileLayout from '@/layouts/MobileLayout.vue'
import RecommendFileList from '@/components/RecommendFileList.vue'
import SearchResultItem from '@/components/search/SearchResultItem.vue'

import {
  searchFilesByKeyword,
  searchFilesByTags,
  type FileSearchPage,
  type SearchFileHit,
} from '@/api/search'

import api from '@/api/client'

import {
  rowDownload,
} from '@/utils/download'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const HISTORY_STORAGE_KEY = 'quickysharing.search.history'
const HISTORY_VISIBLE_LIMIT = 5

const searchMode = ref<'filename' | 'tags'>('filename')
const query = ref(String(route.query.q || ''))

const history = ref<string[]>(loadHistory())
const historyExpanded = ref(false)

const selectedTags = ref<string[]>([])

const allTags = [
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

const tagColors = [
  '#1989fa',
  '#07c160',
  '#ff976a',
  '#ee0a24',
  '#7232dd',
  '#009688',
]

const popularTags = [
  '编程',
  '教程',
  '外语',
  '数学',
  '物理',
  '生活',
  '游戏',
  '其他',
]

const tagPopupVisible = ref(false)

const visibleHistory = computed(() => {
  if (historyExpanded.value) {
    return history.value
  }

  return history.value.slice(
    0,
    HISTORY_VISIBLE_LIMIT,
  )
})

const pageNum = ref(1)
const pageSize = 10

const pageData = ref<FileSearchPage>({
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
const hasSearchResult = ref(false)

const actionVisible = ref(false)
const selectedFile = ref<SearchFileHit | null>(null)

const downloadVisible = ref(false)
const downloadPassword = ref('')
const downloadFile = ref<SearchFileHit | null>(null)

const codeVisible = ref(false)
const fileCode = ref('')

const actionList = computed(() => {
  const actions = [
    {
      name: t('search.detail'),
      key: 'detail',
    },
    {
      name: t('search.preview'),
      key: 'preview',
    },
    {
      name: t('search.download'),
      key: 'download',
    },
  ]

  // const code = selectedFile.value?.content?.metadata?.code
  // const isPrivate =
  //   selectedFile.value?.content?.metadata?.isPrivate

  // if (code) {
  //   actions.push({
  //     name: t('search.viewExtractionCode'),
  //     key: 'viewCode',
  //   })
  // } else if (!isPrivate) {
  //   actions.push({
  //     name: t('search.generateExtractionCode'),
  //     key: 'generateCode',
  //   })
  // }

  return actions
})

function loadHistory(): string[] {
  try {
    const raw = localStorage.getItem(
      HISTORY_STORAGE_KEY,
    )

    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)

    return Array.isArray(parsed)
      ? parsed.filter(
        (item): item is string =>
          typeof item === 'string',
      ).slice(0, 20)
      : []
  } catch {
    return []
  }
}

function saveHistory() {
  localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(history.value),
  )
}

function addHistory(value: string) {
  history.value = [
    value,
    ...history.value.filter(
      (item) => item !== value,
    ),
  ].slice(0, 20)

  saveHistory()
  historyExpanded.value = false
}

function clearHistory() {
  history.value = []
  historyExpanded.value = false
  localStorage.removeItem(
    HISTORY_STORAGE_KEY,
  )
}

function getFileId(file: SearchFileHit) {
  return (
    file.content?.id ||
    file.content?._id ||
    file.id ||
    ''
  )
}

function getItemKey(file: SearchFileHit) {
  return getFileId(file) || JSON.stringify(file)
}

async function submitFilenameSearch() {
  const value = query.value.trim()

  if (!value) {
    return
  }

  addHistory(value)

  pageNum.value = 1
  hasSearchResult.value = true

  await router.replace({
    path: '/search',
    query: {
      q: value,
    },
  })

  await loadResults()
}

async function submitTagSearch() {
  if (!selectedTags.value.length) {
    return
  }

  pageNum.value = 1
  hasSearchResult.value = true

  await loadResults()
}

async function loadResults() {
  loading.value = true

  try {
    if (searchMode.value === 'filename') {
      pageData.value =
        await searchFilesByKeyword(
          query.value.trim(),
          pageNum.value,
          pageSize,
        )
    } else {
      pageData.value =
        await searchFilesByTags(
          selectedTags.value,
          pageNum.value,
          pageSize,
        )
    }
  } catch (error: any) {
    const message =
      error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('search.searchFailed'),
      duration: 2500,
    })

    pageData.value = {
      ...pageData.value,
      content: [],
      totalPages: 0,
      totalElements: 0,
    }
  } finally {
    loading.value = false
  }
}

async function handlePageChange(page: number) {
  pageNum.value = page
  await loadResults()

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function useHistory(value: string) {
  query.value = value
  searchMode.value = 'filename'
  submitFilenameSearch()
}

function toggleTag(tag: string) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value =
      selectedTags.value.filter(
        (item) => item !== tag,
      )

    return
  }

  if (selectedTags.value.length >= 3) {
    showFailToast(
      t('search.maxTags'),
    )
    return
  }

  selectedTags.value.push(tag)
}

function removeTag(tag: string) {
  selectedTags.value =
    selectedTags.value.filter(
      (item) => item !== tag,
    )
}

function clearTags() {
  selectedTags.value = []
}

async function handleModeChange(
  mode: 'filename' | 'tags',
) {
  searchMode.value = mode

  // 清除当前搜索条件
  query.value = ''
  selectedTags.value = []

  // 清除当前搜索结果
  hasSearchResult.value = false
  pageNum.value = 1

  pageData.value = {
    ...pageData.value,
    content: [],
    totalPages: 0,
    totalElements: 0,
  }

  // 清理 URL 里的文件名搜索参数
  await router.replace({
    path: '/search',
  })

  // 清理当前 UI 状态
  historyExpanded.value = false
  tagPopupVisible.value = false
  actionVisible.value = false
  selectedFile.value = null
}

async function clearResults() {
  hasSearchResult.value = false
  pageNum.value = 1

  pageData.value = {
    ...pageData.value,
    content: [],
    totalPages: 0,
    totalElements: 0,
  }

  if (searchMode.value === 'filename') {
    query.value = ''

    await router.replace({
      path: '/search',
    })
  } else {
    selectedTags.value = []
  }
}

function openActions(file: SearchFileHit) {
  selectedFile.value = file
  actionVisible.value = true
}


async function openPreview(fileId: string) {
  const previewWindow = window.open('about:blank', '_blank')

  if (!previewWindow) {
    showFailToast(t('search.previewPopupBlocked'))
    return
  }

  try {
    previewWindow.document.title = t('search.previewLoading')

    const maxAttempts = 20

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const response = await api.get<{
        status: number
        msg: string | string[]
        data?: {
          status?: 'READY' | 'PROCESSING' | string
          previewUrl?: string
        }
      }>(`/files/preview/${encodeURIComponent(fileId)}`)

      const body = response.data
      const data = body.data

      if (body.status !== 200) {
        throw new Error(
          typeof body.msg === 'string'
            ? body.msg
            : body.msg.join('\n'),
        )
      }

      if (data?.status === 'READY' && data.previewUrl) {
        previewWindow.location.href = data.previewUrl
        return
      }

      if (data?.status === 'PROCESSING') {
        await new Promise((resolve) => {
          window.setTimeout(resolve, 1000)
        })
        continue
      }

      throw new Error(t('search.previewFailed'))
    }

    previewWindow.close()
    showFailToast(t('search.previewProcessing'))
  } catch (error: any) {
    previewWindow.close()

    const message =
      error?.response?.data?.msg ||
      error?.message ||
      t('search.previewFailed')

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : Array.isArray(message)
            ? message.join('\n')
            : t('search.previewFailed'),
      duration: 2500,
    })
  }
}

async function handleAction(
  action: { key?: string },
) {
  const file = selectedFile.value

  if (!file) {
    return
  }

  const fileId = getFileId(file)

  if (action.key === 'detail') {
    actionVisible.value = false

    if (!fileId) {
      return
    }

    await router.push({
      name: 'FileDetail',
      params: {
        id: fileId,
      },
    })

    return
  }

  if (action.key === 'preview') {
    actionVisible.value = false

    if (!fileId) {
      showFailToast(t('search.fileIdMissing'))
      return
    }

    await openPreview(fileId)
    return
  }

  if (action.key === 'download') {
    actionVisible.value = false
    downloadFile.value = file
    downloadPassword.value = ''
    downloadVisible.value = true
    return
  }

  if (action.key === 'viewCode') {
    actionVisible.value = false

    fileCode.value =
      file.content?.metadata?.code || ''

    codeVisible.value = true

    return
  }

  if (action.key === 'generateCode') {
    actionVisible.value = false

    showFailToast(
      t('search.generateCodeComingSoon'),
    )
  }
}

async function confirmDownload() {
  const file = downloadFile.value

  if (!file) {
    return
  }

  const fileId = getFileId(file)

  if (!fileId) {
    showFailToast(
      t('search.fileIdMissing'),
    )
    return
  }

  try {
    rowDownload(
      { _id: fileId },
      downloadPassword.value || '',
    )
  } catch {
    showFailToast(
      t('search.downloadFailed'),
    )
  } finally {
    downloadVisible.value = false
    downloadPassword.value = ''
    downloadFile.value = null
  }
}

watch(
  () => route.query.q,
  (value) => {
    if (!value) {
      return
    }

    const text = String(value)

    if (text !== query.value) {
      query.value = text
    }

    if (searchMode.value !== 'filename') {
      searchMode.value = 'filename'
    }
  },
)

onMounted(() => {
  if (query.value.trim()) {
    searchMode.value = 'filename'
    hasSearchResult.value = true
    loadResults()
  }
})
</script>

<style scoped>
.search-page {
  min-height: 100%;
  padding: 12px;
  background: #f7f8fa;
}

.mode-switch {
  margin-bottom: 8px;
}

.section-header,
.tag-header,
.tag-section-header,
.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.section-title {
  margin: 14px 2px 8px;
  color: #222;
  font-size: 18px;
  font-weight: 600;
}

.history-list {
  overflow: hidden;
  border-radius: 14px;
  background: #fff;
}

.history-toggle {
  color: #1989fa;
}

.tag-header {
  margin-top: 4px;
}

.tag-header .section-title,
.result-header .result-title {
  margin-bottom: 0;
}

.tag-subtitle {
  margin: -2px 2px 8px;
  color: #999;
  font-size: 12px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tag-section-header {
  margin: 16px 2px 8px;
}

.tag-section-title {
  color: #555;
  font-size: 14px;
  font-weight: 600;
}

.tag-grid,
.all-tag-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-option {
  padding: 6px 9px;
  border-radius: 6px;
  cursor: pointer;
}

.tag-search-button {
  margin-top: 16px;
}

.tag-result-clear {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.result-header {
  margin: 16px 2px 8px;
}

.result-title {
  color: #222;
  font-size: 14px;
  font-weight: 600;
}

.result-list {
  overflow: hidden;
  border-radius: 12px;
  background: #fff;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 50px 0;
}

.tag-popup {
  max-height: 75vh;
}

.tag-popup-content {
  max-height: 75vh;
  overflow-y: auto;
  padding: 22px 16px 26px;
}

.tag-popup-title {
  margin-bottom: 4px;
  color: #222;
  font-size: 20px;
  font-weight: 600;
}

.tag-popup-count {
  margin-bottom: 14px;
  color: #999;
  font-size: 12px;
}

.all-tag-grid {
  padding-bottom: 10px;
}

.download-dialog-content {
  padding: 8px 16px 16px;
}

.download-dialog-hint {
  padding: 8px 4px 0;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.code-content {
  padding: 22px 16px;
  color: #333;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  letter-spacing: 2px;
}
</style>
