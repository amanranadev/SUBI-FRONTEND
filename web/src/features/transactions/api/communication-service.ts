import { apiClient } from "@/lib/api/client"

export interface CommunicationEntry {
  id: string
  message_type: "email" | "sms"
  recipient_name: string
  recipient_email: string | null
  recipient_phone: string | null
  subject: string | null
  body: string
  sent_by: string
  sent_at: string | null
  cc_emails: string[]
  recipient_type: string
}

export interface CommunicationsMeta {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}

export interface CommunicationsResponse {
  communications: CommunicationEntry[]
  meta: CommunicationsMeta
}

export type CommunicationFilter = "all" | "email" | "sms"

const COMMUNICATION_ENDPOINTS = {
  list: (transactionId: string) =>
    `/transactions/${transactionId}/communications`,
} as const

export async function getTransactionCommunications(
  transactionId: string,
  options?: { filter?: CommunicationFilter; page?: number; perPage?: number },
): Promise<CommunicationsResponse> {
  const params: Record<string, string> = {}
  if (options?.filter && options.filter !== "all") {
    params.filter = options.filter
  }
  if (options?.page) {
    params.page = String(options.page)
  }
  if (options?.perPage) {
    params.per_page = String(options.perPage)
  }

  const { data } = await apiClient.get<CommunicationsResponse>(
    COMMUNICATION_ENDPOINTS.list(transactionId),
    { params },
  )
  return data
}
