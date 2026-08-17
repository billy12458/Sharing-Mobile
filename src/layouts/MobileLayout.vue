<template>
  <div class="mobile-layout">
    <header class="mobile-header">
      <van-icon name="wap-nav" size="23" class="header-action" @click="drawerVisible = true" />
      <button class="brand" type="button" @click="goHome">
        <span class="brand-mark">Q</span>
        <span class="brand-name">QuickySharing</span>
      </button>
      <van-icon name="search" size="22" class="header-action" @click="searchVisible = true" />
    </header>

    <van-popup v-model:show="drawerVisible" position="left" :style="{ width: '82%', height: '100%' }">
      <aside class="drawer">
        <div class="drawer-account">
          <div class="avatar">Q</div>
          <div class="account-copy">
            <strong>{{ userStore.loggedIn ? 'Quicky User' : $t('profile.notLoggedIn') }}</strong>
            <span>{{ userStore.loggedIn ? 'Signed in' : $t('profile.loginHint') }}</span>
          </div>
        </div>

        <div class="drawer-list">
          <button v-for="item in navigationItems" :key="item.key" type="button" class="drawer-item" @click="navigate(item.to)">
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
      </aside>
    </van-popup>

    <van-popup v-model:show="searchVisible" position="top" :style="{ minHeight: '100%', padding: '16px' }">
      <div class="search-panel">
        <div class="search-panel-head">
          <strong>{{ $t('search.title') }}</strong>
          <van-icon name="cross" size="22" @click="searchVisible = false" />
        </div>
        <van-search v-model="searchQuery" :placeholder="$t('search.placeholder')" shape="round" autofocus @search="runSearch" />
        <div class="search-panel-content">
          <div class="section-title">{{ $t('search.history') }}</div>
          <van-empty v-if="!searchHistory.length" :description="$t('search.history')" />
          <van-tag v-for="item in searchHistory" :key="item" size="medium" round plain type="primary" class="history-tag" @click="runSearch(item)">{{ item }}</van-tag>
        </div>
      </div>
    </van-popup>

    <main class="mobile-main">
      <slot />
    </main>

    <nav class="bottom-nav">
      <button v-for="item in bottomItems" :key="item.to" type="button" class="bottom-item" :class="{ active: isActive(item.to) }" @click="navigate(item.to)">
        <van-icon :name="item.icon" size="20" />
        <span>{{ $t(item.label) }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/user'
import { saveLanguage } from '@/utils/storage'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const { locale } = useI18n()

const drawerVisible = ref(false)
const searchVisible = ref(false)
const searchQuery = ref('')
const searchHistory = ref<string[]>([])

const navigationItems = computed(() => [
  { key: 'home', to: '/', icon: 'home-o', label: 'navigation.home' },
  { key: 'files', to: '/files', icon: 'description', label: 'navigation.files' },
  { key: 'ranking', to: '/ranking', icon: 'bar-chart-o', label: 'navigation.ranking' },
  { key: 'tags', to: '/tags', icon: 'label-o', label: 'navigation.tags' },
  { key: 'documents', to: '/documents', icon: 'notes-o', label: 'navigation.documents' },
  { key: 'messages', to: '/messages', icon: 'chat-o', label: 'navigation.messages' },
  { key: 'photos', to: '/photos', icon: 'photo-o', label: 'navigation.photos' },
  { key: 'suggestions', to: '/suggestions', icon: 'comment-o', label: 'navigation.suggestions' },
  { key: 'extract', to: '/extract', icon: 'coupon-o', label: 'navigation.extractCode' },
  { key: 'profile', to: '/profile', icon: 'user-o', label: 'navigation.profile' },
])

const bottomItems = computed(() => [
  { to: '/', icon: 'home-o', label: 'navigation.home' },
  { to: '/files', icon: 'description', label: 'navigation.files' },
  { to: '/search', icon: 'search', label: 'navigation.search' },
  { to: '/profile', icon: 'user-o', label: 'navigation.profile' },
])

function navigate(to: string) {
  drawerVisible.value = false
  searchVisible.value = false
  if (route.path !== to) router.push(to)
}

function goHome() {
  navigate('/')
}

function isActive(to: string) {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(`${to}/`)
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
  background: #f3b33d;
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

.avatar {
  display: grid;
  place-items: center;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #f3b33d;
  color: #151515;
  font-weight: 800;
  font-size: 19px;
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
</style>
