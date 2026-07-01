import { chatService } from "./api/chat-service"
import { mapMessageDraftResponseToMessageDraft } from "./api/draft-service"
import { captureApiError } from "@/lib/sentry"
import type { MessageDraft } from "./types"

export async function fetchChatDraftsForHydration(chatId: string): Promise<MessageDraft[]> {
  try {
    const rows = await chatService.getMessageDrafts(chatId)
    return rows.map(mapMessageDraftResponseToMessageDraft)
  } catch (error) {
    captureApiError(error, {
      operation: "get:user_chats/message_drafts",
      path: `/user_chats/${chatId}/message_drafts`,
    })
    return []
  }
}
