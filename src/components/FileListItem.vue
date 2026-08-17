<template>
  <button class="file-item card" type="button" @click="$emit('click')">
    <div class="file-icon"><van-icon :name="iconName" size="24" /></div>
    <div class="file-main">
      <strong>{{ file.name }}</strong>
      <span>{{ file.size }} · {{ file.updated }}</span>
    </div>
    <van-icon name="ellipsis" size="20" class="file-action" @click.stop="$emit('action')" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  file: { id: string; name: string; size: string; updated: string; type: string }
}>()

defineEmits<{ (e: 'click'): void; (e: 'action'): void }>()

const iconName = computed(() => {
  const type = props.file.type.toLowerCase()
  if (type === 'jpg' || type === 'png' || type === 'gif') return 'photo-o'
  if (type === 'zip' || type === 'rar') return 'bag-o'
  return 'description'
})
</script>

<style scoped>
.file-item {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 76px;
  padding: 12px;
  border: 0;
  text-align: left;
}

.file-icon {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  margin-right: 12px;
  border-radius: 12px;
  background: #f1f7ff;
  color: var(--qs-primary);
}

.file-main {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.file-main strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 15px;
}

.file-main span {
  color: var(--qs-muted);
  font-size: 12px;
}

.file-action {
  flex: 0 0 auto;
  padding: 8px;
  color: #767c84;
}
</style>
