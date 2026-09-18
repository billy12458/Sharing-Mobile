<template>
  <van-popup
    v-model:show="visible"
    position="bottom"
    round
    closeable
    class="advanced-search-popup"
    :style="{ height: 'auto', maxHeight: '90%' }"
  >
    <div class="search-panel">
      <div class="search-title">
        {{ t('files.advancedSearch') }}
      </div>

      <van-field
        v-model="form.filename"
        :label="t('files.searchFilename')"
        :placeholder="t('files.searchFilenamePlaceholder')"
        clearable
      />

      <van-field
        v-model="form._contentType"
        is-link
        readonly
        :label="t('files.searchType')"
        :placeholder="t('files.searchTypePlaceholder')"
        @click="typePickerVisible = true"
      />

      <van-popup
        v-model:show="typePickerVisible"
        position="bottom"
        round
      >
        <van-picker
          :columns="typeOptions"
          :title="t('files.searchType')"
          :columns-field-names="{
            text: 'text',
            value: 'value',
          }"
          @confirm="handleTypeConfirm"
          @cancel="typePickerVisible = false"
        />
      </van-popup>

      <van-field
        v-model="form.description"
        type="textarea"
        rows="2"
        autosize
        :label="t('files.searchDescription')"
        :placeholder="t('files.searchDescriptionPlaceholder')"
        clearable
      />

      <div class="search-hint">
        {{ t('files.searchHint') }}
      </div>

      <div class="search-actions">
        <van-button
          type="primary"
          block
          @click="submit"
        >
          {{ t('files.searchSubmit') }}
        </van-button>

        <van-button
          block
          plain
          @click="reset"
        >
          {{ t('files.searchReset') }}
        </van-button>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import type { MyFileSearch } from '@/api/myFiles'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  search: [value: MyFileSearch]
  reset: []
}>()

const { t } = useI18n()

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const typePickerVisible = ref(false)

const form = reactive<MyFileSearch>({
  filename: '',
  userName: '',
  userId: '',
  _contentType: '',
  description: '',
})

const typeOptions = [
  { text: t('files.typeAll'), value: '' },
  { text: t('files.typePdf'), value: 'application/pdf' },
  { text: t('files.typeWord'), value: 'application/msword' },
  {
    text: t('files.typeWordDocx'),
    value:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  { text: t('files.typeExcel'), value: 'application/vnd.ms-excel' },
  {
    text: t('files.typeExcelXlsx'),
    value:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
  { text: t('files.typePowerPoint'), value: 'application/vnd.ms-powerpoint' },
  {
    text: t('files.typePowerPointPptx'),
    value:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  { text: t('files.typeText'), value: 'text/plain' },
  { text: t('files.typeCsv'), value: 'text/comma-separated-values' },
  { text: t('files.typeHtml'), value: 'text/html' },
  { text: t('files.typeZip'), value: 'application/x-zip-compressed' },
  { text: t('files.typeGzip'), value: 'application/gzip' },
  { text: t('files.typeJar'), value: 'application/java-archive' },
  { text: t('files.typeImageJpeg'), value: 'image/jpeg' },
  { text: t('files.typeImagePng'), value: 'image/png' },
  { text: t('files.typeImageGif'), value: 'image/gif' },
  { text: t('files.typeAudio'), value: 'audio/mpeg' },
  { text: t('files.typeVideo'), value: 'video/mp4' },
  { text: t('files.typeBinary'), value: 'application/octet-stream' },
]

function handleTypeConfirm(option: { selectedOptions?: Array<{ value?: string }> }) {
  form._contentType = option.selectedOptions?.[0]?.value || ''
  typePickerVisible.value = false
}

function buildSearch() {
  return {
    filename: form.filename.trim(),
    userName: '',
    userId: '',
    _contentType: form._contentType,
    description: form.description.trim(),
  }
}

function submit() {
  emit('search', buildSearch())
  visible.value = false
}

function reset() {
  form.filename = ''
  form.userName = ''
  form.userId = ''
  form._contentType = ''
  form.description = ''

  typePickerVisible.value = false
  emit('reset')
  visible.value = false
}

watch(
  () => props.show,
  (show) => {
    if (!show) {
      typePickerVisible.value = false
    }
  },
)
</script>

<style scoped>
.advanced-search-popup {
  overflow: hidden;
}

.search-panel {
  padding: 44px 16px 20px;
}

.search-title {
  margin-bottom: 8px;
  color: #222;
  font-size: 20px;
  font-weight: 600;
}

.search-hint {
  padding: 10px 4px 4px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.search-actions {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.search-actions > * {
  flex: 1;
}
</style>
