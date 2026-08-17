import api from './client'

export const searchApi = {
  search(filename: string) {
    return api.get('/file/search', { params: { filename } })
  },
}
