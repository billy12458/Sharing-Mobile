<template>
  <MobileLayout>
    <div class="following-page">
      <van-nav-bar
        :title="t('following.title')"
        left-arrow
        @click-left="router.push('/profile')"
      />

      <van-cell-group v-if="!loading && follows.length" inset class="following-card">
        <van-cell
          v-for="user in follows"
          :key="user.userId"
          class="following-item"
          center
        >
          <template #icon>
            <van-image
              class="avatar"
              round
              fit="cover"
              :src="getAvatarUrl(user.userId)"
              :alt="user.userName || t('following.unknownUser')"
            >
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
            <div
              class="user-main clickable"
              @click="goToUserProfile(user.userId)"
            >
              <div class="username">
                <van-icon name="manager-o" />
                <span>{{ user.userName || '-' }}</span>
              </div>

              <div class="motto">
                {{ user.motto || t('following.noMotto') }}
              </div>
            </div>
          </template>

          <template #value>
            <van-button
              size="small"
              type="default"
              :loading="actionLoading[user.userId] === true"
              @click.stop="cancelFollow(user.userId)"
            >
              {{ t('following.cancel') }}
            </van-button>
          </template>
        </van-cell>
      </van-cell-group>

      <van-loading v-if="loading" class="page-loading" size="24px" vertical>
        {{ t('following.loading') }}
      </van-loading>

      <van-empty
        v-else-if="follows.length === 0"
        :description="t('following.empty')"
      />

      <div class="pagination-wrap">
        <van-pagination
          v-model="pageNum"
          :page-count="totalPages"
          :items-per-page="pageSize"
          force-ellipses
          @change="handlePageChange"
        />
      </div>
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
  cancelSubscribeUser,
  getMyFollowsPaged,
  getMyProfile,
  type FanUser,
} from '@/api/followers'

const { t } = useI18n()
const router = useRouter()

const follows = ref<FanUser[]>([])
const currentUserId = ref('')

const pageNum = ref(1)
const pageSize = 8
const totalPages = ref(1)
const loading = ref(false)

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

async function loadPage(targetPage = pageNum.value) {
  loading.value = true

  try {
    const data = await getMyFollowsPaged(targetPage, pageSize)

    follows.value = data?.list || []
    pageNum.value = Number(data?.pageNum || targetPage)
    totalPages.value = Math.max(1, Number(data?.pages || 1))
  } catch (error: any) {
    showFailToast(
      error?.response?.data?.msg || t('following.loadFailed'),
    )
  } finally {
    loading.value = false
  }
}

async function handlePageChange(page: number) {
  await loadPage(page)
}

async function cancelFollow(userId: string) {
  if (!userId || actionLoading[userId] || !currentUserId.value) {
    return
  }

  actionLoading[userId] = true

  try {
    const response = await cancelSubscribeUser(
      currentUserId.value,
      userId,
    )

    const status = response?.data?.status
    const message =
      response?.data?.msg || t('following.actionFailed')

    if (status === 200) {
      showSuccessToast({
        message: message || t('following.cancelSuccess'),
        duration: 1800,
      })
      const currentPage = pageNum.value
      await loadPage(currentPage)

      // If the last item on a page was removed, that page may no longer exist.
      // Fall back to the previous page so the user never gets stuck on an empty page.
      if (
        follows.value.length === 0 &&
        currentPage > 1 &&
        totalPages.value < currentPage
      ) {
        await loadPage(currentPage - 1)
      }
    } else {
      showFailToast({
        message,
        duration: 2500,
      })
    }
  } catch (error: any) {
    showFailToast(
      error?.response?.data?.msg || t('following.actionFailed'),
    )
  } finally {
    actionLoading[userId] = false
  }
}

onMounted(async () => {
  await loadCurrentUser()
  await loadPage(1)
})
</script>

<style scoped>
.following-page {
  min-height: 100%;
  padding-bottom: 28px;
  background: #f7f8fa;
}

.following-card {
  margin-top: 12px;
  overflow: hidden;
}

.following-item {
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

.page-loading {
  padding: 48px 0;
}

.pagination-wrap {
  padding: 18px 12px 0;
}
</style>
