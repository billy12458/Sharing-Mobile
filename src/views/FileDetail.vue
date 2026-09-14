<template>
  <MobileLayout>
    <div class="file-detail-page">
      <van-loading
        v-if="loading"
        class="loading"
        size="24px"
        vertical
      >
        {{ t('fileDetail.loading') }}
      </van-loading>

      <template v-else-if="file">
        <div class="breadcrumb">
          <span
            class="breadcrumb-link"
            @click="goHome"
          >
            {{ t('common.home') }}
          </span>
          <span class="separator">/</span>
          <span class="breadcrumb-current">
            {{ file.filename || file.metadata?.filename || '-' }}
          </span>
        </div>

        <FileDetailMain
          :file="file"
          :collection-count="collectionCount"
          :download-count="downloadCount"
          :view-count="viewCount"
          :collected="collected"
          @download="handleDownload"
          @collect="handleCollect"
        />

        <FileDetailActions
          @preview="handlePreview"
          @share="handleShare"
          @report="handleReport"
        />

        <van-dialog
          v-model:show="passwordDialogVisible"
          :title="t('fileDetail.password')"
          show-cancel-button
          :before-close="handlePasswordDialogClose"
          @confirm="confirmDownload"
          @cancel="cancelPasswordDialog"
        >
          <div class="password-dialog-content">
            <van-field
              v-model="downloadPassword"
              type="password"
              :placeholder="t('fileDetail.passwordPrompt')"
              autocomplete="current-password"
              clearable
              @keyup.enter="confirmDownload"
            />
          </div>
        </van-dialog>

        <RecommendFileList />
      </template>

      <van-empty
        v-else-if="error"
        :description="t('fileDetail.loadFailed')"
      />
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import MobileLayout from '@/layouts/MobileLayout.vue'
import RecommendFileList from '@/components/RecommendFileList.vue'
import FileDetailMain from '@/components/file-detail/FileDetailMain.vue'
import FileDetailActions from '@/components/file-detail/FileDetailActions.vue'

import { rowDownload } from '@/utils/download'
import { showFailToast, showSuccessToast } from 'vant'

import {
  collectFile,
  getCollectionCount,
  getCollectedState,
  getDownloadCount,
  getFileDetail,
  getPageViewCount,
  type FileDetail as FileDetailModel,
} from '@/api/fileDetail'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const passwordDialogVisible = ref(false)
const downloadPassword = ref('')

const loading = ref(true)
const error = ref(false)

const file = ref<FileDetailModel | null>(null)

const collectionCount = ref<number | string>(0)
const downloadCount = ref<number | string>(0)
const viewCount = ref<number | string>(0)
const collected = ref(false)

const fileId = computed(() => String(route.params.id || ''))

async function loadDetail() {
  const id = fileId.value

  if (!id) {
    error.value = true
    loading.value = false
    return
  }

  loading.value = true
  error.value = false

  // Clear the previous detail immediately so a route change never
  // temporarily shows data belonging to the previous file.
  file.value = null
  collectionCount.value = 0
  downloadCount.value = 0
  viewCount.value = 0
  collected.value = false

  try {
    const [detail, collection, download, views] = await Promise.all([
      getFileDetail(id),
      getCollectionCount(id),
      getDownloadCount(id),
      getPageViewCount(id),
    ])

    file.value = detail
    collectionCount.value = collection ?? 0
    downloadCount.value = download ?? 0
    viewCount.value = views ?? 0

    try {
      collected.value = await getCollectedState(id)
    } catch {
      collected.value = false
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function handleCollect() {
  if (!file.value || collected.value) {
    return
  }

  try {
    await collectFile(fileId.value, {
      filename: file.value.filename || file.value.metadata?.filename || '',
      userId: file.value.metadata?.userId || '',
      userName: file.value.metadata?.userName || '',
    })

    // The backend is the source of truth for the final collection state.
    collected.value = await getCollectedState(fileId.value)
    collectionCount.value = await getCollectionCount(fileId.value)

    if (collected.value) {
      showSuccessToast({
        message: t('fileDetail.collectSuccess'),
        duration: 1800,
      })
    } else {
      showFailToast({
        message: t('fileDetail.collectFailed'),
        duration: 2500,
      })
    }
  } catch {
    showFailToast({
      message: t('fileDetail.collectFailed'),
      duration: 2500,
    })
  }
}

async function handleDownload() {
  if (!file.value) {
    return
  }

  downloadPassword.value = ''
  passwordDialogVisible.value = true
}

function cancelPasswordDialog() {
  passwordDialogVisible.value = false
  downloadPassword.value = ''
}

function handlePasswordDialogClose(action: 'confirm' | 'cancel') {
  if (action === 'cancel') {
    cancelPasswordDialog()
  }
}

async function confirmDownload() {
  if (!file.value) {
    return
  }

  const password = downloadPassword.value

  try {
    rowDownload(
      {
        _id: fileId.value,
      },
      password,
    )
    passwordDialogVisible.value = false
    downloadPassword.value = ''
  } catch {
    showFailToast({
      message: t('fileDetail.downloadFailed'),
      duration: 2500,
    })
  }
}

function handlePreview() {
}

async function handleShare() {
  if (!file.value) return

  const name = file.value.filename || ''
  const url = window.location.href

  if (navigator.share) {
    try {
      await navigator.share({
        title: name,
        url,
      })
    } catch {
    }
  } else if (navigator.clipboard) {
    await navigator.clipboard.writeText(url)
  }
}

function handleReport() {
}

async function goHome() {
  await router.push('/')
}

watch(
  () => route.params.id,
  async (newId, oldId) => {
    if (newId === oldId) {
      return
    }

    passwordDialogVisible.value = false
    downloadPassword.value = ''

    await loadDetail()
  },
)

onMounted(loadDetail)
</script>

<style scoped>
.file-detail-page {
  min-height: 100%;
  padding: 10px 12px 24px;
  background: #f7f8fa;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 2px 10px;
  color: #999;
  font-size: 12px;
}

.breadcrumb-link {
  color: #666;
}

.breadcrumb-current {
  flex: 1;
  overflow: hidden;
  color: #333;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.separator {
  color: #bbb;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.password-dialog-content {
  padding: 8px 0;
}
</style>
