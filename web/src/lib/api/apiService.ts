import type { AxiosResponse } from "axios"
import type { ApiError } from "@subi/types"
import { apiClient } from "@/lib/api/client"
import { endpoints } from "@/lib/api/endpoints"

const apiService = {

  getTransactions: (query?: string): Promise<AxiosResponse> => {
    return apiClient.get(endpoints.transactions.list(query))
  },

  // Generic helpers that call the shared client. Return values can be adjusted to return .data
  post: <T = any>(url: string, data?: any) => apiClient.post<T>(url, data),
  put: <T = any>(url: string, data?: any) => apiClient.put<T>(url, data),
  delete: <T = any>(url: string) => apiClient.delete<T>(url),
}

export type { AxiosResponse, ApiError }
export default apiService
