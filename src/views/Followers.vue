<template>
  <MobileLayout>
    <div class="followers-page">
      <van-nav-bar :title="t('followers.title')" left-arrow @click-left="router.push('/profile')" />

      <van-pull-refresh v-model="refreshing" @refresh="handleRefresh">
        <van-list v-model:loading="loading" :finished="finished"
          :finished-text="followers.length ? t('followers.noMore') : ''" :loading-text="t('followers.loading')"
          @load="loadMore">
          <van-cell-group inset class="followers-card">
            <van-cell v-for="user in followers" :key="user.userId" class="follower-item" center>
              <template #icon>
                <van-image class="avatar" round fit="cover" :src="getAvatarUrl(user.userId)"
                  :alt="user.userName || t('followers.unknownUser')">
                  <template #error>
                    <div class="avatar-fallback">
                      {{ getAvatarInitial(user.userName) }}
                    </div>
                  </template>

                  <template #loading>
                    <van-loading size="18px" />
                  </template>
                </van-image>
              </template>

              <template #title>
                <div class="user-main clickable" @click="goToUserProfile(user.userId)">
                  <div class="username">
                    <van-icon name="manager-o" />
                    <span>{{ user.userName || '-' }}</span>
                  </div>

                  <div class="motto">
                    {{ user.motto || t('followers.noMotto') }}
                  </div>
                </div>
              </template>

              <template #value>
                <van-button size="small" type="primary" :loading="actionLoading[user.userId] === true"
                  @click.stop="followUser(user.userId)">
                  {{ t('followers.follow') }}
                </van-button>
              </template>
            </van-cell>
          </van-cell-group>
        </van-list>

        <van-empty v-if="!loading && !refreshing && followers.length === 0" :description="t('followers.empty')" />
      </van-pull-refresh>
    </div>
  </MobileLayout>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { showFailToast, showSuccessToast } from 'vant'

import MobileLayout from '@/layouts/MobileLayout.vue'
import {
  getMyFansPaged,
  getMyProfile,
  subscribeUser,
  type FanUser,
} from '@/api/followers'

const { t } = useI18n()
const router = useRouter()

const followers = ref<FanUser[]>([])

const currentUserId = ref('')
const pageNum = ref(1)
const pageSize = 10

const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

const actionLoading = reactive<Record<string, boolean>>({})

function getAvatarUrl(userId: string) {
  return `https://api.quickysharing.cn/user/avatar?userId=${encodeURIComponent(userId)}`
}

function getAvatarInitial(userName?: string | null) {
  return userName?.trim().charAt(0).toUpperCase() || 'Q'
}

function goToUserProfile(userId: string) {
  if (!userId) {
    return
  }

  router.push(`/profile/other/${encodeURIComponent(userId)}`)
}

async function loadCurrentUser() {
  try {
    const profile = await getMyProfile()
    currentUserId.value = profile?.userId || ''
  } catch {
    currentUserId.value = ''
  }
}

async function loadMore() {
  if (finished.value) {
    return
  }

  try {
    const data = await getMyFansPaged(pageNum.value, pageSize)
    const list = data?.list || []

    followers.value.push(...list)

    if (
      list.length === 0 ||
      followers.value.length >= Number(data?.total || 0)
    ) {
      finished.value = true
    } else {
      pageNum.value += 1
    }
  } catch (error: any) {
    showFailToast(
      error?.response?.data?.msg || t('followers.loadFailed'),
    )
  } finally {
    loading.value = false
  }
}

async function handleRefresh() {
  if (refreshing.value) {
    return
  }

  refreshing.value = true

  try {
    followers.value = []
    pageNum.value = 1
    finished.value = false
    await loadMore()
  } finally {
    refreshing.value = false
  }
}

async function followUser(userId: string) {
  if (!userId || actionLoading[userId]) {
    return
  }

  actionLoading[userId] = true

  try {
    const response = await subscribeUser(
      currentUserId.value,
      userId,
    )

    const status = response?.data?.status
    const message =
      response?.data?.msg || t('followers.actionFailed')

    // 无论后端返回“关注成功”还是“已经关注过”等业务消息，都直接展示。
    if (status === 200) {
      showSuccessToast({
        message,
        duration: 2000,
      })
    } else {
      showFailToast({
        message,
        duration: 2500,
      })
    }
  } catch (error: any) {
    showFailToast(
      error?.response?.data?.msg || t('followers.actionFailed'),
    )
  } finally {
    actionLoading[userId] = false
  }
}

onMounted(async () => {
  await loadCurrentUser()
})
</script>

<style scoped>
.followers-page {
  min-height: 100%;
  padding-bottom: 90px;
  background: #f7f8fa;
}

.followers-card {
  margin-top: 12px;
  overflow: hidden;
}

.follower-item {
  min-height: 80px;
}

.avatar {
  width: 52px;
  height: 52px;
  margin-right: 12px;
  flex-shrink: 0;
}

.avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #e8f3ff;
  color: #1989fa;
  font-size: 20px;
  font-weight: 600;
}

.user-main {
  min-width: 0;
  padding: 2px 8px 2px 0;
}

.clickable {
  cursor: pointer;
}

.clickable:active {
  opacity: 0.7;
}

.username {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: #323233;
  font-size: 15px;
  font-weight: 600;
  line-height: 22px;
}

.username span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.motto {
  margin-top: 4px;
  color: #969799;
  font-size: 12px;
  line-height: 18px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
