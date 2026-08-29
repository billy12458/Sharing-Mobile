<template>
  <MobileLayout>
    <van-nav-bar :title="t('loginLogs.title')" left-arrow @click-left="router.push('/profile')" />
    <div class="login-log-page">
      <!-- <br /> -->
      <div class="summary">
        {{ t('loginLogs.totalSummary', { count: pageData.total }) }}
      </div>

      <van-loading v-if="loading" class="loading" size="24px" vertical>
        {{ t('loginLogs.loading') }}
      </van-loading>

      <template v-else>
        <van-empty v-if="pageData.list.length === 0" :description="t('loginLogs.empty')" />

        <div v-for="item in pageData.list" v-else :key="item.logId" class="log-card">
          <div class="log-grid">
            <button type="button" class="log-cell ip-cell" @click="openIpInfo(item.loginIp)">
              <span class="cell-label">
                {{ t('loginLogs.ip') }}
              </span>
              <span class="cell-value ip-value">
                {{ item.loginIp || '-' }}
              </span>
            </button>

            <div class="log-cell">
              <span class="cell-label">
                {{ t('loginLogs.time') }}
              </span>
              <span class="cell-value">
                {{ formatDate(item.loginTime) }}
              </span>
            </div>

            <div class="log-cell">
              <span class="cell-label">
                {{ t('loginLogs.browser') }}
              </span>
              <span class="cell-value">
                {{ item.browser || '-' }}
              </span>
            </div>

            <div class="log-cell">
              <span class="cell-label">
                {{ t('loginLogs.system') }}
              </span>
              <span class="cell-value">
                {{ item.address || '-' }}
              </span>
            </div>
          </div>
        </div>

        <van-pagination v-if="pageData.pages > 1" v-model="pageNum" :total-items="pageData.total"
          :items-per-page="pageSize" :page-count="pageData.pages" force-ellipses @change="handlePageChange" />
      </template>

      <van-dialog v-model:show="ipVisible" :title="t('loginLogs.ipInfo')" :show-cancel-button="false">
        <van-loading v-if="ipLoading" class="ip-loading" size="24px" vertical>
          {{ t('loginLogs.loadingIp') }}
        </van-loading>

        <div v-else class="ip-info-grid">
          <div class="ip-info-item">
            <div class="info-label">{{ t('loginLogs.country') }}</div>
            <div class="info-value">{{ displayIpInfo.country }}</div>
          </div>

          <div class="ip-info-item">
            <div class="info-label">{{ t('loginLogs.region') }}</div>
            <div class="info-value">{{ displayIpInfo.region }}</div>
          </div>

          <div class="ip-info-item">
            <div class="info-label">{{ t('loginLogs.province') }}</div>
            <div class="info-value">{{ displayIpInfo.province }}</div>
          </div>

          <div class="ip-info-item">
            <div class="info-label">{{ t('loginLogs.city') }}</div>
            <div class="info-value">{{ displayIpInfo.city }}</div>
          </div>

          <div class="ip-info-item">
            <div class="info-label">{{ t('loginLogs.isp') }}</div>
            <div class="info-value">{{ displayIpInfo.isp }}</div>
          </div>
        </div>
      </van-dialog>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { showFailToast } from 'vant'
import { useRouter } from 'vue-router'
import MobileLayout from '@/layouts/MobileLayout.vue'

import {
  getIpInfo,
  getMyLoginLogs,
  type IpInfo,
  type LoginLogPage,
} from '@/api/loginLogs'

const { t } = useI18n()
const router = useRouter()

const pageNum = ref(1)
const pageSize = 10
const loading = ref(false)

const pageData = ref<LoginLogPage>({
  total: 0,
  list: [],
  pageNum: 1,
  pageSize,
  size: 0,
  startRow: 0,
  endRow: 0,
  pages: 0,
  prePage: 0,
  nextPage: 0,
  isFirstPage: true,
  isLastPage: true,
  hasPreviousPage: false,
  hasNextPage: false,
  navigatePages: 8,
  navigatepageNums: [],
  navigateFirstPage: 1,
  navigateLastPage: 1,
})

const ipVisible = ref(false)
const ipLoading = ref(false)

const ipInfo = reactive<IpInfo>({
  country: '',
  region: '',
  province: '',
  city: '',
  isp: '',
})

const displayIpInfo = computed(() => ({
  country: ipInfo.country || t('loginLogs.notAvailable'),
  region: ipInfo.region || t('loginLogs.notAvailable'),
  province: ipInfo.province || t('loginLogs.notAvailable'),
  city: ipInfo.city || t('loginLogs.notAvailable'),
  isp: ipInfo.isp || t('loginLogs.notAvailable'),
}))

async function loadLogs() {
  loading.value = true

  try {
    pageData.value = await getMyLoginLogs(
      pageNum.value,
      pageSize,
    )
  } catch (error: any) {
    const message = error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('loginLogs.loadFailed'),
      duration: 2500,
    })
  } finally {
    loading.value = false
  }
}

async function handlePageChange(page: number) {
  pageNum.value = page
  await loadLogs()

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

async function openIpInfo(ip: string) {
  if (!ip) return

  ipVisible.value = true
  ipLoading.value = true

  ipInfo.country = ''
  ipInfo.region = ''
  ipInfo.province = ''
  ipInfo.city = ''
  ipInfo.isp = ''

  try {
    const result = await getIpInfo(ip)
    Object.assign(ipInfo, result)
  } catch (error: any) {
    const message = error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('loginLogs.ipLoadFailed'),
      duration: 2500,
    })
  } finally {
    ipLoading.value = false
  }
}

function formatDate(value?: string) {
  if (!value) return '-'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

onMounted(loadLogs)
</script>

<style scoped>
.login-log-page {
  min-height: 100%;
  padding: 16px 12px 28px;
  background: #f7f8fa;
}

.page-title {
  margin: 2px 4px 6px;
  color: #222;
  font-size: 22px;
  font-weight: 600;
}

.summary {
  padding: 0 4px 14px;
  color: #777;
  font-size: 13px;
  line-height: 20px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.log-card {
  margin-bottom: 10px;
  overflow: hidden;
  border-radius: 10px;
  background: #fff;
}

.log-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.log-cell {
  min-width: 0;
  min-height: 84px;
  padding: 12px 14px;
  border: 0;
  border-right: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
  background: transparent;
  text-align: left;
}

.log-cell:nth-child(2n) {
  border-right: 0;
}

.log-cell:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.ip-cell {
  width: 100%;
  cursor: pointer;
}

.ip-cell:active {
  background: #f5f7fa;
}

.cell-label {
  display: block;
  margin-bottom: 6px;
  color: #777;
  font-size: 12px;
  line-height: 18px;
}

.cell-value {
  display: block;
  color: #333;
  font-size: 14px;
  line-height: 22px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ip-value {
  color: #1989fa;
}

.ip-loading {
  display: flex;
  justify-content: center;
  padding: 44px 0;
}

.ip-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 8px 16px 16px;
}

.ip-info-item {
  min-width: 0;
  padding: 12px 8px;
}

.info-label {
  margin-bottom: 6px;
  color: #1989fa;
  font-size: 14px;
  line-height: 20px;
}

.info-value {
  color: #999;
  font-size: 14px;
  line-height: 20px;
  overflow-wrap: anywhere;
  word-break: break-word;
}

@media (max-width: 380px) {
  .log-cell {
    padding: 10px 11px;
  }

  .cell-value {
    font-size: 13px;
  }
}
</style>
