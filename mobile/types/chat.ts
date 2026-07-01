// Core message types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string; // ISO 8601 format
}

// Complete chat conversation
export interface UserChat {
  id: string;
  title: string;
  status: 'active' | 'archived' | 'deleted';
  messages: ChatMessage[];
  message_count: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

// Request payloads
export interface CreateChatRequest {
  title?: string;
  initial_message?: string;
  transaction_id?: string;
}

export interface SendMessageRequest {
  message: string;
}

export interface UpdateChatRequest {
  title?: string;
  status?: 'active' | 'archived' | 'deleted';
}

// Message Draft types
export interface MessageDraft {
  id: string;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  message_type: 'email' | 'sms';
  subject?: string; // Only for email
  body: string;
  status: 'pending' | 'sent' | 'cancelled';
  recipient_type?: string;
  contact_id?: string;
  transaction_id?: string;
  created_at: string;
  expires_at?: string;
  cc_emails?: string[];
}

// WebSocket message types for ChatChannel
export interface ChatWebSocketMessage {
  type:
    | 'subscription_confirmed'
    | 'chat_updated'
    | 'typing_status'
    | 'ai_response_chunk'
    | 'streaming_update'
    | 'job_started'
    | 'job_completed'
    | 'job_failed'
    | 'message_draft_created'
    | 'error';
  chat_id?: string;
  messages?: ChatMessage[];
  last_message?: ChatMessage;
  is_typing?: boolean;
  chunk?: {
    chat_id?: string;
    chunk: string;
    chunk_index: number;
    full_response_so_far: string;
    is_final: boolean;
  };
  job_params?: {
    user_chat_id?: string;
    message?: string;
  };
  data?: {
    message: string;
    progress: number;
    stage: string;
  };
  job_id?: string;
  status?: string;
  error?: string;
  draft_id?: string;
  recipient?: {
    name: string;
    email?: string;
    phone?: string;
  };
  message_type?: 'email' | 'sms';
  subject?: string;
  body?: string;
  requires_confirmation?: boolean;
  cc_emails?: string[];
  timestamp?: string;
}

// API Response types
export interface ChatListResponse {
  data: UserChat[];
}

export interface ChatDetailResponse {
  data: UserChat;
}

export interface SendMessageResponse {
  message: ChatMessage;
}

export interface SendDraftResponse {
  success: boolean;
  message: string;
}
