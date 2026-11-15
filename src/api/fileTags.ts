import axios from 'axios'

import { DEFAULT_TAG, tags, type FileTag } from '@/constants/tags'

const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL || 'https://ai.quickysharing.cn'

interface InferTagResponse {
  inferred_tag?: string | null
}

const aiApi = axios.create({
  baseURL: AI_API_BASE_URL,
  timeout: 15000,
})

function isFileTag(value: unknown): value is FileTag {
  return (
    typeof value === 'string' &&
    tags.includes(value as FileTag)
  )
}

export async function inferFileTag(filename: string): Promise<FileTag> {
  const response = await aiApi.post<InferTagResponse>(
    '/api/files/infer-tag',
    {
      filename,
      allowed_tags: [...tags],
    },
  )

  return isFileTag(response.data?.inferred_tag)
    ? response.data.inferred_tag
    : DEFAULT_TAG
}
