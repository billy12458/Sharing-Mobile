<template>
  <MobileLayout>
    <div class="page">
      <div class="page-content">
        <div class="page-head">
          <div>
            <h1>{{ t('files.title') }}</h1>
            <p>{{ t('home.skeleton') }}</p>
          </div>
          <van-button type="primary" icon="upgrade" round size="small">{{ t('home.upload') }}</van-button>
        </div>

        <div class="file-list">
          <FileListItem v-for="file in demoFiles" :key="file.id" :file="file" @action="openActions(file)" @click="openDetail(file)" />
        </div>

        <van-empty v-if="!demoFiles.length" :description="t('files.empty')" />
      </div>

      <van-action-sheet v-model:show="actionVisible" :actions="actions" cancel-text="取消" close-on-click-action @select="onActionSelect" />
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'
import FileListItem from '@/components/FileListItem.vue'

interface DemoFile {
  id: string
  name: string
  size: string
  updated: string
  type: string
}

const { t } = useI18n()
const router = useRouter()
const actionVisible = ref(false)
const selectedFile = ref<DemoFile | null>(null)

const demoFiles: DemoFile[] = [
  { id: '1', name: 'example.pdf', size: '2.4 MB', updated: '2026-08-13', type: 'PDF' },
  { id: '2', name: 'project.zip', size: '183 MB', updated: '2026-08-10', type: 'ZIP' },
  { id: '3', name: 'photo.jpg', size: '3.2 MB', updated: '2026-08-08', type: 'JPG' },
]

const actions = computed(() => [
  { name: t('files.preview') },
  { name: t('files.download') },
  { name: t('files.share') },
  { name: t('files.rename') },
  { name: t('files.delete'), color: '#ee0a24' },
])

function openActions(file: DemoFile) {
  selectedFile.value = file
  actionVisible.value = true
}

function onActionSelect() {
  actionVisible.value = false
}

function openDetail(file: DemoFile) {
  router.push(`/files/${file.id}`)
}
</script>

<style scoped>
.page-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.page-head h1 {
  margin: 0;
  font-size: 24px;
}

.page-head p {
  margin: 6px 0 0;
  max-width: 420px;
  color: var(--qs-muted);
  line-height: 1.55;
  font-size: 13px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
