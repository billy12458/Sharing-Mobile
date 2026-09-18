import api from './client'

export interface ApiResponse<T> {
  status: number
  msg: string | string[]
  data: T
}

export interface MyFileMetadata {
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

export interface MyFile {
  _id: string
  filename?: string
  length?: number
  uploadDate?: string
  metadata?: MyFileMetadata
  [key: string]: unknown
}

export interface MyFilesPage {
  content: MyFile[]
  totalPages: number
  totalElements: number
  number: number
  size: number
  numberOfElements: number
  first: boolean
  last: boolean
  empty: boolean
  [key: string]: unknown
}

export interface MyFileSearch {
  filename: string
  userName: string
  userId: string
  _contentType: string
  description: string
}

export async function getMyPagedFiles(
  pageNum: number,
  pageSize = 15,
): Promise<MyFilesPage> {
  const response = await api.put<ApiResponse<{
    filesList: unknown
    filesPageImpl: MyFilesPage
  }>>(
    '/files/my/paged',
    null,
    {
      params: {
        pageNum,
        pageSize,
      },
    },
  )

  return response.data.data.filesPageImpl
}

export async function searchMyPagedFiles(
  search: MyFileSearch,
  pageNum: number,
  pageSize = 15,
): Promise<MyFilesPage> {
  const response = await api.post<ApiResponse<{
    filesList: unknown
    filesPageImpl: MyFilesPage
  }>>(
    '/files/my/search',
    search,
    {
      params: {
        pageNum,
        pageSize,
      },
    },
  )

  return response.data.data.filesPageImpl
}

export async function deleteFile(fileId: string) {
  return api.delete<ApiResponse<null>>(
    `/files/delete/${encodeURIComponent(fileId)}`,
  )
}

export async function summonShareCode(fileId: string) {
  return api.post<ApiResponse<string | { code?: string }>>(
    '/files/share/code',
    { _id: fileId },
  )
}

export async function getDecryptedPassword(fileId: string) {
  return api.get<ApiResponse<string>>(
    `/files/password/decrypt/${encodeURIComponent(fileId)}`,
  )
}
