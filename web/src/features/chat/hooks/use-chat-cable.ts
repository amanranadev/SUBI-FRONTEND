"use client"

import * as React from "react"
import { authStorage } from "@/lib/auth/storage"
import { env } from "@/lib/env"
import { captureCableError } from "@/lib/sentry"
import { ActionCableClient, buildCableUrl } from "../lib/action-cable"
import type {
  EmailTemplatePreviewCreatedPayload,
  MessageDraftCreatedPayload,
  TemplateSelectionRequestedPayload,
  TaskDependencyClarificationPayload,
  TaskDependencyRemovalPayload,
  TaskDependencyCreationReadyPayload,
  TaskDependencyCircularResolutionErrorPayload,
} from "../types"
import type { CadetFillRequestedPayload } from "@/features/cadet/types"

const CHANNEL = "ChatChannel"

export interface StreamingChunk {
  chunk: string
  full_response_so_far: string
  chunk_index: number
  is_final: boolean
  chat_id?: string
  sources?: Array<{ page?: number | null; section?: string | null; excerpt?: string }>
}

export interface ChatUpdatedPayload {
  chat_id: string
  messages: Array<Record<string, unknown>>
  last_message: Record<string, unknown> | null
  updated_at: string
}

export interface TypingStatusPayload {
  chat_id: string
  is_typing: boolean
}

interface UseChatCableOptions {
  enabled?: boolean
  onStreamingChunk?: (chunk: StreamingChunk) => void
  onChatUpdated?: (payload: ChatUpdatedPayload) => void
  onTypingStatus?: (payload: TypingStatusPayload) => void
  onDraftCreated?: (payload: MessageDraftCreatedPayload) => void
  onTemplateSelectionRequested?: (payload: TemplateSelectionRequestedPayload) => void
  onTemplatePreviewCreated?: (payload: EmailTemplatePreviewCreatedPayload) => void
  onDependencyClarification?: (payload: TaskDependencyClarificationPayload) => void
  onDependencyRemovalConfirmation?: (payload: TaskDependencyRemovalPayload) => void
  onDependencyCreationReady?: (payload: TaskDependencyCreationReadyPayload) => void
  onCircularResolutionError?: (payload: TaskDependencyCircularResolutionErrorPayload) => void
  onCadetFillRequested?: (payload: CadetFillRequestedPayload) => void
  onConnected?: () => void
  onDisconnected?: () => void
}

export function useChatCable({
  enabled = true,
  onStreamingChunk,
  onChatUpdated,
  onTypingStatus,
  onDraftCreated,
  onTemplateSelectionRequested,
  onTemplatePreviewCreated,
  onDependencyClarification,
  onDependencyRemovalConfirmation,
  onDependencyCreationReady,
  onCircularResolutionError,
  onCadetFillRequested,
  onConnected,
  onDisconnected,
}: UseChatCableOptions = {}) {
  const clientRef = React.useRef<ActionCableClient | null>(null)
  const [isConnected, setIsConnected] = React.useState(false)

  const callbackRefs = React.useRef({
    onStreamingChunk,
    onChatUpdated,
    onTypingStatus,
    onDraftCreated,
    onTemplateSelectionRequested,
    onTemplatePreviewCreated,
    onDependencyClarification,
    onDependencyRemovalConfirmation,
    onDependencyCreationReady,
    onCircularResolutionError,
    onCadetFillRequested,
    onConnected,
    onDisconnected,
  })
  React.useEffect(() => {
    callbackRefs.current = {
      onStreamingChunk,
      onChatUpdated,
      onTypingStatus,
      onDraftCreated,
      onTemplateSelectionRequested,
      onTemplatePreviewCreated,
      onDependencyClarification,
      onDependencyRemovalConfirmation,
      onDependencyCreationReady,
      onCircularResolutionError,
      onCadetFillRequested,
      onConnected,
      onDisconnected,
    }
  })

  React.useEffect(() => {
    if (!enabled) return

    const token = authStorage.getToken()
    if (!token || !env.NEXT_PUBLIC_API_BASE_URL) return

    const cableUrl = buildCableUrl(env.NEXT_PUBLIC_API_BASE_URL, token)

    const client = new ActionCableClient(cableUrl, {
      onOpen: () => {
        setIsConnected(true)
        callbackRefs.current.onConnected?.()
      },
      onClose: () => {
        setIsConnected(false)
        callbackRefs.current.onDisconnected?.()
      },
      onReject: () => {
        captureCableError(new Error("ChatChannel subscription rejected"), {
          event: "subscribe-rejected",
          channel: CHANNEL,
        })
      },
    })

    client.connect()

    client.subscribe(CHANNEL, {}, (message) => {
      if (process.env.NODE_ENV === "development") {
        console.log("[ChatCable] WebSocket message:", message)
      }

      const type = message.type as string | undefined

      switch (type) {
        case "subscription_confirmed":
          break

        case "ai_response_chunk": {
          const chunk = message.chunk as StreamingChunk | undefined
          if (chunk) {
            callbackRefs.current.onStreamingChunk?.(chunk)
          } else {
            const directChunk = message as unknown as StreamingChunk
            if (directChunk.full_response_so_far !== undefined) {
              callbackRefs.current.onStreamingChunk?.(directChunk)
            }
          }
          break
        }

        case "streaming_update":
          // Progress updates (e.g. "retrieving_context") — can be used for UI indicators later
          break

        case "chat_updated": {
          callbackRefs.current.onChatUpdated?.(message as unknown as ChatUpdatedPayload)
          break
        }

        case "typing_status": {
          callbackRefs.current.onTypingStatus?.(message as unknown as TypingStatusPayload)
          break
        }

        case "message_draft_created": {
          callbackRefs.current.onDraftCreated?.(message as unknown as MessageDraftCreatedPayload)
          break
        }

        case "template_selection_requested": {
          callbackRefs.current.onTemplateSelectionRequested?.(
            message as unknown as TemplateSelectionRequestedPayload,
          )
          break
        }

        case "email_template_preview_created": {
          callbackRefs.current.onTemplatePreviewCreated?.(
            message as unknown as EmailTemplatePreviewCreatedPayload,
          )
          break
        }

        case "task_dependency_clarification": {
          // ActionCable unwraps the frame before the callback — message IS the payload.
          callbackRefs.current.onDependencyClarification?.(
            message as unknown as TaskDependencyClarificationPayload,
          )
          break
        }

        case "task_dependency_removal_confirmation": {
          callbackRefs.current.onDependencyRemovalConfirmation?.(
            message as unknown as TaskDependencyRemovalPayload,
          )
          break
        }

        case "task_dependency_creation_ready": {
          callbackRefs.current.onDependencyCreationReady?.(
            message as unknown as TaskDependencyCreationReadyPayload,
          )
          break
        }

        case "task_dependency_circular_resolution_error": {
          callbackRefs.current.onCircularResolutionError?.(
            message as unknown as TaskDependencyCircularResolutionErrorPayload,
          )
          break
        }

        case "cadet_fill_requested": {
          callbackRefs.current.onCadetFillRequested?.(
            message as unknown as CadetFillRequestedPayload,
          )
          break
        }

        case "job_started":
        case "job_completed":
        case "job_failed":
          break

        default:
          break
      }
    })

    clientRef.current = client

    return () => {
      client.disconnect()
      clientRef.current = null
      setIsConnected(false)
    }
  }, [enabled])

  const sendCableMessage = React.useCallback((data: Record<string, unknown>) => {
    clientRef.current?.send(CHANNEL, {}, data)
  }, [])

  return { isConnected, sendCableMessage }
}
