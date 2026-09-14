<template>
  <van-cell-group inset class="detail-card">
    <van-cell>
      <template #title>
        <div class="file-header">
          <img
            class="file-icon"
            :src="getFileIcon(file.filename || file.metadata?.filename || '')"
            :alt="file.filename || file.metadata?.filename || ''"
          />

          <div class="file-title-area">
            <div class="file-name">
              {{ file.filename || file.metadata?.filename || '-' }}
            </div>

            <div
              v-if="file.metadata?.tags?.length"
              class="file-tags"
            >
              <van-tag
                v-for="tag in file.metadata.tags"
                :key="tag"
                type="success"
                size="medium"
              >
                {{ tag }}
              </van-tag>
            </div>
          </div>
        </div>
      </template>
    </van-cell>

    <van-cell
      :title="t('fileDetail.fileSize')"
      :value="formatSize(file.length)"
    />

    <van-cell
      :title="t('fileDetail.uploader')"
      :value="file.metadata?.userName || '-'"
    />

    <van-cell
      :title="t('fileDetail.type')"
      :value="file.metadata?._contentType || '-'"
    />

    <van-cell
      :title="t('fileDetail.collectionCount')"
      :value="collectionCount"
    />

    <van-cell
      :title="t('fileDetail.downloadCount')"
      :value="downloadCount"
    />

    <van-cell
      :title="t('fileDetail.viewCount')"
      :value="viewCount"
    />

    <van-cell
      :title="t('fileDetail.expireTime')"
      :value="file.metadata?.expire || '-'"
    />

    <van-cell
      :title="t('fileDetail.description')"
      :value="file.metadata?.description || t('fileDetail.noDescription')"
    />

    <div class="actions">
      <van-button
        type="primary"
        block
        @click="$emit('download')"
      >
        {{ t('fileDetail.download') }}
      </van-button>

      <van-button
        :type="collected ? 'danger' : 'success'"
        block
        :disabled="collected"
        @click="$emit('collect')"
      >
        {{ collected ? t('fileDetail.collected') : t('fileDetail.collect') }}
      </van-button>
    </div>
  </van-cell-group>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { getFileIcon } from '@/utils/fileIcon'
import type { FileDetail } from '@/api/fileDetail'

defineProps<{
  file: FileDetail
  collectionCount: number | string
  downloadCount: number | string
  viewCount: number | string
  collected: boolean
}>()

defineEmits<{
  download: []
  collect: []
}>()

const { t } = useI18n()

function formatSize(size?: number) {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}
</script>

<style scoped>
.detail-card {
  overflow: hidden;
}

.file-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  object-fit: contain;
}

.file-title-area {
  flex: 1;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  word-break: break-word;
}

.file-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}
</style>
