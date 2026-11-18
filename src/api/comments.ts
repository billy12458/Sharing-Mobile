import api from './client'

interface ApiResponse<T> {
  status: number
  msg: string | string[]
  data: T
}

export interface FileComment {
  commentId: string
  fileId?: string
  userId: string
  userName?: string
  content: string
  commentTime?: string
  sentiment?: number | null
  hasChildren?: boolean
  firstCommentId?: string | null
  toUserId?: string | null
}

export interface CommentPage {
  list: FileComment[]
  total: number
  pageNum: number
  pageSize: number
  pages?: number
}

export interface AddCommentPayload {
  _id: string
  content: string
  firstCommentId: string | null
  toUserId: string | null
  hasChildren: boolean
}

export interface DeleteCommentPayload {
  _id: string
  userId: string
  commentId: string
  firstCommentId?: string | null
}

export interface ReportCommentPayload {
  objectId: string
  commentId: string
  _id: string
  reportContent: string
  type: string
  anon: boolean
}

async function ensureSuccess<T>(
  request: Promise<{ data: ApiResponse<T> }>,
): Promise<T> {
  const response = await request
  const payload = response.data

  if (payload.status !== 200) {
    const message = Array.isArray(payload.msg)
      ? payload.msg.join('\n')
      : payload.msg

    throw new Error(message || 'Request failed')
  }

  return payload.data
}

export async function getFileComments(
  fileId: string,
  pageNum: number,
  pageSize = 10,
): Promise<CommentPage> {
  return ensureSuccess(
    api.put<ApiResponse<CommentPage>>(
      '/commentH/all/paged',
      { _id: fileId },
      {
        params: {
          pageNum,
          pageSize,
        },
      },
    ),
  )
}

export async function getCommentReplies(
  fileId: string,
  firstCommentId: string,
): Promise<FileComment[]> {
  return ensureSuccess(
    api.put<ApiResponse<FileComment[]>>(
      '/commentH/all/secondary',
      {
        _id: fileId,
        firstCommentId,
      },
    ),
  )
}

export async function addComment(
  payload: AddCommentPayload,
): Promise<void> {
  await ensureSuccess(
    api.post<ApiResponse<null>>('/commentH/add', payload),
  )
}

export async function deleteComment(
  payload: DeleteCommentPayload,
): Promise<void> {
  await ensureSuccess(
    api.delete<ApiResponse<string>>(
      '/commentH/deleteC',
      {
        data: payload,
      },
    ),
  )
}

export async function reportComment(
  payload: ReportCommentPayload,
): Promise<number> {
  return ensureSuccess(
    api.post<ApiResponse<number>>(
      '/report/report.comment',
      payload,
    ),
  )
}
