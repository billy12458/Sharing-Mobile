import axios from 'axios'
import api from './client'

export interface TagFileMetadata {
  filename?: string
  description?: string
  expire?: string
  isPrivate?: boolean
  tags?: string[]
  userId?: string
  userName?: string
  _contentType?: string
}

export interface TagFileContent {
  id?: string
  filename?: string
  length?: number
  metadata?: TagFileMetadata
  uploadDate?: string
}

export interface TagSearchItem {
  index?: string
  id?: string
  score?: number
  content?: TagFileContent
}

export interface TagPageData {
  content: TagSearchItem[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
}

export async function getTagFiles(
  tag: string,
  pageNum = 1,
  pageSize = 10,
): Promise<TagPageData> {
  const response = await api.put('/files/tag', null, {
    params: {
      tag,
      pageNum,
      pageSize,
    },
  })

  return response.data?.data ?? {
    content: [],
    totalPages: 0,
    totalElements: 0,
    number: 0,
    size: pageSize,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true,
  }
}
