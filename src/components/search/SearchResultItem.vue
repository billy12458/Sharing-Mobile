<template>
  <div class="search-result-item">
    <img
      class="file-icon"
      :src="getFileIcon(fileName)"
      :alt="fileName || 'file'"
    />

    <div class="search-result-content">
      <div class="search-result-name">
        <span
          v-if="filenameHighlight"
          v-html="filenameHighlight"
        />
        <span v-else>{{ fileName || '-' }}</span>
      </div>

      <div class="search-result-description">
        <span
          v-if="descriptionHighlight"
          v-html="descriptionHighlight"
        />
        <span v-else>{{ description || '-' }}</span>
      </div>

      <div class="search-result-meta">
        <span>{{ formatFileSize(file.content?.length) }}</span>
        <span>{{ formatUploadDate(file.content?.uploadDate) }}</span>
      </div>
    </div>

    <van-icon
      name="ellipsis"
      class="search-result-actions"
      size="20"
      @click.stop="emit('actions', file)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFileIcon } from '@/utils/fileIcon'

type SearchFileHit = {
  id?: string
  content?: {
    id?: string
    _id?: string
    filename?: string
    length?: number
    uploadDate?: string
    metadata?: {
      filename?: string
      description?: string
    }
  }
  highlightFields?: Record<string, string[]>
}

const props = defineProps<{
  file: SearchFileHit
}>()

const emit = defineEmits<{
  (e: 'actions', file: SearchFileHit): void
}>()

const fileName = computed(() =>
  props.file.content?.filename ||
  props.file.content?.metadata?.filename ||
  '',
)

const description = computed(() =>
  props.file.content?.metadata?.description ||
  '',
)

const filenameHighlight = computed(() => {
  const highlights = props.file.highlightFields?.['metadata.filename']
  return Array.isArray(highlights) && highlights.length
    ? highlights[0]
    : ''
})

const descriptionHighlight = computed(() => {
  const highlights = props.file.highlightFields?.['metadata.description']
  return Array.isArray(highlights) && highlights.length
    ? highlights[0]
    : ''
})

function formatFileSize(length: number | undefined) {
  if (!length || length <= 0) {
    return '0 B'
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const exponent = Math.min(
    Math.floor(Math.log(length) / Math.log(1024)),
    units.length - 1,
  )
  const value = length / Math.pow(1024, exponent)

  if (exponent === 0) {
    return `${Math.round(value)} ${units[exponent]}`
  }

  return `${value.toFixed(1)} ${units[exponent]}`
}

function formatUploadDate(uploadDate: string | undefined) {
  if (!uploadDate) {
    return '-'
  }

  const date = new Date(uploadDate)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('en-US')
}
</script>

<style scoped>
.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 88px;
  padding: 14px 16px;
  box-sizing: border-box;
  background: #fff;
}

.file-icon {
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.search-result-content {
  flex: 1;
  min-width: 0;
}

.search-result-name {
  overflow: hidden;
  color: #222;
  font-size: 15px;
  font-weight: 600;
  line-height: 21px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-description {
  overflow: hidden;
  margin-top: 3px;
  color: #666;
  font-size: 13px;
  line-height: 19px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-result-meta {
  display: flex;
  gap: 10px;
  margin-top: 3px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.search-result-actions {
  flex: 0 0 auto;
  padding: 8px;
  color: #7a7a7a;
  cursor: pointer;
}

:deep(font[color='red']) {
  color: #ee0a24 !important;
  font-weight: 700;
}
</style>
