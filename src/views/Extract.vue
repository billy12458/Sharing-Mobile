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

import MobileLayout from '@/layouts/MobileLayout.vue'
import ExtractInput from '@/components/extract/ExtractInput.vue'
import ExtractDetail from '@/components/extract/ExtractDetail.vue'
import RecommendFileList from '@/components/RecommendFileList.vue'

import {
  getFileDetailByCode
} from '@/api/extract'

import {
  getRecommendFiles
} from '@/api/recommend'


const code=ref('')
const detail=ref<any>(null)
const recommendFiles=ref<any[]>([])


async function queryDetail(value:string){
  code.value=value
  detail.value=await getFileDetailByCode(value)
}


function clearResult(){
  detail.value=null
  code.value=''
}


onMounted(async()=>{
  recommendFiles.value=await getRecommendFiles()
})
</script>
