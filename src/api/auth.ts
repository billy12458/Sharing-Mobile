import api from './client'

export const authApi = {
  async isLogin(): Promise<boolean> {
    const response = await api.get<boolean>('/user/isLogin')
    return Boolean(response.data)
  },
}
