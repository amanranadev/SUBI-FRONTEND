import type { BackendChatMessage } from "./api/chat-service"
import { isInternalCommandPayloadMessage, sanitizeChatDisplayText } from "./chat-message-sanitizer"

export interface Message {
  id: string
  text: string
  isAi: boolean
  timestamp: Date
  isSpecial?: boolean
  hidden?: boolean
  sources?: Array<{ page?: number | null; section?: string | null; excerpt?: string }>
  draft?: MessageDraft
}

export type { BackendChatMessage }

export function mapBackendMessage(msg: BackendChatMessage): Message {
  const sanitizedText = sanitizeChatDisplayText(msg.content)
  const hidden = isInternalCommandPayloadMessage(msg.content)

  return {
    id: msg.id,
    text: sanitizedText,
    isAi: msg.role === "assistant",
    timestamp: new Date(msg.timestamp),
    hidden,
    sources: msg.sources,
  }
}

export interface DraftRecipient {
  name: string
  email?: string
  phone?: string
}

export const MESSAGE_DRAFT_STATUS = {
  PENDING: "pending",
  SENT: "sent",
  CANCELLED: "cancelled",
  FAILED: "failed",
} as const

export type MessageDraftStatus = (typeof MESSAGE_DRAFT_STATUS)[keyof typeof MESSAGE_DRAFT_STATUS]

export const MESSAGE_DRAFT_SENT_VIA = {
  GMAIL: "gmail",
  MAILER: "mailer",
  SMS: "sms",
} as const

export type MessageDraftSentVia = (typeof MESSAGE_DRAFT_SENT_VIA)[keyof typeof MESSAGE_DRAFT_SENT_VIA]

export interface MessageDraft {
  id: string
  recipient: DraftRecipient
  messageType: "email" | "sms"
  subject?: string
  body: string
  ccEmails?: string[]
  requiresConfirmation: boolean
  status?: MessageDraftStatus
  sentVia?: MessageDraftSentVia
  sentAt?: Date
  timestamp: Date
}

export interface MessageDraftCreatedPayload {
  type: "message_draft_created"
  draft_id: string
  chat_id?: string
  recipient: {
    name: string
    email?: string
    phone?: string
  }
  message_type: "email" | "sms"
  subject?: string
  body: string
  requires_confirmation: boolean
  timestamp: string
  cc_emails?: string[]
}

export function mapDraftPayload(payload: MessageDraftCreatedPayload): MessageDraft {
  return {
    id: payload.draft_id,
    recipient: payload.recipient,
    messageType: payload.message_type,
    subject: payload.subject,
    body: payload.body,
    ccEmails: payload.cc_emails,
    requiresConfirmation: payload.requires_confirmation,
    status: MESSAGE_DRAFT_STATUS.PENDING,
    timestamp: new Date(payload.timestamp),
  }
}

export interface TemplatePickerOption {
  id: string
  name: string
  description?: string | null
  source?: "manual" | "ai_chat" | "ai_document"
}

export interface TemplateSelectionRequestedPayload {
  type: "template_selection_requested"
  request_id: string
  chat_id?: string
  prompt_text?: string
  message?: string
  allow_create_new?: boolean
  no_match_message?: string
  templates: TemplatePickerOption[]
  timestamp: string
}

export interface TemplateSelectionRequest {
  id: string
  chatId?: string
  promptText: string
  message: string
  allowCreateNew: boolean
  noMatchMessage?: string
  templates: TemplatePickerOption[]
  timestamp: Date
}

export function mapTemplateSelectionPayload(
  payload: TemplateSelectionRequestedPayload,
): TemplateSelectionRequest {
  return {
    id: payload.request_id,
    chatId: payload.chat_id,
    promptText: payload.prompt_text ?? "",
    message: payload.message ?? "Select a template to continue.",
    allowCreateNew: payload.allow_create_new ?? true,
    noMatchMessage: payload.no_match_message,
    templates: payload.templates ?? [],
    timestamp: new Date(payload.timestamp),
  }
}

export interface EmailTemplatePreviewCreatedPayload {
  type: "email_template_preview_created"
  preview_id: string
  chat_id?: string
  name: string
  description?: string | null
  content: string
  source: "manual" | "ai_chat" | "ai_document"
  instruction_text?: string
  timestamp: string
}

export interface EmailTemplatePreview {
  id: string
  chatId?: string
  name: string
  description?: string
  content: string
  source: "manual" | "ai_chat" | "ai_document"
  instructionText?: string
  timestamp: Date
}

export function mapTemplatePreviewPayload(
  payload: EmailTemplatePreviewCreatedPayload,
): EmailTemplatePreview {
  return {
    id: payload.preview_id,
    chatId: payload.chat_id,
    name: payload.name,
    description: payload.description ?? undefined,
    content: payload.content,
    source: payload.source,
    instructionText: payload.instruction_text,
    timestamp: new Date(payload.timestamp),
  }
}

// ── Task Dependency Clarification ────────────────────────────────────────────

export interface ConflictingDependency {
  child_task_id: string
  child_task_name: string
  parent_task_id: string
  parent_task_name: string
}

export interface TaskDependencyOption {
  label?: string
  child_task_id?: string
  child_task_name?: string
  parent_task_id?: string
  parent_task_name?: string
  days_after_parent?: number
  would_be_circular?: boolean
  self_referential?: boolean
  conflicting_dependency?: ConflictingDependency
  already_has_this_dependency?: boolean
  existing_days_after_parent?: number | null
}

export interface TaskDependencyClarificationPayload {
  type: "task_dependency_clarification"
  chat_id?: string
  clarification_message?: string
  days_after_parent?: number
  transaction_id?: string
  timestamp?: string
  options?: TaskDependencyOption[]
  preferred_option_index?: number | null
}

/** Frontend model stored in pendingDependencies state */
export interface TaskDependencyClarification {
  id: string // unique key derived from timestamp + transaction_id
  clarificationMessage: string
  daysAfterParent?: number
  transactionId?: string
  options: TaskDependencyOption[]
  timestamp: Date
  preferredOptionIndex?: number | null
  circularResolutionLoading?: boolean
  circularResolutionError?: string | null
}

export function mapDependencyPayload(
  payload: TaskDependencyClarificationPayload,
): TaskDependencyClarification {
  const transactionId = payload.transaction_id ?? "unknown-transaction"
  const timestamp = payload.timestamp ?? new Date().toISOString()

  return {
    id: `${transactionId}-${timestamp}`,
    clarificationMessage:
      payload.clarification_message ??
      "Please confirm the dependency order between these tasks.",
    daysAfterParent: payload.days_after_parent,
    transactionId: payload.transaction_id,
    options: payload.options ?? [],
    timestamp: new Date(timestamp),
    preferredOptionIndex: payload.preferred_option_index ?? null,
  }
}

// ── Task Dependency Removal Confirmation ─────────────────────────────────────

export interface TaskDependencyRemovalPayload {
  type: "task_dependency_removal_confirmation"
  chat_id?: string
  message?: string
  child_task_id?: string
  child_task_name?: string
  parent_task_id?: string
  parent_task_name?: string
  transaction_id?: string
  timestamp?: string
}

/** Frontend model stored in pendingRemovals state */
export interface TaskDependencyRemoval {
  id: string
  message: string
  childTaskId: string
  childTaskName: string
  parentTaskId: string
  parentTaskName: string
  transactionId?: string
  timestamp: Date
}

export function mapRemovalPayload(
  payload: TaskDependencyRemovalPayload,
): TaskDependencyRemoval {
  const transactionId = payload.transaction_id ?? "unknown-transaction"
  const timestamp = payload.timestamp ?? new Date().toISOString()

  return {
    id: `removal-${transactionId}-${timestamp}`,
    message: payload.message ?? "Remove this task dependency?",
    childTaskId: payload.child_task_id ?? "",
    childTaskName: payload.child_task_name ?? "",
    parentTaskId: payload.parent_task_id ?? "",
    parentTaskName: payload.parent_task_name ?? "",
    transactionId: payload.transaction_id,
    timestamp: new Date(timestamp),
  }
}

// ── Task Dependency Creation Ready ────────────────────────────────────────────

export interface TaskDependencyCreationReadyPayload {
  type: "task_dependency_creation_ready"
  message: string
  child_task_id: string
  child_task_name: string
  parent_task_id: string
  parent_task_name: string
  days_after_parent: number
  resolved_conflict: {
    removed_child_task_id: string
    removed_child_task_name: string
  }
  timestamp: string
}

/**
 * After circular resolution, the server sends `task_dependency_creation_ready`.
 * We turn it into a normal clarification row with one safe option so the user gets
 * the same dropdown “create dependency” UI as a fresh clarification.
 */
export function mapCreationReadyToClarification(
  payload: TaskDependencyCreationReadyPayload,
): TaskDependencyClarification {
  const timestamp = payload.timestamp ?? new Date().toISOString()
  const removedName = payload.resolved_conflict.removed_child_task_name

  const clarificationMessage = [
    payload.message?.trim() || "Existing dependency removed.",
    `Cleared: "${removedName}" dependency was removed.`,
    "Confirm the new dependency below.",
  ]
    .filter((line) => line.length > 0)
    .join("\n\n")

  return {
    id: `post-circular-${payload.child_task_id}-${timestamp}`,
    clarificationMessage,
    daysAfterParent: payload.days_after_parent,
    transactionId: undefined,
    options: [
      {
        child_task_id: payload.child_task_id,
        child_task_name: payload.child_task_name,
        parent_task_id: payload.parent_task_id,
        parent_task_name: payload.parent_task_name,
        days_after_parent: payload.days_after_parent,
        would_be_circular: false,
        already_has_this_dependency: false,
        self_referential: false,
        conflicting_dependency: undefined,
        existing_days_after_parent: null,
      },
    ],
    timestamp: new Date(timestamp),
  }
}

// ── Task Dependency Circular Resolution Error ─────────────────────────────────

export interface TaskDependencyCircularResolutionErrorPayload {
  type: "task_dependency_circular_resolution_error"
  error: string
  timestamp: string
}
