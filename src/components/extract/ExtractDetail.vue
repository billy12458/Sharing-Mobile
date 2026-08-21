<template>
  <van-cell-group inset>

    <van-cell>
      <template #title>
        <img class="file-icon" :src="getFileIcon(file.filename)" :alt="file.filename || t('extract.unknownFile')" />
      </template>
      <template #value>
        <div class="filename-wrapper">
          <span class="filename">
            {{ file.filename || t('extract.unknownFile') }}
          </span>
        </div>
      </template>
    </van-cell>


    <van-cell :title="t('extract.type')" :value="file.metadata?._contentType || '-'" />


    <van-cell :title="t('extract.size')" :value="formatSize(file.length)" />


    <van-cell :title="t('extract.owner')" :value="file.metadata?.userName || '-'" />


    <van-cell :title="t('extract.description')" :value="file.metadata?.description ||
      t('extract.noDescription')
      " />


    <van-cell :title="t('extract.expire')" :value="file.metadata?.expire || '-'" />


    <van-cell v-if="file.metadata?.tags?.length" :title="t('extract.tags')">
      <template #value>
        <div class="tags">
          <van-tag v-for="tag in file.metadata.tags" :key="tag" type="success" size="medium">
            {{ tag }}
          </van-tag>
        </div>
      </template>
    </van-cell>


    <div class="actions">

      <van-button type="primary" block @click="codeDownload(code)">
        {{ t('extract.download') }}
      </van-button>


      <van-button type="danger" block plain @click="$emit('clear')">
        {{ t('extract.clear') }}
      </van-button>

    </div>

  </van-cell-group>
</template>


<script setup lang="ts">

import { useI18n } from 'vue-i18n'
import { getFileIcon } from '@/utils/fileIcon'
import { codeDownload } from '@/utils/download'

const props = defineProps<{
  file: any
  code: string
}>()


defineEmits<{
  clear: []
}>()


const { t } = useI18n()


function formatSize(size: number) {

  if (!size) {
    return '-'
  }


  if (size < 1024) {
    return `${size} B`
  }


  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} KB`
  }


  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} MB`
  }


  return `${(size / 1024 / 1024 / 1024).toFixed(2)} GB`
}


function download() {

  window.open(
    `/files/download/byCode?code=${encodeURIComponent(props.code)}`,
    '_blank',
  )
}

</script>


<style scoped>
.filename-wrapper {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  max-width: 240px;
  margin-left: auto;
}


.file-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  object-fit: contain;
}


.filename {
  overflow: hidden;
  color: #888;
  line-height: 20px;
  text-align: right;
  word-break: break-word;
}


.tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
}


.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}
</style>