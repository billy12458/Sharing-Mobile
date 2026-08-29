import api from "./client";

export interface ApiResponse<T> {
  status?: number;
  msg?: string | string[];
  data: T;
}

export interface Profile {
  userId: string;
  userName: string;
  email?: string | null;
  avatar?: string | null;
  age: number;
  sex?: string | null;
  start_time?: string | null;
  phone?: string | null;
  motto?: string | null;
  ip?: string | null;
  secret?: string | null;
}

export interface FansAndFollowsCount {
  fansCount: number;
  followsCount: number;
}

export interface ProfileUpdate {
  userName: string;
  sex: string;
  age: number;
  motto: string;
}

export async function getMyProfile(): Promise<Profile> {
  const response = await api.put<ApiResponse<Profile>>("/user/my");

  return response.data.data;
}

export async function getMyFansAndFollows(
  userName: null,
): Promise<FansAndFollowsCount> {
  if (!userName) userName = "";
  const response = await api.put<ApiResponse<FansAndFollowsCount>>(
    `/faf/count?userName=${userName}`,
  );

  return response.data.data;
}

export async function getTodaySign(): Promise<boolean> {
  const response = await api.put<ApiResponse<boolean>>("/sign/today");

  return Boolean(response.data.data);
}

export async function signInToday(): Promise<boolean> {
  const response = await api.post<ApiResponse<boolean>>("/sign/signIn/today");

  return Boolean(response.data.data);
}

export async function updateMyProfile(profile: ProfileUpdate) {
  return api.post<ApiResponse<null>>("/user/update", profile);
}
