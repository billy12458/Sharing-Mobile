import api from './client'
import axios from 'axios'

interface ApiResponse<T> {
  status: number
  msg: string
  data: T
}

async function unwrap<T>(request: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await request
  return response.data.data
}

export function getCollectRanking() {
  return unwrap(api.get('/rank/collection/rank.all'))
}

export function getDownloadRanking() {
  return unwrap(api.get('/rank/download/rank.all'))
}

export function getViewRanking() {
  return unwrap(api.get('/pageView/rank.all'))
}

export async function getRecommendFiles() {

  const response = await api.put(
    '/files/random?limit=10'
  )
  return response.data.data || []

}
