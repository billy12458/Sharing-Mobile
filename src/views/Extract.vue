<template>
  <MobileLayout>
    <div class="page">
      <br />
      <ExtractInput
        v-if="!detail"
        @success="queryDetail"
      />

      <ExtractDetail
        v-else
        :file="detail"
        :code="code"
        @clear="clearResult"
      />

      <RecommendFileList
        :files="recommendFiles"
      />

    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import {onMounted,ref} from 'vue'
import { useRoute } from 'vue-router'

import MobileLayout from '@/layouts/MobileLayout.vue'
import ExtractInput from '@/components/extract/ExtractInput.vue'
import ExtractDetail from '@/components/extract/ExtractDetail.vue'
import RecommendFileList from '@/components/RecommendFileList.vue'

import {
  getFileDetailByCode
} from '@/api/extract'

const route = useRoute()
const code=ref('')
const detail=ref<any>(null)
const recommendFiles=ref<any[]>([])

onMounted(async () => {
  const urlCode = String(route.query.code || '').trim()

  if (urlCode) {
    await queryDetail(urlCode)
  }
})

async function queryDetail(value:string){
  code.value=value
  detail.value=await getFileDetailByCode(value)
}


function clearResult(){
  detail.value=null
  code.value=''
}
</script>
