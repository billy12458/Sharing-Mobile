import api from './client'

interface ApiResponse<T> {
  status: number
  msg: string | string[]
  data: T
}

export interface LoginPayload {
  userName: string
  password: string
  code: string
}

export async function getCaptcha(): Promise<string> {
  const response = await api.get<string>('/captcha/getImage')
  return response.data
}

export async function login(payload: LoginPayload) {
  const response = await api.post<ApiResponse<null>>(
    '/login',
    payload,
  )

  return response.data
}
