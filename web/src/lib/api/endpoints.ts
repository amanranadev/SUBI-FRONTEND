import { env } from "@/lib/env"

export const API_BASE_URL = env.NEXT_PUBLIC_API_BASE_URL 

export const endpoints = {
  transactions: {

    list: (query?: string) => `/transactions${query ? `?${query}` : ''}`,

  },
}
