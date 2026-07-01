import { apiClient } from "@/lib/api/client"
import {
  type MessageDraft,
  type MessageDraftSentVia,
} from "../types"

export interface MessageDraftResponse {
  id: string
  recipient_name: string
  recipient_email?: string
  recipient_phone?: string
  message_type: "email" | "sms"
  subject?: string
  body: string
  cc_emails?: string[]
  status: "pending" | "sent" | "cancelled"
  created_at: string
  updated_at: string
  user_chat_id?: string
  requires_confirmation?: boolean
  sent_via?: MessageDraftSentVia
  sent_at?: string
  transaction_id?: string
}

export interface SendDraftResponse {
  message: string
  sent_via?: MessageDraftSentVia
  chat_message_persisted?: boolean
  draft: MessageDraftResponse
}

export interface EditDraftPayload {
  recipient_name?: string
  recipient_email?: string
  recipient_phone?: string
  subject?: string
  body?: string
  message_type?: "email" | "sms"
}

const DRAFT_ENDPOINTS = {
  edit: (id: string) => `/message_drafts/${id}`,
  send: (id: string) => `/message_drafts/${id}/send_message`,
  delete: (id: string) => `/message_drafts/${id}`,
}

export function mapMessageDraftResponseToMessageDraft(r: MessageDraftResponse): MessageDraft {
  return {
    id: r.id,
    recipient: {
      name: r.recipient_name,
      email: r.recipient_email,
      phone: r.recipient_phone,
    },
    messageType: r.message_type,
    subject: r.subject,
    body: r.body,
    ccEmails: r.cc_emails,
    requiresConfirmation: r.requires_confirmation ?? true,
    status: r.status,
    sentVia: r.sent_via,
    sentAt: r.sent_at ? new Date(r.sent_at) : undefined,
    timestamp: new Date(r.created_at),
  }
}

export const draftService = {
  async editDraft(id: string, payload: EditDraftPayload): Promise<MessageDraftResponse> {
    const { data } = await apiClient.patch<MessageDraftResponse>(DRAFT_ENDPOINTS.edit(id), payload)
    return data
  },

  async sendDraft(id: string, payload?: { chat_id?: string | null }): Promise<SendDraftResponse> {
    const { data } = await apiClient.post<SendDraftResponse>(DRAFT_ENDPOINTS.send(id), payload)
    return data
  },

  async cancelDraft(id: string): Promise<void> {
    await apiClient.delete(DRAFT_ENDPOINTS.delete(id))
  },
}
