<template>
  <MobileLayout>
    <div class="other-profile-page">
      <van-nav-bar :title="t('otherProfile.title')" left-arrow @click-left="goBackToFollowers" />

      <van-loading v-if="loading" class="loading" size="24px" vertical>
        {{ t('otherProfile.loading') }}
      </van-loading>

      <template v-else-if="profile">
        <van-cell-group inset class="profile-card">
          <div class="profile-main">
            <van-image class="avatar" round fit="cover" :src="avatarSource"
              :alt="profile.userName || t('otherProfile.unknownUser')">
              <template #error>
                <div class="avatar-fallback">
                  {{ avatarInitial }}
                </div>
              </template>

              <template #loading>
                <van-loading size="20px" />
              </template>
            </van-image>

            <div class="username">
              <van-icon name="manager-o" />
              <span>{{ profile.userName || '-' }}</span>
            </div>

            <div class="stats">
              <div class="stat-item">
                <div class="stat-value">{{ fansCount }}</div>
                <div class="stat-label">{{ t('otherProfile.followers') }}</div>
              </div>

              <div class="stat-item">
                <div class="stat-value">{{ followsCount }}</div>
                <div class="stat-label">{{ t('otherProfile.following') }}</div>
              </div>

              <button type="button" class="stat-item location-button" @click="showLocation">
                <div class="stat-value">{{ t('otherProfile.view') }}</div>
                <div class="stat-label">{{ t('otherProfile.location') }}</div>
              </button>
            </div>
          </div>
        </van-cell-group>

        <van-cell-group inset class="account-card">
          <van-cell :title="t('otherProfile.accountId')" :value="profile.userId || '-'" />

          <van-cell :title="t('otherProfile.nickname')" :value="profile.userName || '-'" />

          <van-cell :title="t('otherProfile.email')" :value="t('otherProfile.privateInfo')" />

          <van-cell :title="t('otherProfile.sex')" :value="profile.sex || '-'" />

          <van-cell :title="t('otherProfile.age')" :value="profile.age ?? '-'" />

          <van-cell :title="t('otherProfile.phone')" :value="t('otherProfile.privateInfo')" />

          <van-cell :title="t('otherProfile.registeredAt')" :value="formatDate(profile.start_time)" />

          <van-cell :title="t('otherProfile.motto')" :value="profile.motto || t('otherProfile.noMotto')" />
        </van-cell-group>

        <van-cell-group inset class="disable-card">
          <van-cell :title="t('otherProfile.disableTitle')"
            :class="disableData.disabled ? 'disable-error' : 'disable-success'">
            <template #value>
              <van-icon :name="disableData.disabled ? 'warning-o' : 'passed'" size="20" />
            </template>
          </van-cell>

          <van-cell :title="t('otherProfile.disableTime')" :value="disableTimeText" />

          <van-cell :title="t('otherProfile.disableLevel')" :value="disableLevelText" />
        </van-cell-group>
      </template>

      <van-empty v-else :description="t('otherProfile.loadFailed')" />

      <van-dialog v-model:show="locationVisible" :title="t('otherProfile.location')" :show-cancel-button="false">
        <div class="location-content">
          {{ profile?.ip || t('otherProfile.noLocation') }}
        </div>
      </van-dialog>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { showFailToast } from 'vant'

import MobileLayout from '@/layouts/MobileLayout.vue'
import {
  getOtherUserInfo,
  getDisableCondition,
  type OtherProfile,
  type DisableCondition,
} from '@/api/user'
import { getMyFansAndFollows } from '@/api/profile'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const loading = ref(true)
const profile = ref<OtherProfile | null>(null)
const fansCount = ref(0)
const followsCount = ref(0)
const locationVisible = ref(false)

const disableData = ref<DisableCondition>({
  disabled: false,
  disableTime: -2,
  disableLevel: -2,
})

let disableTimer: ReturnType<typeof setInterval> | null = null
let disableRemainingSeconds: number | null = null

const avatarSource = computed(() => {
  const avatar = profile.value?.avatar

  if (!avatar) {
    return ''
  }

  if (avatar.startsWith('data:image/')) {
    return avatar
  }

  return `data:image/jpeg;base64,${avatar}`
})

const avatarInitial = computed(() => {
  return profile.value?.userName?.trim().charAt(0).toUpperCase() || 'Q'
})

const disableTimeText = computed(() => {
  if (!disableData.value.disabled) {
    return t('otherProfile.notDisabled')
  }

  const seconds = disableRemainingSeconds

  if (seconds === null) {
    return t('otherProfile.notDisabled')
  }

  if (seconds === -1) {
    return t('otherProfile.permanent')
  }

  if (seconds === -2) {
    return t('otherProfile.notDisabled')
  }

  return formatSeconds(seconds)
})

const disableLevelText = computed(() => {
  const level = disableData.value.disableLevel

  if (level === null || level === undefined) {
    return '-'
  }

  return String(level)
})

function goBackToFollowers() {
  router.push('/profile/followers')
}

function showLocation() {
  locationVisible.value = true
}

function formatDate(value?: string | null) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function formatSeconds(value: number) {
  const total = Math.max(0, Math.floor(value))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  if (days > 0) {
    return t('otherProfile.timeFormatDays', {
      days,
      hours,
      minutes,
      seconds,
    })
  }

  return t('otherProfile.timeFormat', {
    hours,
    minutes,
    seconds,
  })
}

function clearDisableTimer() {
  if (disableTimer) {
    clearInterval(disableTimer)
    disableTimer = null
  }
}

function startDisableTimer() {
  clearDisableTimer()

  const value = Number(disableData.value.disableTime)

  if (!disableData.value.disabled || value < 0) {
    disableRemainingSeconds = value
    return
  }

  disableRemainingSeconds = value

  disableTimer = setInterval(() => {
    if (disableRemainingSeconds === null) {
      clearDisableTimer()
      return
    }

    disableRemainingSeconds -= 1

    if (disableRemainingSeconds <= 0) {
      disableRemainingSeconds = -2
      disableData.value.disabled = false
      clearDisableTimer()
    }
  }, 1000)
}

async function loadPage() {
  const userId = String(route.params.userId || '')

  if (!userId) {
    loading.value = false
    return
  }

  loading.value = true

  try {
    const [profileData, countData, disable] = await Promise.all([
      getOtherUserInfo(userId),
      getMyFansAndFollows(userId),
      getDisableCondition(userId),
    ])

    profile.value = profileData
    fansCount.value = Number(
      countData?.fansCount ?? countData?.fans ?? 0,
    )
    followsCount.value = Number(
      countData?.followsCount ?? countData?.follows ?? countData?.subscriptionCount ?? 0,
    )

    disableData.value = {
      disabled: Boolean(disable?.disabled),
      disableTime: Number(disable?.disableTime ?? -2),
      disableLevel: disable?.disableLevel ?? -2,
    }

    startDisableTimer()
  } catch (error: any) {
    showFailToast(
      error?.response?.data?.msg || t('otherProfile.loadFailed'),
    )
  } finally {
    loading.value = false
  }
}

onMounted(loadPage)
onBeforeUnmount(clearDisableTimer)
</script>

<style scoped>
.other-profile-page {
  min-height: 100%;
  padding: 0 0 90px;
  background: #f7f8fa;
}

.profile-card {
  margin-top: 10px;
  overflow: hidden;
}

.profile-main {
  padding: 22px 14px 18px;
  text-align: center;
}

.avatar {
  display: block;
  width: 100px;
  height: 100px;
  margin: 0 auto 8px;
  overflow: hidden;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #409eff;
  color: #fff;
  font-size: 30px;
  font-weight: 600;
}

.username {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin: 2px 0 20px;
  color: #222;
  font-size: 20px;
  font-weight: 600;
}

.username span {
  max-width: 80%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-bottom: 4px;
}

.stat-item {
  position: relative;
  min-width: 0;
  padding: 4px 8px;
  border: 0;
  background: transparent;
  color: #1989fa;
  text-align: center;
}

.stat-item+.stat-item::before {
  position: absolute;
  top: 10%;
  left: 0;
  width: 1px;
  height: 80%;
  background: #eee;
  content: '';
}

.stat-value {
  font-size: 16px;
  line-height: 24px;
}

.stat-label {
  margin-top: 3px;
  font-size: 13px;
  line-height: 20px;
}

.location-button {
  cursor: pointer;
}

.location-button:active {
  background: #f5f7fa;
  border-radius: 6px;
}

.account-card,
.disable-card {
  margin-top: 14px;
}

.disable-card :deep(.van-cell__title) {
  color: #444;
}

.disable-error :deep(.van-cell__title),
.disable-error :deep(.van-cell__value) {
  color: #ee0a24;
}

.disable-success :deep(.van-cell__title),
.disable-success :deep(.van-cell__value) {
  color: #07c160;
}

.location-content {
  min-height: 70px;
  padding: 20px;
  color: #555;
  font-size: 15px;
  line-height: 22px;
  text-align: center;
  word-break: break-word;
}

.loading {
  display: flex;
  justify-content: center;
  padding: 70px 0;
}
</style>
