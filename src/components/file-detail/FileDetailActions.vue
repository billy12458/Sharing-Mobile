<template>
  <div class="more-actions">
    <van-button
      block
      plain
      type="primary"
      @click="visible = true"
    >
      {{ t('fileDetail.moreActions') }}
    </van-button>

    <van-action-sheet
      v-model:show="visible"
      :actions="actions"
      cancel-text=""
      close-on-click-action
      @select="handleSelect"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{
  preview: []
  download: []
  share: []
  report: []
}>()

const { t } = useI18n()
const visible = ref(false)

const actions = computed(() => [
  { name: t('fileDetail.preview'), key: 'preview' },
  { name: t('fileDetail.share'), key: 'share' },
  { name: t('fileDetail.report'), key: 'report' },
])

function handleSelect(action: { key?: string }) {
  if (action.key === 'preview') emit('preview')
  if (action.key === 'share') emit('share')
  if (action.key === 'report') emit('report')
}
</script>

<style scoped>
.more-actions {
  padding: 12px;
}
</style>
