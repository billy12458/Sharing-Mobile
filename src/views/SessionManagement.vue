<template>
  <MobileLayout>
    <van-nav-bar :title="t('session.title')" left-arrow @click-left="router.push('/profile')" />
    <div class="session-page">
      <div class="page-title">
        {{ t('profile.sessionManagement') }}
      </div>

      <div class="intro">
        {{ t('session.intro') }}
      </div>

      <van-loading v-if="loading" class="loading" size="24px" vertical>
        {{ t('session.loading') }}
      </van-loading>

      <template v-else>
        <van-empty v-if="sessions.length === 0" :description="t('session.empty')" />

        <div v-for="session in sessions" :key="session.value" class="session-card">
          <div class="device-column">
            <img class="device-icon" :src="getDeviceIcon(session.device)"
              :alt="session.device || t('session.unknownDevice')" />
          </div>

          <div class="session-content">
            <div class="session-title">
              {{ t('session.sessionInfo') }}
            </div>

            <div class="session-row">
              <span class="session-label">
                {{ t('session.value') }}:
              </span>
              <span class="session-value">
                {{ session.value || '-' }}
              </span>
            </div>

            <div class="session-row">
              <span class="session-label">
                {{ t('session.device') }}:
              </span>
              <span class="session-value">
                {{ session.device || t('session.unknownDevice') }}
              </span>
            </div>
          </div>

          <div class="session-action">
            <van-tag v-if="isCurrentSession(session)" type="primary" size="medium">
              {{ t('session.current') }}
            </van-tag>

            <van-button v-else size="small" type="danger" plain :loading="deletingId === session.value"
              @click="handleDelete(session)">
              {{ t('session.logout') }}
            </van-button>
          </div>
        </div>
      </template>

      <van-button v-if="sessions.length > 0" block plain type="primary" class="refresh-button" :loading="loading"
        @click="loadSessions">
        {{ t('session.refresh') }}
      </van-button>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
} from 'vue'
import {
  useI18n,
} from 'vue-i18n'
import {
  showConfirmDialog,
  showFailToast,
  showSuccessToast,
} from 'vant'

import MobileLayout from '@/layouts/MobileLayout.vue'

import PhoneIcon from '@/icons/svg/Phone.svg'
import WindowsIcon from '@/icons/svg/Windows.svg'
import LinuxIcon from '@/icons/svg/Linux.svg'
import TabletIcon from '@/icons/svg/Tablet.svg'
import OtherIcon from '@/icons/svg/Other.svg'
import { useRouter } from 'vue-router'
import {
  deleteSession,
  getSessionList,
  getTokenInfo,
  type TokenInfo,
  type TokenSign,
} from '@/api/session'

const { t } = useI18n()
const router = useRouter()
const loading = ref(true)
const sessions = ref<TokenSign[]>([])
const tokenInfo = ref<TokenInfo | null>(null)
const deletingId = ref('')

async function loadSessions() {
  loading.value = true

  try {
    const [
      sessionData,
      currentTokenInfo,
    ] = await Promise.all([
      getSessionList(),
      getTokenInfo(),
    ])

    sessions.value =
      sessionData?.tokenSignList || []

    tokenInfo.value =
      currentTokenInfo
  } catch (error: any) {
    const message =
      error?.response?.data?.msg

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('session.loadFailed'),
      duration: 2500,
    })
  } finally {
    loading.value = false
  }
}

function isCurrentSession(
  session: TokenSign,
) {
  const currentToken =
    tokenInfo.value?.tokenValue || ''

  return Boolean(
    currentToken &&
    session.value === currentToken,
  )
}

function getDeviceIcon(
  device = '',
) {
  const value =
    device.toLowerCase()

  if (
    value.includes('windows')
  ) {
    return WindowsIcon
  }

  if (
    value.includes('linux')
  ) {
    return LinuxIcon
  }

  if (
    value.includes('tablet')
  ) {
    return TabletIcon
  }

  if (
    value.includes('iphone') ||
    value.includes('android') ||
    value.includes('phone') ||
    value.includes('ipad')
  ) {
    return PhoneIcon
  }

  return OtherIcon
}

async function handleDelete(
  session: TokenSign,
) {
  if (isCurrentSession(session)) {
    showFailToast({
      message: t('session.currentCannotLogout'),
      duration: 2500,
    })

    return
  }

  try {
    await showConfirmDialog({
      title: t('session.logout'),
      message: t('session.logoutConfirm'),
    })

    deletingId.value =
      session.value

    const response =
      await deleteSession(session.value)

    if (
      response.status !== undefined &&
      response.status !== 200
    ) {
      const message =
        response.msg

      throw new Error(
        typeof message === 'string'
          ? message
          : Array.isArray(message)
            ? message.join('\n')
            : t('session.logoutFailed'),
      )
    }

    showSuccessToast({
      message: t('session.logoutSuccess'),
      duration: 2000,
    })

    await loadSessions()
  } catch (error: any) {
    if (
      error === 'cancel' ||
      error?.message === 'cancel'
    ) {
      return
    }

    const message =
      error?.response?.data?.msg ||
      error?.message

    showFailToast({
      message:
        typeof message === 'string'
          ? message
          : t('session.logoutFailed'),
      duration: 2500,
    })
  } finally {
    deletingId.value = ''
  }
}

onMounted(loadSessions)
</script>

<style scoped>
.session-page {
  min-height: 100%;
  padding: 16px 12px 28px;
  background: #f7f8fa;
}

.page-title {
  margin: 2px 4px 8px;
  color: #222;
  font-size: 22px;
  font-weight: 600;
}

.intro {
  padding: 0 4px 14px;
  color: #999;
  font-size: 12px;
  line-height: 18px;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}

.session-card {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: 12px;
  min-height: 118px;
  padding: 16px 12px 16px 6px;
  border-bottom: 1px solid #eee;
  background: #fff;
}

.session-card:first-of-type {
  border-radius: 10px 10px 0 0;
}

.session-card:last-of-type {
  border-radius: 0 0 10px 10px;
}

.device-column {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 92px;
  border-right: 1px solid #f0f0f0;
}

.device-icon {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.session-content {
  min-width: 0;
}

.session-title {
  margin-bottom: 12px;
  color: #222;
  font-size: 17px;
  font-weight: 600;
  line-height: 24px;
}

.session-row {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  margin-top: 6px;
  color: #555;
  font-size: 14px;
  line-height: 22px;
}

.session-label {
  flex-shrink: 0;
  color: #666;
}

.session-value {
  min-width: 0;
  color: #555;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.session-action {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 64px;
}

.refresh-button {
  margin-top: 16px;
}

@media (max-width: 380px) {
  .session-card {
    grid-template-columns: 58px minmax(0, 1fr) auto;
    column-gap: 8px;
    padding-right: 8px;
  }

  .device-icon {
    width: 40px;
    height: 40px;
  }

  .session-title {
    font-size: 16px;
  }

  .session-row {
    font-size: 13px;
  }

  .session-action {
    min-width: 56px;
  }
}
</style>
