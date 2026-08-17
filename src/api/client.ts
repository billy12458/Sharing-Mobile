import axios, { AxiosError } from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.quickysharing.cn',
  withCredentials: true,
  timeout: 15000,
})

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 408) {
      const redirect = router.currentRoute.value.fullPath
      if (router.currentRoute.value.path !== '/login') {
        await router.push({ path: '/login', query: { redirect } })
      }
    }
    return Promise.reject(error)
  },
)

export default api
