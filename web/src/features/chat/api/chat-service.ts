import { apiClient } from "@/lib/api/client"
import { CHAT_ENDPOINTS } from "./endpoints"
import type { MessageDraftResponse } from "./draft-service"

export interface BackendChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: string
  sources?: Array<{ page?: number | null; section?: string | null; excerpt?: string }>
}

export interface BackendChat {
  id: string
  title: string
  status: string
  messages: BackendChatMessage[]
  message_count: number
  created_at: string
  updated_at: string
  user_id: string
  context_transaction_id: string | null
  context_upload_id: string | null
  rag_enabled: boolean
}

export interface BackendChatSummary {
  id: string
  title: string
  status: string
  message_count: number
  last_message: BackendChatMessage | null
  created_at: string
  updated_at: string
  user_id: string
  context_transaction_id: string | null
  context_upload_id: string | null
  rag_enabled: boolean
}

export interface PaginationMeta {
  current_page: number
  total_pages: number
  total_count: number
  per_page: number
}

export interface PaginatedChatsResponse {
  user_chats: BackendChatSummary[]
  meta: PaginationMeta
}

export interface ListChatsParams {
  page?: number
  per_page?: number
}

type RawChatSummary = Partial<BackendChatSummary> & {
  messages?: BackendChatMessage[]
}

function normalizeChatSummary(chat: RawChatSummary): BackendChatSummary {
  const messages = Array.isArray(chat.messages) ? chat.messages : []
  const lastMessage =
    chat.last_message ??
    (messages.length > 0 ? messages[messages.length - 1]! : null)

  return {
    id: String(chat.id ?? ""),
    title: String(chat.title ?? ""),
    status: String(chat.status ?? "active"),
    message_count: Number(chat.message_count ?? messages.length),
    last_message: lastMessage,
    created_at: String(chat.created_at ?? ""),
    updated_at: String(chat.updated_at ?? ""),
    user_id: String(chat.user_id ?? ""),
    context_transaction_id: chat.context_transaction_id ?? null,
    context_upload_id: chat.context_upload_id ?? null,
    rag_enabled: Boolean(chat.rag_enabled ?? false),
  }
}

function normalizePaginatedChatsResponse(
  data: unknown,
  params: ListChatsParams,
): PaginatedChatsResponse {
  const page = params.page ?? 1
  const perPage = params.per_page ?? 20

  let rawChats: RawChatSummary[] = []
  if (Array.isArray(data)) {
    rawChats = data
  } else if (data && typeof data === "object") {
    const payload = data as { user_chats?: RawChatSummary[]; data?: RawChatSummary[]; meta?: PaginationMeta }
    if (Array.isArray(payload.user_chats)) rawChats = payload.user_chats
    else if (Array.isArray(payload.data)) rawChats = payload.data

    if (payload.meta) {
      return {
        user_chats: rawChats.map(normalizeChatSummary),
        meta: payload.meta,
      }
    }
  }

  const allChats = rawChats.map(normalizeChatSummary)
  const totalCount = allChats.length
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))
  const start = (page - 1) * perPage

  return {
    user_chats: allChats.slice(start, start + perPage),
    meta: {
      current_page: page,
      total_pages: totalPages,
      total_count: totalCount,
      per_page: perPage,
    },
  }
}

export interface CreateChatParams {
  title?: string
  transaction_id?: string
  upload_id?: string
  initial_message?: string
}

export interface SendMessageResponse {
  message: string
  chat: {
    id: string
    last_message: BackendChatMessage | null
    message_count: number
    rag_enabled: boolean
  }
}

export interface PaginatedMessagesResponse {
  messages: BackendChatMessage[]
  meta: PaginationMeta
}

export interface RagStatusResponse {
  transaction_id: string
  rag_available: boolean
  chunk_count: number
}

export const chatService = {
  async createChat(params: CreateChatParams): Promise<BackendChat> {
    const { data } = await apiClient.post<BackendChat>(CHAT_ENDPOINTS.create, params)
    return data
  },

  async getChat(id: string): Promise<BackendChat> {
    const { data } = await apiClient.get<BackendChat>(CHAT_ENDPOINTS.show(id))
    return data
  },

  async listChats(params: ListChatsParams = {}): Promise<PaginatedChatsResponse> {
    const { data } = await apiClient.get<unknown>(CHAT_ENDPOINTS.list)
    return normalizePaginatedChatsResponse(data, params)
  },

  async sendMessage(chatId: string, message: string): Promise<SendMessageResponse> {
    const { data } = await apiClient.post<SendMessageResponse>(
      CHAT_ENDPOINTS.sendMessage(chatId),
      { message },
    )
    return data
  },

  async getMessages(
    chatId: string,
    params: { page?: number; per_page?: number } = {},
  ): Promise<PaginatedMessagesResponse> {
    const { data } = await apiClient.get<PaginatedMessagesResponse>(
      CHAT_ENDPOINTS.messages(chatId),
      { params: { page: params.page ?? 1, per_page: params.per_page ?? 30 } },
    )
    return data
  },

  /** All message drafts for this chat (every status), from GET /user_chats/:id/message_drafts */
  async getMessageDrafts(chatId: string): Promise<MessageDraftResponse[]> {
    const { data } = await apiClient.get<MessageDraftResponse[] | { data: MessageDraftResponse[] }>(
      CHAT_ENDPOINTS.messageDrafts(chatId),
    )
    if (Array.isArray(data)) return data
    if (Array.isArray((data as { data: MessageDraftResponse[] }).data)) {
      return (data as { data: MessageDraftResponse[] }).data
    }
    return []
  },

  async getRagStatus(transactionId: string): Promise<RagStatusResponse> {
    const { data } = await apiClient.get<RagStatusResponse>(CHAT_ENDPOINTS.ragStatus, {
      params: { transaction_id: transactionId },
    })
    return data
  },

  async deleteChat(id: string): Promise<void> {
    await apiClient.delete(CHAT_ENDPOINTS.show(id))
  },

}
