import api from "./client";

interface ApiResponse<T> {
  status: number;
  msg: string;
  data: T;
}

export interface FileDetail {
  filename?: string;
  length?: number;
  chunkSize?: number;
  uploadDate?: string;
  metadata?: {
    _contentType?: string;
    filename?: string;
    expire?: string;
    description?: string;
    userName?: string;
    tags?: string[];
    userId?: string;
    isPrivate?: boolean;
    password?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export async function getFileDetail(id: string): Promise<FileDetail> {
  const response = await api.post<ApiResponse<FileDetail>>(
    `/files/detail/${encodeURIComponent(id)}`,
  );

  return response.data.data;
}

export async function getDownloadCount(id: string): Promise<number> {
  const response = await api.put<ApiResponse<number>>("/files/download/count", {
    "_id": id,
  });

  return response.data.data;
}

export async function getCollectionCount(id: string): Promise<number> {
  const response = await api.put<ApiResponse<number>>(
    `/collect/count/${encodeURIComponent(id)}`,
  );

  return response.data.data;
}

export async function getPageViewCount(id: string): Promise<number> {
  const response = await api.post<ApiResponse<number>>(
    `/pageView/count/${encodeURIComponent(id)}`,
  );

  return response.data.data;
}

export interface CollectFilePayload {
  filename: string;
  userId: string;
  userName: string;
}

export async function collectFile(
  id: string,
  payload: CollectFilePayload,
): Promise<void> {
  const response = await api.post<ApiResponse<unknown>>("/collect/collect", {
    ...payload,
    _id: id,
  });

  if (response.data.status !== 200) {
    throw new Error(response.data.msg || "Failed to collect file");
  }
}

export async function getCollectedState(id: string): Promise<boolean> {
  const response = await api.post<ApiResponse<boolean>>("/collect/collected", {
    _id: id,
  });

  return response.data.data;
}
