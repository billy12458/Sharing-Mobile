import api from './client'

export interface ApiResponse<T> {
  status?: number
  msg?: string | string[]
  data: T
}

export interface UserNameAndId {
  userId: string
  userName: string
}

export async function getIsLogin(): Promise<boolean> {
  const response =
    await api.get<boolean>('/user/isLogin')

  return Boolean(response.data)
}

export async function getUserNameAndId(): Promise<UserNameAndId> {
  const response =
    await api.get<ApiResponse<UserNameAndId>>(
      '/user/nameAndId',
    )

  return response.data.data
}

export async function logout(): Promise<ApiResponse<null>> {
  const response =
    await api.get<ApiResponse<null>>(
      '/logout',
    )

  return response.data
}

export async function getUserAvatar(): Promise<ApiResponse<null>> {
  const response =
    await api.get<ApiResponse<null>>(
      '/user/avatar/my',
    )
  return response.data
}
