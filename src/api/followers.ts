import axios from 'axios'

export interface FanUser {
  userId: string
  userName: string | null
  email?: string | null
  password?: string | null
  salt?: string | null
  avatar?: string | null
  age?: number
  sex?: string | null
  code?: string | null
  startTime?: string | null
  phone?: string | null
  motto?: string | null
  ip?: string | null
  secret?: string | null
  mfa?: boolean
}

export interface FansPagedData {
  total: number
  list: FanUser[]
  pageNum: number
  pageSize: number
  pages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
  [key: string]: unknown
}

const API_BASE = 'https://api.quickysharing.cn'

export async function getMyFansPaged(
  pageNum = 1,
  pageSize = 10,
): Promise<FansPagedData> {
  const response = await axios.put(
    `${API_BASE}/faf/fans/all/paged`,
    null,
    {
      params: {
        pageNum,
        pageSize,
      },
      withCredentials: true,
    },
  )

  return response.data?.data || {
    total: 0,
    list: [],
    pageNum,
    pageSize,
    pages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  }
}


export async function getMyFollowsPaged(
  pageNum = 1,
  pageSize = 10,
): Promise<FansPagedData> {
  const response = await axios.put(
    `${API_BASE}/faf/follows/all/paged`,
    null,
    {
      params: {
        pageNum,
        pageSize,
      },
      withCredentials: true,
    },
  )

  return response.data?.data || {
    total: 0,
    list: [],
    pageNum,
    pageSize,
    pages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  }
}

export async function cancelSubscribeUser(
  userId: string,
  followsUserId: string,
) {
  return axios.delete(
    `${API_BASE}/faf/fans/cacelSubscribe`,
    {
      data: {
        userId,
        followsUserId,
      },
      withCredentials: true,
    },
  )
}

export async function getMyProfile() {
  const response = await axios.put(
    `${API_BASE}/user/my`,
    null,
    {
      withCredentials: true,
    },
  )

  return response.data?.data || null
}

export async function subscribeUser(
  userId: string,
  followsUserId: string,
) {
  return axios.post(
    `${API_BASE}/faf/fans/subscribe`,
    {
      userId,
      followsUserId,
    },
    {
      withCredentials: true,
    },
  )
}
