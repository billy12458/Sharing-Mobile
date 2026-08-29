import api from './client'

export interface ApiResponse<T> {
  status?: number
  msg?: string | string[]
  data: T
}

export interface LoginLogItem {
  userId: string
  logId: string
  loginIp: string
  loginTime: string
  address: string
  browser: string
  version: number
}

export interface LoginLogPage {
  total: number
  list: LoginLogItem[]
  pageNum: number
  pageSize: number
  size: number
  startRow: number
  endRow: number
  pages: number
  prePage: number
  nextPage: number
  isFirstPage: boolean
  isLastPage: boolean
  hasPreviousPage: boolean
  hasNextPage: boolean
  navigatePages: number
  navigatepageNums: number[]
  navigateFirstPage: number
  navigateLastPage: number
}

export interface IpInfo {
  country?: string
  region?: string
  province?: string
  city?: string
  isp?: string
  [key: string]: unknown
}

export async function getMyLoginLogs(
  pageNum: number,
  pageSize = 10,
): Promise<LoginLogPage> {
  const response = await api.post<ApiResponse<LoginLogPage>>(
    '/log/my',
    null,
    { params: { pageNum, pageSize } },
  )
  return response.data.data
}

export async function getIpInfo(
  ip: string,
): Promise<IpInfo> {
  const response = await api.get<ApiResponse<IpInfo>>(
    '/log/ipInfo',
    { params: { ip } },
  )
  return response.data.data
}
