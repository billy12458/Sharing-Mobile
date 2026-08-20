<template>
  <div class="ranking-item">

    <div class="rank">
      {{ rank }}
    </div>


    <img class="file-icon" :src="fileTypeIcon" :alt="file.document?.filename" />


    <div class="file-info">

      <div class="file-name">
        {{ file.document?.filename }}
      </div>


      <div class="description">
        {{ file.document?.description || $t('ranking.noDescription') }}
      </div>


      <div class="username">
        {{ file.document?.userName || '-' }}
      </div>

    </div>


    <div class="number">

      <van-icon :name="countIcon" class="count-icon" />

      <span>
        {{ count }}
      </span>

    </div>

  </div>
</template>


<script setup lang="ts">

import {
  computed
} from 'vue'


import audioIcon from '@/icons/audio.png'
import codeIcon from '@/icons/code.png'
import csvIcon from '@/icons/csv.png'
import defaultIcon from '@/icons/default.png'
import docIcon from '@/icons/doc.png'
import emailIcon from '@/icons/email.png'
import excelIcon from '@/icons/excel.png'
import htmlIcon from '@/icons/html.png'
import imageIcon from '@/icons/image.png'
import pdfIcon from '@/icons/pdf.png'
import pptIcon from '@/icons/ppt.png'
import sqlIcon from '@/icons/sql.png'
import txtIcon from '@/icons/txt.png'
import videoIcon from '@/icons/video.png'
import zipIcon from '@/icons/zip.png'


const props = defineProps<{
  rank: number
  file: any
  type: number
}>()


const fileName = computed(() => {
  return (
    props.file.document?.filename ||
    ''
  ).toLowerCase()
})


const fileTypeIcon = computed(() => {

  const name = fileName.value


  if (/\.(pdf)$/.test(name)) {
    return pdfIcon
  }


  if (/\.(doc|docx|dot|dotx|wps|rtf)$/.test(name)) {
    return docIcon
  }


  if (/\.(xls|xlsx|xlsm|xlsb)$/.test(name)) {
    return excelIcon
  }


  if (/\.(csv|tsv)$/.test(name)) {
    return csvIcon
  }


  if (/\.(ppt|pptx|pps|ppsx|odp|dps)$/.test(name)) {
    return pptIcon
  }


  if (
    /\.(txt|log|md|markdown|rst|tex|ini|conf|cfg|properties)$/.test(name)
  ) {
    return txtIcon
  }


  if (/\.(html|htm|xhtml)$/.test(name)) {
    return htmlIcon
  }


  if (
    /\.(java|kt|kts|scala|groovy|gradle|class|js|jsx|ts|tsx|mjs|cjs|vue|c|h|cc|cpp|cxx|hpp|cs|py|pyc|pyw|go|rs|swift|dart|lua|r|rb|php|pl|sh|bash|zsh|fish)$/.test(name)
  ) {
    return codeIcon
  }


  if (
    /\.(sql|db|sqlite|sqlite3|dump)$/.test(name)
  ) {
    return sqlIcon
  }


  if (
    /\.(jpg|jpeg|png|gif|bmp|webp|svg|ico|tif|tiff|heic|heif|avif)$/.test(name)
  ) {
    return imageIcon
  }


  if (
    /\.(mp3|wav|flac|aac|ogg|oga|m4a|wma|ape|amr)$/.test(name)
  ) {
    return audioIcon
  }


  if (
    /\.(mp4|m4v|mov|avi|mkv|flv|wmv|webm|mpeg|mpg|3gp|ts)$/.test(name)
  ) {
    return videoIcon
  }


  if (
    /\.(eml|msg|pst|ost)$/.test(name)
  ) {
    return emailIcon
  }


  if (
    /\.(zip|rar|7z|tar|gz|bz2|xz|tgz|jar|war|ear)$/.test(name)
  ) {
    return zipIcon
  }


  return defaultIcon
})


const count = computed(() => {

  if (props.type === 0) {
    return props.file.document?.idScore?.score || 0
  }


  if (props.type === 1) {
    return props.file.document?.idScore?.score || 0
  }


  return props.file.document?.TypedTuple?.score || 0
})


const countIcon = computed(() => {

  if (props.type === 0) {
    return 'star-o'
  }


  if (props.type === 1) {
    return 'down'
  }


  return 'eye-o'
})

</script>


<style scoped>
.ranking-item {

  display: flex;

  align-items: center;

  background: #fff;

  padding: 14px;

  margin-bottom: 10px;

  border-radius: 10px;

}


.rank {

  width: 30px;

  flex-shrink: 0;

  text-align: center;

  font-weight: 600;

  font-size: 15px;

}


.file-icon {

  width: 42px;

  height: 42px;

  flex-shrink: 0;

  object-fit: contain;

  margin-right: 12px;

}


.file-info {

  flex: 1;

  min-width: 0;

}


.file-name {

  font-size: 14px;

  font-weight: 600;

  line-height: 20px;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}


.description {

  margin-top: 4px;

  font-size: 12px;

  line-height: 17px;

  color: #999;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}


.username {

  margin-top: 4px;

  font-size: 12px;

  color: #666;

  white-space: nowrap;

  overflow: hidden;

  text-overflow: ellipsis;

}


.number {

  display: flex;

  align-items: center;

  gap: 4px;

  margin-left: 8px;

  flex-shrink: 0;

  color: #666;

  font-size: 13px;

}


.count-icon {

  font-size: 16px;

}
</style>