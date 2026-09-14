<template>
  <div class="mobile-layout">
    <header class="mobile-header">
      <van-icon name="wap-nav" size="23" class="header-action" @click="drawerVisible = true" />
      <button class="brand" type="button" @click="goHome">
        <span class="brand-mark">
          <img src="../assets/images/quicky-sharing-logo.png" />
        </span>
        <span class="brand-name"> QuickySharing </span>
      </button>
      <van-icon name="search" size="22" class="header-action" @click="searchVisible = true" />
    </header>

    <van-popup v-model:show="drawerVisible" position="left" :style="{ width: '82%', height: '100%' }">
      <aside class="drawer">
        <div class="drawer-account" :class="{ clickable: !userState.loggedIn }" @click="handleAccountClick">
          <div class="avatar">
            <template v-if="userState.loggedIn">
              <img v-if="userState.avatar" :src="userState.avatar" class="avatar" />
            </template>
            <template v-else>
              <img src="../assets/images/avatar.jpg" />
            </template>
          </div>

          <div class="account-copy">
            <template v-if="userState.loggedIn">
              <strong>
                {{ userState.userName || '-' }}
              </strong>
              <span>
                {{ userState.userId || $t('profile.loggedIn') }}
              </span>
            </template>

            <template v-else>
              <strong>
                {{ $t('profile.notLoggedIn') }}
              </strong>

              <span>
                {{ $t('profile.loginHint') }}
              </span>
            </template>
          </div>
        </div>

        <div class="drawer-list">
          <button v-for="item in navigationItems" :key="item.key" type="button" class="drawer-item"
            @click="navigate(item.to)">
            <van-icon :name="item.icon" size="20" />
            <span>{{ $t(item.label) }}</span>
          </button>
        </div>

        <div class="drawer-footer">
          <span>{{ $t('common.language') }}</span>
          <van-cell-group inset>
            <van-cell center clickable @click="switchLanguage('zh-CN')">
              <template #title>{{ $t('common.chinese') }}</template>
              <template #value><van-icon v-if="locale === 'zh-CN'" name="success" /></template>
            </van-cell>
            <van-cell center clickable @click="switchLanguage('en-US')">
              <template #title>{{ $t('common.english') }}</template>
              <template #value><van-icon v-if="locale === 'en-US'" name="success" /></template>
            </van-cell>
          </van-cell-group>
        </div>

        <div class="drawer-bottom">
          <van-button v-if="userState.loggedIn" type="danger" block round :loading="userState.loggingOut"
            @click="handleLogout">
            {{ $t('common.logout') }}
          </van-button>
        </div>
      </aside>
    </van-popup>

    <van-popup v-model:show="searchVisible" position="top" :style="{ minHeight: '100%', padding: '16px' }">
      <div class="search-panel">
        <div class="search-panel-head">
          <strong>{{ $t('search.title') }}</strong>
          <van-icon name="cross" size="22" @click="searchVisible = false" />
        </div>
        <van-search v-model="searchQuery" :placeholder="$t('search.placeholder')" shape="round" autofocus
          @search="runSearch" />
        <div class="search-panel-content">
          <div class="section-title">{{ $t('search.history') }}</div>
          <van-empty v-if="!searchHistory.length" :description="$t('search.history')" />
          <van-tag v-for="item in searchHistory" :key="item" size="medium" round plain type="primary"
            class="history-tag" @click="runSearch(item)">{{ item }}</van-tag>
        </div>
      </div>
    </van-popup>

    <main class="mobile-main">
      <slot />
    </main>

    <MobileFooter />


  </div>
</template>

<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import MobileFooter from '@/components/MobileFooter.vue'
import { useUserStore } from '@/stores/user'
import { saveLanguage } from '@/utils/storage'
import {
  getIsLogin,
  getUserNameAndId,
  logout,
  getUserAvatar
} from '@/api/user'
import {
  showFailToast,
  showSuccessToast,
} from 'vant'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { t, locale } = useI18n()

const drawerVisible = ref(false)
const searchVisible = ref(false)
const searchQuery = ref('')
const searchHistory = ref<string[]>([])

const userState = reactive({
  loggedIn: false,
  userId: '',
  userName: '',
  avatar: '',
  loggingOut: false,
})

const navigationItems = computed(() => [
  { key: 'home', to: '/', icon: 'home-o', label: 'navigation.home' },
  { key: 'files', to: '/files', icon: 'description', label: 'navigation.files' },
  { key: 'ranking', to: '/ranking', icon: 'bar-chart-o', label: 'navigation.ranking' },
  { key: 'tags', to: '/tags/:tag', icon: 'label-o', label: 'navigation.tags' },
  { key: 'aiChat', to: '/ai-chat', icon: 'chat-o', label: 'navigation.aiChat' },
  // { key: 'messages', to: '/messages', icon: 'chat-o', label: 'navigation.messages' },
  // { key: 'photos', to: '/photos', icon: 'photo-o', label: 'navigation.photos' },
  { key: 'suggestions', to: '/suggestions', icon: 'comment-o', label: 'navigation.suggestions' },
  { key: 'extract', to: '/extract', icon: 'coupon-o', label: 'navigation.extractCode' },
  { key: 'profile', to: '/profile', icon: 'user-o', label: 'navigation.profile' },
])

function navigate(to: string) {
  drawerVisible.value = false
  searchVisible.value = false
  if (route.path !== to) router.push(to)
}

function goHome() {
  navigate('/')
}

function runSearch(value = searchQuery.value) {
  const keyword = String(value).trim()
  if (!keyword) return
  searchHistory.value = [keyword, ...searchHistory.value.filter((item) => item !== keyword)].slice(0, 8)
  searchVisible.value = false
  router.push({ path: '/search', query: { q: keyword } })
}

function switchLanguage(nextLocale: 'zh-CN' | 'en-US') {
  locale.value = nextLocale
  saveLanguage(nextLocale)
}

function handleAccountClick() {
  if (route.path === '/login') return
  drawerVisible.value = false
  if (userState.loggedIn) {
    router.push('/profile')
    return
  }
  router.push({
    path: '/login',
    query: {
      redirect: route.fullPath,
    },
  })
}

async function refreshUserState() {
  try {
    userState.loggedIn = await getIsLogin()

    if (!userState.loggedIn) {
      userState.userId = ''
      userState.userName = ''
      return
    }

    const user = await getUserNameAndId()
    const avatar = await getUserAvatar()

    userState.userId =
      user.userId ||
      user.id ||
      ''

    userState.userName =
      user.userName ||
      user.username ||
      ''

    userState.avatar = "https://api.quickysharing.cn/user/avatar/my"
  } catch {
    userState.loggedIn = false
    userState.userId = ''
    userState.userName = ''
  }
}

async function handleLogout() {
  if (userState.loggingOut) return

  userState.loggingOut = true

  try {
    const result = await logout()

    if (result.status === 200) {
      userState.loggedIn = false
      userState.userId = ''
      userState.userName = ''

      showSuccessToast({
        message: t('profile.logoutSuccess'),
        duration: 2000,
      })

      drawerVisible.value = false
      await router.push('/login')
      return
    }

    showFailToast({
      message:
        typeof result.msg === 'string'
          ? result.msg
          : result.msg.join('\n'),
    })
  } catch (error: any) {
    const msg = error?.response?.data?.msg

    showFailToast({
      message:
        typeof msg === 'string'
          ? msg
          : Array.isArray(msg)
            ? msg.join('\n')
            : t('profile.logoutFailed'),
    })
  } finally {
    userState.loggingOut = false
  }
}

onMounted(refreshUserState)
</script>

<style scoped>
.mobile-layout {
  min-height: 100vh;
  background: var(--qs-bg);
}

.mobile-header {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  min-height: 56px;
  padding: 0 8px;
  background: rgba(11, 11, 11, 0.96);
  color: #fff;
  backdrop-filter: blur(12px);
}

.header-action {
  cursor: pointer;
}

.brand {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  background: transparent;
  color: #fff;
  cursor: pointer;
  min-width: 0;
}

.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  color: #151515;
  font-weight: 800;
}

.brand-name {
  max-width: 190px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  font-size: 15px;
}

.drawer {
  min-height: 100%;
  padding: calc(20px + env(safe-area-inset-top)) 16px 20px;
}

.drawer-account {
  display: flex;
  gap: 12px;
  padding: 10px 4px 20px;
  border-bottom: 1px solid var(--qs-border);
}

.account-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.account-copy strong {
  font-size: 15px;
}

.account-copy span {
  font-size: 12px;
  color: var(--qs-muted);
}

.drawer-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 0;
}

.drawer-item {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 46px;
  padding: 0 12px;
  border: 0;
  border-radius: 11px;
  background: transparent;
  color: #222;
  text-align: left;
}

.drawer-item:active {
  background: #f3f5f8;
}

.drawer-footer {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: auto;
}

.mobile-main {
  min-height: calc(100vh - 56px);
}

.bottom-nav {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 15;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding-bottom: env(safe-area-inset-bottom);
  background: rgba(255, 255, 255, 0.97);
  border-top: 1px solid var(--qs-border);
  backdrop-filter: blur(12px);
}

.bottom-item {
  display: flex;
  min-height: 62px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: 0;
  background: transparent;
  color: #7d838c;
  font-size: 11px;
}

.bottom-item.active {
  color: var(--qs-primary);
  font-weight: 600;
}

.search-panel {
  min-height: 100%;
  padding-top: env(safe-area-inset-top);
}

.search-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 44px;
}

.search-panel-content {
  padding: 6px 4px;
}

.history-tag {
  margin: 0 7px 7px 0;
}

.drawer-bottom {
  margin-top: auto;
  padding: 18px 4px 4px;
}

.avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

</style>
