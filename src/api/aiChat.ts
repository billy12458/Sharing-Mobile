export interface Conversation {
  conversation_id: number
  user_id: number
  title: string
  created_at: string
  updated_at: string
}

export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  message_id?: number
  conversation_id?: number
  user_id?: number
  role: MessageRole
  content: string
  created_at?: string
}

export interface ConversationListResponse {
  conversations: Conversation[]
  has_more: boolean
  next_updated_at?: string | null
  next_conversation_id?: number | null
}

export interface MessageListResponse {
  messages: ChatMessage[]
  has_more: boolean
  next_created_at?: string | null
  next_message_id?: number | null
}

const AI_API_BASE_URL =
  import.meta.env.VITE_AI_API_BASE_URL || 'https://ai.quickysharing.cn'

async function parseError(response: Response): Promise<Error> {
  try {
    const payload = await response.json()

    if (typeof payload?.detail === 'string') {
      return new Error(payload.detail)
    }

    if (typeof payload?.error === 'string') {
      return new Error(payload.error)
    }
  } catch {
    // Ignore non-JSON error bodies.
  }

  return new Error(`HTTP ${response.status}`)
}

export async function getConversations(params: {
  limit?: number
  updated_at?: string
  conversation_id?: number
} = {}): Promise<ConversationListResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('limit', String(params.limit ?? 5))

  if (params.updated_at) {
    searchParams.set('updated_at', params.updated_at)
  }

  if (params.conversation_id != null) {
    searchParams.set('conversation_id', String(params.conversation_id))
  }

  const response = await fetch(
    `${AI_API_BASE_URL}/api/conversations?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json()
}

export async function deleteConversation(
  conversationId: number,
): Promise<{ success: boolean; conversationId: number }> {
  const response = await fetch(
    `${AI_API_BASE_URL}/api/conversations/${conversationId}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json()
}

export async function getMessages(
  conversationId: number,
  params: {
    limit?: number
    before_created_at?: string
    before_message_id?: number
  } = {},
): Promise<MessageListResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('limit', String(params.limit ?? 5))

  if (params.before_created_at) {
    searchParams.set('before_created_at', params.before_created_at)
  }

  if (params.before_message_id != null) {
    searchParams.set('before_message_id', String(params.before_message_id))
  }

  const response = await fetch(
    `${AI_API_BASE_URL}/api/conversations/${conversationId}/messages?${searchParams.toString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    },
  )

  if (!response.ok) {
    throw await parseError(response)
  }

  return response.json()
}

export async function streamChat(
  question: string,
  conversationId: number | null,
  onEvent: (payload: Record<string, unknown>) => void,
): Promise<void> {
  const response = await fetch(`${AI_API_BASE_URL}/api/chat`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      question,
      conversation_id: conversationId,
    }),
  })

  if (!response.ok || !response.body) {
    throw await parseError(response)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })

    const events = buffer.split('\n\n')
    buffer = events.pop() || ''

    for (const event of events) {
      const dataLine = event
        .split('\n')
        .find((line) => line.startsWith('data:'))

      if (!dataLine) continue

      const data = dataLine.slice(5).trim()

      if (!data || data === '[DONE]') {
        continue
      }

      const payload = JSON.parse(data) as Record<string, unknown>

      if (typeof payload.error === 'string') {
        throw new Error(payload.error)
      }

      onEvent(payload)
    }
  }

  if (buffer.trim()) {
    const dataLine = buffer
      .split('\n')
      .find((line) => line.startsWith('data:'))

    if (dataLine) {
      const data = dataLine.slice(5).trim()
      if (data && data !== '[DONE]') {
        const payload = JSON.parse(data) as Record<string, unknown>

        if (typeof payload.error === 'string') {
          throw new Error(payload.error)
        }

        onEvent(payload)
      }
    }
  }
}
