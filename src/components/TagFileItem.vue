<template>
  <div class="tag-file-item">
    <img
      class="file-icon"
      :src="getFileIcon(filename)"
      :alt="filename || $t('tags.unknownFile')"
    />

    <div class="file-info">
      <div class="file-name">
        {{ filename || $t('tags.unknownFile') }}
      </div>

      <div class="file-description">
        {{ description || $t('tags.noDescription') }}
      </div>

      <div class="file-meta">
        <span>{{ userName || '-' }}</span>
        <span v-if="uploadDate">{{ formattedDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFileIcon } from '@/utils/fileIcon'

const props = defineProps<{
  file: {
    content?: {
      filename?: string
      uploadDate?: string
      metadata?: {
        filename?: string
        description?: string
        userName?: string
      }
    }
  }
}>()

const filename = computed(() => {
  return props.file.content?.metadata?.filename
    || props.file.content?.filename
    || ''
})

const description = computed(() => {
  return props.file.content?.metadata?.description || ''
})

const userName = computed(() => {
  return props.file.content?.metadata?.userName || ''
})

const uploadDate = computed(() => {
  return props.file.content?.uploadDate || ''
})

const formattedDate = computed(() => {
  if (!uploadDate.value) return ''

  const date = new Date(uploadDate.value)

  if (Number.isNaN(date.getTime())) {
    return uploadDate.value.slice(0, 10)
  }

  return date.toLocaleDateString()
})
</script>

<style scoped>
.tag-file-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 10px;
}

.file-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  margin-right: 12px;
  object-fit: contain;
}

.file-info {
  flex: 1;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-description {
  margin-top: 3px;
  overflow: hidden;
  color: #888;
  font-size: 12px;
  line-height: 18px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
  color: #aaa;
  font-size: 11px;
}
</style>
