import { defineStore } from 'pinia'
import { authApi } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    checked: false,
    loggedIn: false,
  }),
  actions: {
    async checkLogin() {
      try {
        this.loggedIn = await authApi.isLogin()
      } catch {
        this.loggedIn = false
      } finally {
        this.checked = true
      }
      return this.loggedIn
    },
    clear() {
      this.loggedIn = false
    },
  },
})
