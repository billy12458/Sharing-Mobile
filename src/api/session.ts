import api from './client'

export interface ApiResponse<T> {
  status?: number
  msg?: string | string[]
  data: T
}

export interface TokenSign {
  value: string
  device: string
}

export interface SessionInfo {
  id?: string
  createTime?: number
  dataMap?: {
    loginTime?: string
    loginIp?: string
    userId?: string
    [key: string]: unknown
  }
  tokenSignList?: TokenSign[]
  [key: string]: unknown
}

export interface TokenInfo {
  tokenValue?: string
  loginId?: string
  isLogin?: boolean
  sessionTimeout?: number
  [key: string]: unknown
}

export const SESSION_API_PATHS = {
  list: '/sessions/currentSession',
  tokenInfo: '/sessions/tokenInfo',
  delete: (sessionId: string) =>
    `/logout/session/${encodeURIComponent(sessionId)}`,
} as const

export async function getSessionList(): Promise<SessionInfo> {
  const response = await api.get<ApiResponse<SessionInfo>>(
    SESSION_API_PATHS.list,
  )

  return response.data.data
}

export async function getTokenInfo(): Promise<TokenInfo> {
  const response = await api.get<ApiResponse<TokenInfo>>(
    SESSION_API_PATHS.tokenInfo,
  )

  return response.data.data
}

export async function deleteSession(
  sessionId: string,
): Promise<ApiResponse<unknown>> {
  const response = await api.delete<ApiResponse<unknown>>(
    SESSION_API_PATHS.delete(sessionId),
  )

  return response.data
}
