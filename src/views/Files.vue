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
        :style="{ height: '78%' }"
        :close-on-click-overlay="!uploading"
        :before-close="handleUploadBeforeClose"
        @open="handleUploadOpen"
        @closed="resetUploadState"
      >
        <div class="upload-panel">
          <div class="upload-panel-header">
            <div class="upload-panel-title">
              {{ t('files.upload') }}
            </div>

            <van-icon
              v-if="!uploading"
              name="cross"
              size="20"
              @click="showUpload = false"
            />
          </div>

          <div class="upload-panel-body">
            <!-- <div class="upload-section-title">
              {{ t('files.simpleUpload') }}
            </div> -->

            <van-uploader
              v-model="uploadList"
              :max-count="1"
              :disabled="uploading"
              :deletable="!uploading"
              accept="text/*,image/*,application/*"
              :after-read="handleUploadFile"
              :before-delete="handleUploadDelete"
            />

            <div
              v-if="selectedUploadFile"
              class="upload-file-name"
            >
              {{ selectedUploadFile.name }}
            </div>

            <div class="upload-field-row">
              <div class="upload-field-label">
                {{ t('files.tags') }}
              </div>
              <van-tag type="primary">
                {{ t('files.defaultTag') }}
              </van-tag>
            </div>

            <div class="upload-field-row upload-description-row">
              <div class="upload-field-label">
                {{ t('files.description') }}
              </div>
              <div class="upload-description">
                {{ t('files.noDescription') }}
              </div>
            </div>

            <div class="upload-field-row captcha-row">
              <div class="upload-field-label">
                {{ t('files.captcha') }}
              </div>

              <div class="captcha-control">
                <van-field
                  v-model="uploadCode"
                  class="captcha-input"
                  :placeholder="t('files.captchaPlaceholder')"
                  clearable
                  :disabled="uploading"
                />

                <img
                  v-if="captchaImage"
                  :src="captchaImage"
                  class="captcha-image"
                  :alt="t('files.captchaAlt')"
                  @click="getCaptcha"
                />
              </div>
            </div>

            <div
              v-if="captchaSeconds > 0"
              class="captcha-hint"
            >
              {{ t('files.captchaExpiresIn', { seconds: captchaSeconds }) }}
            </div>

            <div class="upload-actions">
              <van-button
                type="primary"
                block
                :loading="uploading"
                :disabled="!selectedUploadFile || !uploadCode.trim() || captchaExpired"
                @click="submitSimpleUpload"
              >
                {{ t('files.uploadAction') }}
              </van-button>

              <van-button
                block
                plain
                :disabled="uploading"
                @click="showUpload = false"
              >
                {{ t('common.cancel') }}
              </van-button>
            </div>
          </div>
        </div>
      </van-popup>

      <van-popup
        v-model:show="uploadProgressVisible"
        round
        position="center"
        :style="{ width: '82%', padding: '24px 20px' }"
        :close-on-click-overlay="false"
        :close-on-popstate="false"
      >
        <div class="upload-progress-dialog">
          <div class="upload-progress-dialog-title">
            {{ t('files.uploading') }}
          </div>

          <div class="upload-progress-dialog-file">
            {{ uploadFilename || '-' }}
          </div>

          <van-progress
            :percentage="uploadProgress"
            :show-pivot="true"
            stroke-width="8"
            class="upload-progress-dialog-bar"
          />

          <div class="upload-progress-dialog-text">
            {{ t('files.uploading', { percent: uploadProgress }) }}
          </div>
        </div>
      </van-popup>

      <RecommendFileList />
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
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

// 普通上传
const uploadList = ref<any[]>([])
const selectedUploadFile = ref<File | null>(null)
const uploadCode = ref('')
const uploadDescription = '暂无描述'
const captchaImage = ref('')
const captchaSeconds = ref(0)
const captchaExpired = ref(false)
const captchaTimer = ref<ReturnType<typeof window.setInterval> | null>(null)
const uploadUserName = ref('')
const uploading = ref(false)
const uploadProgressVisible = ref(false)
const uploadFilename = ref('')
const uploadProgress = ref(0)

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

function clearCaptchaTimer() {
  if (captchaTimer.value !== null) {
    window.clearInterval(captchaTimer.value)
    captchaTimer.value = null
  }
}

async function getCaptcha() {
  if (uploading.value) return

  try {
    clearCaptchaTimer()
    captchaSeconds.value = 0
    captchaExpired.value = false

    const response = await api.get('/captcha/getImage')
    captchaImage.value = response.data

    captchaSeconds.value = 300
    captchaTimer.value = window.setInterval(() => {
      captchaSeconds.value -= 1

      if (captchaSeconds.value <= 0) {
        clearCaptchaTimer()
        captchaSeconds.value = 0
        captchaExpired.value = true
        showFailToast(t('files.captchaExpired'))
      }
    }, 1000)
  } catch {
    captchaImage.value = ''
    captchaExpired.value = true
    showFailToast(t('files.captchaFetchFailed'))
  }
}

async function getUploadUserName() {
  try {
    const response = await api.get('/user/userName/my')
    const userName = response.data?.data?.userName || ''
    uploadUserName.value = userName
    return userName
  } catch {
    uploadUserName.value = ''
    return ''
  }
}

async function handleUploadOpen() {
  await Promise.all([
    getCaptcha(),
    getUploadUserName(),
  ])
}

function handleUploadBeforeClose() {
  return !uploading.value && !uploadProgressVisible.value
}

function handleUploadFile(fileItem: any) {
  const file = fileItem?.file

  if (!(file instanceof File)) {
    selectedUploadFile.value = null
    return
  }

  selectedUploadFile.value = file
}

function handleUploadDelete() {
  selectedUploadFile.value = null
  return true
}

function resetUploadState() {
  if (uploading.value || uploadProgressVisible.value) return

  clearCaptchaTimer()
  uploadList.value = []
  selectedUploadFile.value = null
  uploadCode.value = ''
  captchaImage.value = ''
  captchaSeconds.value = 0
  captchaExpired.value = false
  uploadUserName.value = ''
  uploadFilename.value = ''
  uploadProgress.value = 0
}

async function submitSimpleUpload() {
  const file = selectedUploadFile.value

  if (!file) {
    showFailToast(t('files.fileRequired'))
    return
  }

  if (!uploadCode.value.trim()) {
    showFailToast(t('files.captchaRequired'))
    return
  }

  if (captchaExpired.value) {
    showFailToast(t('files.captchaExpired'))
    return
  }

  try {
    const checkResponse = await api.post('/files/preload/check', {
      filename: file.name,
      code: uploadCode.value.trim(),
      description: uploadDescription,
    })

    if (checkResponse.data?.status !== 200) {
      // 后端业务校验失败（例如文件类型、文件大小、描述内容等），
      // 当前验证码已经参与过本次校验，刷新验证码后再允许用户重试。
      await getCaptcha()

      throw new Error(
        typeof checkResponse.data?.msg === 'string'
          ? checkResponse.data.msg
          : Array.isArray(checkResponse.data?.msg)
            ? checkResponse.data.msg.join('\n')
            : t('files.uploadCheckFailed'),
      )
    }

    let userName = uploadUserName.value

    if (!userName) {
      userName = await getUploadUserName()
    }

    if (!userName) {
      throw new Error(t('files.uploadFailed'))
    }

    uploadFilename.value = file.name
    uploadProgress.value = 0

    // 与 PC 端一致：先关闭普通上传窗口，再打开不可关闭的进度窗口。
    showUpload.value = false
    uploading.value = true
    uploadProgressVisible.value = true

    const uploadDTO = JSON.stringify({
      userId: userName,
      filename: file.name,
      userName,
      description: uploadDescription,
      isPrivate: false,
      password: null,
      code: uploadCode.value.trim(),
      expire: '',
      tags: ['其他'],
    })

    const form = new FormData()

    form.append(
      'uploadDTO',
      new Blob([uploadDTO], {
        type: 'application/json',
      }),
    )
    form.append('uploadFile', file)

    const response = await api.put(
      '/files/upload?isPrivate=0',
      form,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return

          uploadProgress.value = Math.min(
            100,
            Math.round(
              (progressEvent.loaded / progressEvent.total) * 100,
            ),
          )
        },
      },
    )

    if (response.data?.status !== 200) {
      // 上传接口返回业务失败时，同样刷新验证码，避免用户继续使用已经失效/消耗的验证码。
      uploadProgressVisible.value = false
      uploading.value = false

      // 此时普通上传弹窗已经关闭，主动清理旧文件/验证码状态。
      resetUploadState()
      await getCaptcha()

      throw new Error(
        typeof response.data?.msg === 'string'
          ? response.data.msg
          : Array.isArray(response.data?.msg)
            ? response.data.msg.join('\n')
            : t('files.uploadFailed'),
      )
    }

    uploadProgress.value = 100

    // 给用户一个极短的 100% 完成反馈，再关闭进度窗口。
    await new Promise((resolve) => {
      window.setTimeout(resolve, 250)
    })

    uploadProgressVisible.value = false
    uploading.value = false

    // 上传进度窗口关闭后显式清理普通上传表单状态。
    // 普通上传弹窗在真正开始上传时已经关闭，因此此时不能再依赖
    // @closed -> resetUploadState()，否则旧的文件/验证码会残留到下一次打开。
    resetUploadState()

    showSuccessToast(t('files.uploadSuccess'))
    await loadFiles()
  } catch (error: any) {
    const status = error?.response?.status
    const serverMessage = error?.response?.data?.msg

    // HTTP 层失败（如 413 文件过大）同样刷新验证码。
    // 业务 status 非 200 的情况已经在上面的分支中刷新过，这里只在 HTTP 错误时再次保证刷新。
    if (error?.response) {
      uploadProgressVisible.value = false
      uploading.value = false

      // 上传请求已经进入独立的进度窗口，此时普通上传弹窗已经关闭。
      // 因此失败后主动清理旧表单状态，下一次打开时重新获取验证码。
      resetUploadState()
      await getCaptcha()
    }

    let message = t('files.uploadNetworkFailed')

    if (status === 413) {
      message = t('files.fileTooLarge')
    } else if (typeof serverMessage === 'string') {
      message = serverMessage
    } else if (Array.isArray(serverMessage)) {
      message = serverMessage.join('\n')
    } else if (error?.message) {
      message = error.message
    }

    uploadProgressVisible.value = false
    uploading.value = false

    showFailToast({
      message,
      duration: 2500,
    })
  }
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

onBeforeUnmount(() => {
  clearCaptchaTimer()
})
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

.upload-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
}

.upload-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f2f3f5;
}

.upload-panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.upload-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 12px 24px;
}

.upload-section-title {
  margin-bottom: 14px;
  font-size: 14px;
  color: #323233;
  font-weight: 600;
}

.upload-file-name {
  margin: 10px 4px 14px;
  color: #646566;
  font-size: 13px;
  line-height: 20px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.upload-field-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 4px 4px;
}

.upload-description-row {
  align-items: flex-start;
}

.upload-field-label {
  min-width: 42px;
  color: #323233;
  font-size: 14px;
}

.upload-description {
  flex: 1;
  color: #646566;
  font-size: 14px;
  line-height: 20px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.captcha-row {
  align-items: center;
  padding-top: 12px;
}

.captcha-control {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-input {
  flex: 1;
  min-width: 0;
}

.captcha-control :deep(.van-cell) {
  min-height: 40px;
  padding: 0 10px;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  background: #fff;
}

.captcha-control :deep(.van-cell::after) {
  display: none;
}

.captcha-control :deep(.van-field__control) {
  height: 38px;
  line-height: 38px;
}

.captcha-image {
  flex: 0 0 125px;
  width: 125px;
  height: 40px;
  object-fit: contain;
  border: 1px solid #ebedf0;
  border-radius: 4px;
  cursor: pointer;
}

.captcha-hint {
  padding: 6px 16px 0;
  color: #969799;
  font-size: 12px;
  text-align: right;
}

.upload-progress-dialog {
  width: 100%;
}

.upload-progress-dialog-title {
  color: #323233;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  text-align: center;
}

.upload-progress-dialog-file {
  margin-top: 14px;
  color: #646566;
  font-size: 13px;
  line-height: 20px;
  text-align: center;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.upload-progress-dialog-bar {
  margin: 20px 0 10px;
}

.upload-progress-dialog-text {
  color: #969799;
  font-size: 12px;
  line-height: 18px;
  text-align: center;
}

.upload-actions {
  display: grid;
  gap: 10px;
  margin-top: 20px;
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
