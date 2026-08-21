<template>
  <van-cell-group inset>
    <van-field v-model="code" :label="t('extract.code')" :placeholder="t('extract.placeholder')" />
    <div class="actions">
      <van-button type="primary" block round @click="submit">
        {{ t('common.confirm') }}
      </van-button>
    </div>
  </van-cell-group>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['success'])

const { t } = useI18n()
const code = ref('')

function submit() {
  if (code.value.trim()) {
    emit('success', code.value.trim())
  }
}
</script>

<style scoped>
.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
}
</style>
