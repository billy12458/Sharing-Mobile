<template>
  <MobileLayout>
    <div class="my-files-page">
      <div class="page-header">
        <div>
          <h1>{{ t('files.title') }}</h1>

          <div
            v-if="searchActive"
            class="search-state"
          >
            {{ t('files.searchActive') }}
          </div>
        </div>
      </div>

      <div class="toolbar">
        <van-button block type="primary" plain @click="showUpload = true">
          <van-icon name="upgrade" />
          {{ t('files.upload') }}
        </van-button>

        <van-button
          block
          type="danger"
          plain
          :disabled="selectedIds.length === 0"
          @click="handleBatchDelete"
        >
          <van-icon name="delete-o" />
          {{ t('files.batchDelete') }}
        </van-button>

        <van-button block type="success" plain @click="reloadCurrentList">
          <van-icon name="replay" />
          {{ t('files.refresh') }}
        </van-button>

        <van-button
          block
          type="warning"
          plain
          @click="showAdvancedSearch = true"
        >
          <van-icon name="search" />
          {{ t('files.advancedSearch') }}
        </van-button>
      </div>

      <van-loading v-if="loading" class="loading" size="24px" vertical>
        {{ t('files.loading') }}
      </van-loading>

      <template v-else>
        <van-cell-group inset>
          <MyFileItem
            v-for="file in pageData.content"
            :key="file._id"
            :file="file"
            :selected="selectedIds.includes(file._id)"
            @selection-change="setSelected(file._id, $event)"
            @actions="openActions"
          />
        </van-cell-group>

        <van-empty
          v-if="pageData.content.length === 0"
          :description="t('files.empty')"
        />

        <van-pagination
          v-if="pageData.totalPages > 1"
          v-model="pageNum"
          :total-items="pageData.totalElements"
          :items-per-page="pageSize"
          :page-count="pageData.totalPages"
          force-ellipses
          @change="handlePageChange"
        />
      </template>

      <van-action-sheet
        v-model:show="actionVisible"
        :actions="actionList"
        :cancel-text="t('common.cancel')"
        close-on-click-action
        @select="handleAction"
      />

      <van-dialog
        v-model:show="detailVisible"
        :title="t('files.detail')"
        :show-cancel-button="false"
      >
        <div class="detail-content">
          <div class="detail-row">
            <div class="detail-label">{{ t('files.fileId') }}</div>
            <div class="detail-value">{{ selectedFile?._id || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.filename') }}</div>
            <div class="detail-value">{{ selectedFile?.filename || '-' }}</div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.type') }}</div>
            <div class="detail-value">
              {{ selectedFile?.metadata?._contentType || '-' }}
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.size') }}</div>
            <div class="detail-value">
              {{ formatSize(selectedFile?.length || 0) }}
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.private') }}</div>
            <div class="detail-value">
              {{
                selectedFile?.metadata?.isPrivate
                  ? t('files.privateFile')
                  : t('files.publicFile')
              }}
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.password') }}</div>
            <div class="detail-value password-value">
              <span>
                {{
                  selectedFile?.metadata?.password
                    ? t('files.passwordSet')
                    : t('files.noPassword')
                }}
              </span>

              <van-button
                v-if="selectedFile?.metadata?.password"
                size="mini"
                type="success"
                plain
                @click="handleViewPassword"
              >
                {{ t('files.viewPassword') }}
              </van-button>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.userId') }}</div>
            <div class="detail-value">
              {{ selectedFile?.metadata?.userId || '-' }}
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.tags') }}</div>
            <div class="detail-value tags-value">
              <van-tag
                v-for="tag in selectedFile?.metadata?.tags || []"
                :key="tag"
                type="success"
                size="medium"
              >
                {{ tag }}
              </van-tag>

              <span
                v-if="!selectedFile?.metadata?.tags?.length"
                class="empty-value"
              >
                -
              </span>
            </div>
          </div>

          <div class="detail-row">
            <div class="detail-label">{{ t('files.expire') }}</div>
            <div class="detail-value">
              {{ selectedFile?.metadata?.expire || '-' }}
            </div>
          </div>

          <div class="detail-row description-row">
            <div class="detail-label">{{ t('files.description') }}</div>
            <div class="detail-value description-value">
              {{
                selectedFile?.metadata?.description ||
                t('files.noDescription')
              }}
            </div>
          </div>
        </div>
      </van-dialog>

      <van-dialog
        v-model:show="passwordVisible"
        :title="t('files.password')"
        :show-cancel-button="false"
      >
        <div class="password-dialog-content">
          <van-loading v-if="passwordLoading" size="20px" />
          <div v-else class="decrypted-password">
            {{ decryptedPassword || '-' }}
          </div>
        </div>
      </van-dialog>

      <van-dialog
        v-model:show="codeVisible"
        :title="t('files.extractionCode')"
        :show-cancel-button="false"
      >
        <div class="code-content">
          <van-loading v-if="codeLoading" size="20px" />
          <div v-else>{{ fileCode || '-' }}</div>
        </div>
      </van-dialog>

      <van-dialog
        v-model:show="downloadVisible"
        :title="t('files.downloadPassword')"
        :show-cancel-button="true"
        @confirm="confirmDownload"
      >
        <div class="download-dialog-content">
          <van-field
            v-model="downloadPassword"
            type="password"
            clearable
            :placeholder="t('files.downloadPasswordPlaceholder')"
          />

          <div class="download-dialog-hint">
            {{ t('files.downloadPasswordHint') }}
          </div>
        </div>
      </van-dialog>

      <AdvancedSearchForm
        v-model:show="showAdvancedSearch"
        @search="handleAdvancedSearch"
        @reset="handleSearchReset"
      />

      <van-popup
        v-model:show="showUpload"
        position="bottom"
        round
        :style="{ height: '70%' }"
      >
        <div class="placeholder-panel">
          {{ t('files.uploadComingSoon') }}
        </div>
      </van-popup>

      <RecommendFileList />
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import {
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
} from 'vant'

import MobileLayout from '@/layouts/MobileLayout.vue'
import RecommendFileList from '@/components/RecommendFileList.vue'
import MyFileItem from '@/components/files/MyFileItem.vue'
import AdvancedSearchForm from '@/components/files/AdvancedSearchForm.vue'

import {
  deleteFile,
  getDecryptedPassword,
  getMyPagedFiles,
  searchMyPagedFiles,
  summonShareCode,
  type MyFile,
  type MyFileSearch,
  type MyFilesPage,
} from '@/api/myFiles'

import api from '@/api/client'
import { rowDownload } from '@/utils/download'

const { t } = useI18n()
const router = useRouter()

const pageNum = ref(1)
const pageSize = 15

const pageData = ref<MyFilesPage>({
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
const selectedIds = ref<string[]>([])

const actionVisible = ref(false)
const selectedFile = ref<MyFile | null>(null)

const detailVisible = ref(false)
const codeVisible = ref(false)
const codeLoading = ref(false)
const fileCode = ref('')

const passwordVisible = ref(false)
const passwordLoading = ref(false)
const decryptedPassword = ref('')

const downloadVisible = ref(false)
const downloadPassword = ref('')
const downloadFile = ref<MyFile | null>(null)

const showUpload = ref(false)
const showAdvancedSearch = ref(false)

const searchActive = ref(false)
const searchCriteria = ref<MyFileSearch>({
  filename: '',
  userName: '',
  userId: '',
  _contentType: '',
  description: '',
})

const actionList = computed(() => {
  const actions = [
    { name: t('files.detail'), key: 'detail' },
    { name: t('files.delete'), key: 'delete', color: '#ee0a24' },
    { name: t('files.fileDetail'), key: 'fileDetail' },
    { name: t('files.preview'), key: 'preview' },
    { name: t('files.download'), key: 'download' },
  ]

  const code = selectedFile.value?.metadata?.code
  const isPrivate = selectedFile.value?.metadata?.isPrivate

  if (code) {
    actions.push({
      name: t('files.viewExtractionCode'),
      key: 'viewCode',
    })
  } else if (!isPrivate) {
    actions.push({
      name: t('files.generateExtractionCode'),
      key: 'generateCode',
    })
  }

  return actions
})

async function loadFiles() {
  loading.value = true

  try {
    let nextPageData: MyFilesPage

    if (searchActive.value) {
      nextPageData = await searchMyPagedFiles(
        searchCriteria.value,
        pageNum.value,
        pageSize,
      )
    } else {
      nextPageData = await getMyPagedFiles(
        pageNum.value,
        pageSize,
      )
    }

    // 删除当前页最后一个文件后，后端可能返回当前页为空，
    // 但分页组件已经把页码调整到了上一页。此时主动再请求上一页，
    // 避免页面停留在“空页”。
    if (
      nextPageData.content.length === 0 &&
      pageNum.value > 1
    ) {
      pageNum.value -= 1

      if (searchActive.value) {
        nextPageData = await searchMyPagedFiles(
          searchCriteria.value,
          pageNum.value,
          pageSize,
        )
      } else {
        nextPageData = await getMyPagedFiles(
          pageNum.value,
          pageSize,
        )
      }
    }

    pageData.value = nextPageData
  } catch (error: any) {
    const message = error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('files.loadFailed'),
    })
  } finally {
    loading.value = false
  }
}

function reloadCurrentList() {
  loadFiles()
}

function handleAdvancedSearch(criteria: MyFileSearch) {
  searchCriteria.value = { ...criteria }

  const hasCriteria = Boolean(
    criteria.filename ||
    criteria._contentType ||
    criteria.description,
  )

  searchActive.value = hasCriteria
  pageNum.value = 1

  loadFiles()
}

function handleSearchReset() {
  searchActive.value = false
  searchCriteria.value = {
    filename: '',
    userName: '',
    userId: '',
    _contentType: '',
    description: '',
  }
  pageNum.value = 1
  loadFiles()
}

function handlePageChange(page: number) {
  pageNum.value = page
  loadFiles()

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function setSelected(id: string, value: boolean) {
  if (value) {
    if (!selectedIds.value.includes(id)) {
      selectedIds.value.push(id)
    }
  } else {
    selectedIds.value =
      selectedIds.value.filter((item) => item !== id)
  }
}

async function handleBatchDelete() {
  if (!selectedIds.value.length) return

  try {
    await showConfirmDialog({
      title: t('files.batchDelete'),
      message: t('files.batchDeleteConfirm'),
    })

    await Promise.all(
      selectedIds.value.map((id) => deleteFile(id)),
    )

    showSuccessToast(t('files.deleteSuccess'))

    selectedIds.value = []
    await loadFiles()
  } catch {
  }
}

function openActions(file: MyFile) {
  selectedFile.value = file
  actionVisible.value = true
}


async function openPreview(fileId: string) {
  const previewWindow = window.open('about:blank', '_blank')

  if (!previewWindow) {
    showFailToast(t('files.previewPopupBlocked'))
    return
  }

  try {
    previewWindow.document.title = t('files.previewLoading')

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

      throw new Error(t('files.previewFailed'))
    }

    previewWindow.close()
    showFailToast(t('files.previewProcessing'))
  } catch (error: any) {
    previewWindow.close()

    const message =
      error?.response?.data?.msg ||
      error?.message ||
      t('files.previewFailed')

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : Array.isArray(message)
            ? message.join('\n')
            : t('files.previewFailed'),
      duration: 2500,
    })
  }
}

async function handleAction(action: { key?: string }) {
  const file = selectedFile.value

  if (!file) return

  if (action.key === 'detail') {
    actionVisible.value = false
    detailVisible.value = true
    return
  }

  if (action.key === 'delete') {
    actionVisible.value = false

    try {
      await showConfirmDialog({
        title: t('files.delete'),
        message: t('files.deleteConfirm'),
      })

      await deleteFile(file._id)
      showSuccessToast(t('files.deleteSuccess'))

      selectedIds.value =
        selectedIds.value.filter((id) => id !== file._id)

      await loadFiles()
    } catch {
    }

    return
  }

  if (action.key === 'fileDetail') {
    actionVisible.value = false

    await router.push({
      name: 'FileDetail',
      params: { id: file._id },
    })

    return
  }

  if (action.key === 'preview') {
    actionVisible.value = false
    await openPreview(file._id)
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
    fileCode.value = file.metadata?.code || ''
    codeLoading.value = false
    codeVisible.value = true
    return
  }

  if (action.key === 'generateCode') {
    actionVisible.value = false
    codeVisible.value = true
    codeLoading.value = true
    fileCode.value = ''

    try {
      const response = await summonShareCode(file._id)

      if (response.data.status === 200) {
        const data = response.data.data

        fileCode.value =
          typeof data === 'string'
            ? data
            : data?.code || ''

        if (!fileCode.value) {
          throw new Error('Extraction code is empty.')
        }
      } else {
        throw new Error(
          typeof response.data.msg === 'string'
            ? response.data.msg
            : response.data.msg.join('\n'),
        )
      }
    } catch (error: any) {
      codeVisible.value = false

      const message =
        error?.response?.data?.msg ||
        error?.message ||
        t('files.codeFailed')

      showFailToast({
        message:
          typeof message === 'string'
            ? message
            : Array.isArray(message)
              ? message.join('\n')
              : t('files.codeFailed'),
      })
    } finally {
      codeLoading.value = false
    }
  }
}

async function handleViewPassword() {
  const file = selectedFile.value

  if (!file?._id) return

  passwordVisible.value = true
  passwordLoading.value = true
  decryptedPassword.value = ''

  try {
    const response = await getDecryptedPassword(file._id)
    decryptedPassword.value = response.data.data || ''
  } catch (error: any) {
    passwordVisible.value = false

    const message = error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('files.passwordDecryptFailed'),
    })
  } finally {
    passwordLoading.value = false
  }
}

async function confirmDownload() {
  const file = downloadFile.value

  if (!file?._id) return

  try {
    await rowDownload(
      { _id: file._id },
      downloadPassword.value || '',
    )
  } catch (error: any) {
    const message = error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('files.downloadFailed'),
      duration: 2500,
    })
  } finally {
    downloadVisible.value = false
    downloadPassword.value = ''
    downloadFile.value = null
  }
}

function formatSize(size = 0) {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}

onMounted(loadFiles)
</script>

<style scoped>
.my-files-page {
  min-height: 100%;
  padding: 12px 12px 28px;
  background: #f7f8fa;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-header h1 {
  margin: 0;
  font-size: 24px;
  line-height: 30px;
}

.search-state {
  margin-top: 4px;
  color: #1989fa;
  font-size: 12px;
}

.toolbar {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 14px 0;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 50px 0;
}

.detail-content,
.code-content {
  padding: 16px;
  color: #555;
  line-height: 24px;
}

.code-content {
  text-align: center;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 2px;
}

.password-dialog-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80px;
  padding: 16px 20px;
}

.decrypted-password {
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-all;
  color: #333;
  font-size: 16px;
  line-height: 24px;
  text-align: center;
  user-select: text;
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

.placeholder-panel {
  padding: 40px 20px;
  text-align: center;
  color: #999;
}

.detail-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 4px 16px 12px;
}

.detail-row {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  margin-bottom: 6px;
  color: #1989fa;
  font-size: 14px;
  font-weight: 500;
}

.detail-value {
  min-width: 0;
  color: #888;
  font-size: 14px;
  line-height: 20px;
  white-space: normal;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.password-value {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.tags-value {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.description-value {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.empty-value {
  color: #aaa;
}
</style>
