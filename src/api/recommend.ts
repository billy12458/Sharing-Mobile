import api from "./client";

interface ApiResponse<T> {
  status: number;
  msg: string;
  data: T;
}

export async function getRecommendFiles() {
  const response = await api.put<ApiResponse<any[]>>(
    "/files/random?limit=10",
  );
  return response.data.data || [];
}
