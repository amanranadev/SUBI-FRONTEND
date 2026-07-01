export const CHAT_ENDPOINTS = {
  list: "/user_chats",
  create: "/user_chats",
  show: (id: string) => `/user_chats/${id}`,
  messages: (id: string) => `/user_chats/${id}/messages`,
  sendMessage: (id: string) => `/user_chats/${id}/send_message`,
  messageDrafts: (id: string) => `/user_chats/${id}/message_drafts`,
  ragStatus: "/user_chats/rag_status",
} as const
