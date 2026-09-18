<template>
  <van-cell class="file-item">
    <template #icon>
      <van-checkbox
        v-model="checked"
        shape="square"
        class="checkbox"
        @click.stop
        @change="emitSelection"
      />
    </template>

    <template #title>
      <div class="file-main">
        <img
          class="file-icon"
          :src="getFileIcon(file.filename)"
          :alt="file.filename"
        />

        <div class="file-info">
          <div class="file-name">
            {{ file.filename || '-' }}
          </div>

          <div class="file-meta">
            <span>{{ formatSize(file.length) }}</span>
            <span>·</span>
            <span>{{ formatDate(file.uploadDate) }}</span>
          </div>
        </div>
      </div>
    </template>

    <template #value>
      <van-button
        size="small"
        plain
        class="more-button"
        @click="openActions"
      >
        <van-icon name="ellipsis" size="18" />
      </van-button>
    </template>
  </van-cell>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { MyFile } from '@/api/myFiles'
import { getFileIcon } from '@/utils/fileIcon'

const props = defineProps<{
  file: MyFile
  selected?: boolean
}>()

const emit = defineEmits<{
  selectionChange: [value: boolean]
  actions: [file: MyFile]
}>()

const checked = computed({
  get: () => !!props.selected,
  set: (value) => emit('selectionChange', value),
})

function emitSelection() {
  emit('selectionChange', checked.value)
}

function openActions() {
  emit('actions', props.file)
}

function formatSize(size: number) {
  if (!size) return '-'
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`
}

function formatDate(value?: string) {
  if (!value) return '-'
  return value.includes('T') ? value.split('T')[0] : value.split(' ')[0]
}
</script>

<style scoped>
.file-item {
  padding: 12px 8px;
}

.file-item :deep(.van-cell__icon) {
  flex: 0 0 28px;
  width: 28px;
  min-width: 28px;
  margin-right: 8px;
}

.file-item :deep(.van-cell__title) {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
}

.file-item :deep(.van-cell__value) {
  flex: 0 0 36px;
  width: 36px;
  min-width: 36px;
  margin-left: 8px;
}

.checkbox {
  width: 28px;
}

.file-main {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 10px;
}

.file-icon {
  flex: 0 0 42px;
  width: 42px;
  min-width: 42px;
  height: 42px;
  object-fit: contain;
}

.file-info {
  flex: 1 1 auto;
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.file-name {
  display: block;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  color: #222;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-meta {
  display: flex;
  align-items: center;
  min-width: 0;
  gap: 5px;
  margin-top: 4px;
  overflow: hidden;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.more-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  min-width: 36px;
  height: 32px;
  padding: 0;
  border: 0;
}
</style>
