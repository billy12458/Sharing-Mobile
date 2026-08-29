import api from "./client";

export interface ApiResponse<T> {
  status?: number;
  msg?: string | string[];
  data: T;
}

export interface UserNameAndId {
  userId: string;
  userName: string;
}

export async function getIsLogin(): Promise<boolean> {
  const response = await api.get<boolean>("/user/isLogin");

  return Boolean(response.data);
}

export async function getUserNameAndId(): Promise<UserNameAndId> {
  const response = await api.get<ApiResponse<UserNameAndId>>("/user/nameAndId");

  return response.data.data;
}

export async function logout(): Promise<ApiResponse<null>> {
  const response = await api.get<ApiResponse<null>>("/logout");

  return response.data;
}

export async function getUserAvatar(): Promise<ApiResponse<null>> {
  const response = await api.get<ApiResponse<null>>("/user/avatar/my");
  return response.data;
}

export interface OtherProfile {
  userId: string;
  userName: string | null;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  sex?: string | null;
  age?: number | null;
  start_time?: string | null;
  startTime?: string | null;
  motto?: string | null;
  ip?: string | null;
}

export interface DisableCondition {
  disabled?: boolean;
  disableTime?: number;
  disableLevel?: number | string | null;
}

export async function getOtherUserInfo(userId: string) {
  const response = await api.put(`/user/${encodeURIComponent(userId)}`, null, {
    withCredentials: true,
  });

  return (response.data?.data || null) as OtherProfile | null;
}

export async function getDisableCondition(userId: string) {
  const response = await api.get(`/user/disable/situation`, {
    params: { userId },
    withCredentials: false,
  });

  return (response.data?.data || {}) as DisableCondition;
}
