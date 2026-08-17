import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/Home.vue'), meta: { title: 'home' } },
  { path: '/files', name: 'files', component: () => import('@/views/Files.vue'), meta: { title: 'files', requiresAuth: true } },
  { path: '/files/:id', name: 'file-detail', component: () => import('@/views/FileDetail.vue'), props: true, meta: { title: 'files' } },
  { path: '/search', name: 'search', component: () => import('@/views/Search.vue'), meta: { title: 'search' } },
  { path: '/profile', name: 'profile', component: () => import('@/views/Profile.vue'), meta: { title: 'profile' } },
  { path: '/login', name: 'login', component: () => import('@/views/Login.vue'), meta: { title: 'login' } },
  { path: '/register', name: 'register', component: () => import('@/views/Register.vue'), meta: { title: 'register' } },
  { path: '/extract', name: 'extract', component: () => import('@/views/Extract.vue'), meta: { title: 'extract' } },
  { path: '/ranking', name: 'ranking', component: () => import('@/views/Ranking.vue'), meta: { title: 'ranking' } },
  { path: '/tags', name: 'tags', component: () => import('@/views/PlaceholderPage.vue'), props: { pageKey: 'tags' }, meta: { title: 'tags' } },
  { path: '/documents', name: 'documents', component: () => import('@/views/PlaceholderPage.vue'), props: { pageKey: 'documents' }, meta: { title: 'documents' } },
  { path: '/suggestions', name: 'suggestions', component: () => import('@/views/PlaceholderPage.vue'), props: { pageKey: 'suggestions' }, meta: { title: 'suggestions' } },
  { path: '/photos', name: 'photos', component: () => import('@/views/PlaceholderPage.vue'), props: { pageKey: 'photos' }, meta: { title: 'photos' } },
  { path: '/messages', name: 'messages', component: () => import('@/views/PlaceholderPage.vue'), props: { pageKey: 'messages' }, meta: { title: 'messages' } },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/views/PlaceholderPage.vue'), props: { pageKey: 'home' } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

const titleMap: Record<string, string> = {
  home: 'Quicky Sharing',
  files: 'My Files - Quicky Sharing',
  search: 'Search - Quicky Sharing',
  profile: 'Profile - Quicky Sharing',
  login: 'Log in - Quicky Sharing',
  register: 'Register - Quicky Sharing',
  extract: 'Extract Code - Quicky Sharing',
  ranking: 'Ranking - Quicky Sharing',
  tags: 'Tags - Quicky Sharing',
  documents: 'Documents - Quicky Sharing',
  suggestions: 'Suggestions - Quicky Sharing',
  photos: 'Photos - Quicky Sharing',
  messages: 'Messages - Quicky Sharing',
}

router.afterEach((to) => {
  const key = String(to.meta.title || 'home')
  document.title = titleMap[key] || 'Quicky Sharing'
})

export default router
