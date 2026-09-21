import axios, {
  AxiosError,
  type AxiosResponse,
} from 'axios'
import router from '@/router'

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    'https://api.quickysharing.cn',
  withCredentials: true,
  timeout: 15000,
})

let redirectingToLogin = false

function getBusinessStatus(response: AxiosResponse) {
  const status = response?.data?.status

  if (typeof status === 'number') {
    return status
  }

  if (typeof status === 'string' && status.trim() !== '') {
    const parsed = Number(status)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return null
}

function getBusinessMessage(response: AxiosResponse) {
  const message = response?.data?.msg

  if (typeof message === 'string') {
    return message
  }

  if (Array.isArray(message)) {
    return message.join('\n')
  }

  return ''
}

function isUnauthenticatedBusinessResponse(
  response: AxiosResponse,
) {
  const businessStatus = getBusinessStatus(response)
  const message = getBusinessMessage(response)

  // 后端业务层使用这些状态表示登录/会话失效
  if (
    businessStatus === 401 ||
    businessStatus === 408
  ) {
    return true
  }

  // 某些旧接口可能仍然通过 msg 返回登录失效信息
  return /未登录|登录已过期|会话已过期|请先登录/.test(
    message,
  )
}

async function redirectToLogin() {
  // 防止多个请求同时返回“未登录”时重复跳转
  if (redirectingToLogin) {
    return
  }

  if (router.currentRoute.value.path === '/login') {
    return
  }

  redirectingToLogin = true

  try {
    const redirect =
      router.currentRoute.value.fullPath

    await router.replace({
      path: '/login',
      query: {
        redirect,
      },
    })
  } finally {
    redirectingToLogin = false
  }
}

api.interceptors.response.use(
  async (response) => {
    /*
     * HTTP 200，但业务层实际上表示登录失效：
     *
     * {
     *   "status": 401,
     *   "msg": "未登录"
     * }
     *
     * 这种情况不会进入下面的 error interceptor，
     * 所以必须在 fulfilled interceptor 中处理。
     */
    if (
      isUnauthenticatedBusinessResponse(response)
    ) {
      await redirectToLogin()
    }

    return response
  },

  async (error: AxiosError) => {
    /*
     * HTTP 层直接返回 401 / 408
     */
    if (
      error.response?.status === 401 ||
      error.response?.status === 408
    ) {
      await redirectToLogin()
    }

    return Promise.reject(error)
  },
)

export default api