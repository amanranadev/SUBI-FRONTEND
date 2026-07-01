import type { BackendChatMessage } from "./api/chat-service"
import { mapBackendMessage, type Message } from "./types"

function isBackendRole(role: unknown): role is BackendChatMessage["role"] {
  return role === "user" || role === "assistant"
}

function isBackendChatMessage(value: unknown): value is BackendChatMessage {
  if (!value || typeof value !== "object") return false

  const candidate = value as {
    id?: unknown
    role?: unknown
    content?: unknown
    timestamp?: unknown
  }

  return (
    typeof candidate.id === "string" &&
    isBackendRole(candidate.role) &&
    typeof candidate.content === "string" &&
    typeof candidate.timestamp === "string"
  )
}

export function mapChatUpdatedMessages(rawMessages: Array<Record<string, unknown>>): Message[] {
  const deduped = new Map<string, BackendChatMessage>()

  rawMessages.forEach((candidate) => {
    if (!isBackendChatMessage(candidate)) return
    deduped.set(candidate.id, candidate)
  })

  return Array.from(deduped.values()).map(mapBackendMessage)
}
