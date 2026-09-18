import api from './client'

export interface ApiResponse<T> {
  status?: number
  msg?: string | string[]
  data: T
}

export interface SearchFileMetadata {
  filename?: string
  _contentType?: string
  expire?: string
  description?: string
  userName?: string
  userId?: string
  tags?: string[]
  isPrivate?: boolean
  password?: string
  code?: string
  [key: string]: unknown
}

export interface SearchFileContent {
  id?: string
  _id?: string
  filename?: string
  length?: number
  uploadDate?: string
  metadata?: SearchFileMetadata
  [key: string]: unknown
}

export interface SearchFileHit {
  index?: string
  id?: string
  score?: number
  content?: SearchFileContent
  highlightFields?: Record<string, unknown>
  [key: string]: unknown
}

export interface FileSearchPage {
  content: SearchFileHit[]
  pageable?: unknown
  totalPages: number
  totalElements: number
  last?: boolean
  number?: number
  size?: number
  numberOfElements?: number
  sort?: unknown
  first?: boolean
  empty?: boolean
}

export interface TagSearchDTO {
  tags: string[]
}

export async function searchFilesByKeyword(
  keyword: string,
  pageNum: number,
  pageSize = 10,
): Promise<FileSearchPage> {
  const response = await api.post<ApiResponse<FileSearchPage>>(
    '/files/multi/search',
    null,
    {
      params: {
        keyword,
        pageNum,
        pageSize,
      },
    },
  )

  return response.data.data
}

export async function searchFilesByTags(
  tags: string[],
  pageNum: number,
  pageSize = 10,
): Promise<FileSearchPage> {
  const response = await api.put<ApiResponse<FileSearchPage>>(
    '/files/tags/search/v2',
    { tags } satisfies TagSearchDTO,
    {
      params: {
        pageNum,
        pageSize,
      },
    },
  )

  return response.data.data
}
