<template>
  <div class="recommend-item">
    <img class="icon" :src="getFileIcon(file.filename)" :alt="file.filename || $t('ranking.fileIconAlt')" />

    <div class="info">
      <div class="file-name">
        {{ file.filename || $t('ranking.unknownFile') }}
      </div>

      <div class="username">
        {{ file.userName || '-' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getFileIcon } from '@/utils/fileIcon'

defineProps<{
  file: {
    filename?: string
    userName?: string
    _id?: string
  }
}>()
</script>

<style scoped>
.recommend-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 12px;
  border-radius: 8px;
  background: #fff;
}

.icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  margin-right: 10px;
  object-fit: contain;
}

.info {
  flex: 1;
  min-width: 0;
}

.file-name {
  overflow: hidden;
  font-size: 14px;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.username {
  margin-top: 4px;
  overflow: hidden;
  color: #888;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>