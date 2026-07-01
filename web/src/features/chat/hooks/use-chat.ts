"use client"

import * as React from "react"
import { useToast } from "@/shared/hooks/use-toast"
import { chatService } from "../api/chat-service"
import type { CreateChatParams, BackendChatSummary } from "../api/chat-service"
import { useChatCable } from "./use-chat-cable"
import type { StreamingChunk, ChatUpdatedPayload, TypingStatusPayload } from "./use-chat-cable"
import type { Message } from "../types"
import type { BackendChatMessage } from "../api/chat-service"
import {
  mapBackendMessage,
  mapDraftPayload,
  mapDependencyPayload,
  mapRemovalPayload,
  mapCreationReadyToClarification,
  mapTemplateSelectionPayload,
  mapTemplatePreviewPayload,
} from "../types"
import { sanitizeChatDisplayText } from "../chat-message-sanitizer"
import { fetchChatDraftsForHydration } from "../draft-chat-hydration"
import { mapChatUpdatedMessages } from "../chat-updated-message-sync"
import { addBreadcrumb, captureApiError } from "@/lib/sentry"

import { useChatHistory } from "./use-chat-history"
import { useChatList } from "./use-chat-list"
import { useChatFlows } from "./use-chat-flows"
import { useCadetFillRunner } from "@/features/cadet/hooks/use-cadet-fill-runner"
import { useCadetActionRunner } from "@/features/cadet/hooks/use-cadet-action-runner"
import { isCadetPinpointPhrase } from "@/features/cadet/lib/parse-pinpoint-phrase"
import { resolveCadetPhrase } from "@/features/cadet/api/cadet-resolve-service"
import { resolveCadetActionPhrase } from "@/features/cadet/api/cadet-action-resolve-service"
import { isCadetExtensionConfigured } from "@/features/cadet/lib/cadet-extension-bridge"

type SendMessageInput =
  | string
  | {
    text?: string
    displayText?: string
    hideUserBubble?: boolean
  }

const RESPONSE_POLL_INTERVAL_MS = 2500
const RESPONSE_POLL_TIMEOUT_MS = 45000

function getLatestAssistantMessageId(messages: Array<Pick<Message, "id" | "isAi">>): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.isAi) return messages[i].id
  }
  return null
}

function getLatestAssistantMessageIdFromBackend(messages: BackendChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "assistant") return messages[i].id
  }
  return null
}

export function useChat() {
  const [chatId, setChatId] = React.useState<string | null>(null)
  const [input, setInput] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isInitializing, setIsInitializing] = React.useState(false)
  const [streamingText, setStreamingText] = React.useState<string | null>(null)
  const [contextUploadId, setContextUploadId] = React.useState<string | null>(null)
  const [contextTransactionId, setContextTransactionId] = React.useState<string | null>(null)

  const { toast } = useToast()
  
  const history = useChatHistory()
  const list = useChatList((id) => {
    if (chatId === id) clearActiveChat()
  })

  // Ref-based state for cable handlers to avoid stale closures
  const chatIdRef = React.useRef(chatId)
  React.useEffect(() => { chatIdRef.current = chatId }, [chatId])

  const contextTransactionIdRef = React.useRef(contextTransactionId)
  React.useEffect(() => { contextTransactionIdRef.current = contextTransactionId }, [contextTransactionId])

  const responseWaitRef = React.useRef<{
    chatId: string
    baselineAssistantId: string | null
    startedAt: number
  } | null>(null)

  const clearResponseWait = React.useCallback(() => {
    responseWaitRef.current = null
  }, [])

  const syncChatMessagesFromBackend = React.useCallback(async (id: string) => {
    const chat = await chatService.getChat(id)
    const mapped = chat.messages.map(mapBackendMessage)
    if (mapped.length > 0) {
      history.setMessages(mapped)
    }
    return mapped
  }, [history])

  const appendMessage = React.useCallback((message: Message) => {
    history.setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev
      return [...prev, message]
    })
  }, [history])

  const {
    pendingCadetFills,
    enqueueCadetFill,
    retryCadetFill,
    clearCadetFills,
    clearCompletedCadetFills,
  } = useCadetFillRunner()

  const {
    pendingCadetActions,
    enqueueCadetAction,
    retryCadetAction,
    clearCadetActions,
    clearCompletedCadetActions,
  } = useCadetActionRunner()

  const enqueueCadetFillRef = React.useRef(enqueueCadetFill)
  const enqueueCadetActionRef = React.useRef(enqueueCadetAction)
  const clearCompletedCadetFillsRef = React.useRef(clearCompletedCadetFills)
  const clearCompletedCadetActionsRef = React.useRef(clearCompletedCadetActions)
  React.useEffect(() => {
    enqueueCadetFillRef.current = enqueueCadetFill
    enqueueCadetActionRef.current = enqueueCadetAction
    clearCompletedCadetFillsRef.current = clearCompletedCadetFills
    clearCompletedCadetActionsRef.current = clearCompletedCadetActions
  }, [enqueueCadetFill, enqueueCadetAction, clearCompletedCadetFills, clearCompletedCadetActions])

  // Define sendMessage before flows
  const sendMessage = React.useCallback(
    async (payload?: SendMessageInput) => {
      const options = typeof payload === "string" ? { text: payload } : (payload ?? {})
      const messageText = options.text ?? input.trim()
      if (!messageText || isLoading || !chatId) return

      addBreadcrumb("chat", "User sent a message", { operation: "post:chats/send_message", chatId })

      if (!options.hideUserBubble) {
        const visibleText = sanitizeChatDisplayText(options.displayText ?? messageText)
        if (visibleText) {
          const userMessage: Message = { id: `user-${Date.now()}`, text: visibleText, isAi: false, timestamp: new Date() }
          history.setMessages((prev) => [...prev, userMessage])
        }
      }
      setInput("")
      setIsLoading(true)
      setStreamingText(null)

      if (isCadetPinpointPhrase(messageText)) {
        void resolveCadetPhrase(messageText, contextTransactionIdRef.current)
          .then((resolved) => {
            if (!resolved) return
            enqueueCadetFillRef.current({
              type: "cadet_fill_requested",
              chat_id: chatId,
              transaction_id: resolved.transaction_id,
              cadet_command: resolved.cadet_command,
              address: resolved.address,
              platform: resolved.platform,
              timestamp: new Date().toISOString(),
            })
          })
          .catch(() => {})
      } else {
        clearCompletedCadetFillsRef.current()
        clearCompletedCadetActionsRef.current()
        if (isCadetExtensionConfigured()) {
          void resolveCadetActionPhrase(messageText)
            .then((resolved) => {
              if (!resolved) return
              enqueueCadetActionRef.current(
                {
                  type: "cadet_action_requested",
                  chat_id: chatId,
                  action_id: resolved.action_id,
                  action_name: resolved.name,
                  trigger_phrase: resolved.trigger_phrase,
                  platform: resolved.platform,
                  timestamp: new Date().toISOString(),
                },
                messageText,
              )
            })
            .catch(() => {})
        }
      }

      responseWaitRef.current = {
        chatId,
        baselineAssistantId: getLatestAssistantMessageId(history.messages),
        startedAt: Date.now(),
      }

      try {
        await chatService.sendMessage(chatId, messageText)
      } catch (error) {
        clearResponseWait()
        captureApiError(error, { operation: "post:chats/send_message", method: "POST", path: "/user_chats/:id/send_message" })
        setIsLoading(false)
        toast({ variant: "destructive", title: "Connection Error", description: "SUBI is having trouble connecting." })
      }
    },
    [input, isLoading, chatId, toast, history, clearResponseWait]
  )

  // HTTP fallback while waiting for WebSocket completion (matches mobile chat behavior).
  React.useEffect(() => {
    if (!isLoading || !chatId) return

    let cancelled = false
    let pollInFlight = false

    const pollForCompletion = async () => {
      const waitState = responseWaitRef.current
      if (cancelled || pollInFlight || !waitState || waitState.chatId !== chatId) return

      if (Date.now() - waitState.startedAt >= RESPONSE_POLL_TIMEOUT_MS) {
        clearResponseWait()
        setIsLoading(false)
        setStreamingText(null)
        toast({
          variant: "destructive",
          title: "Response timed out",
          description: "No completion was received. Please try again.",
        })
        return
      }

      pollInFlight = true
      try {
        const chat = await chatService.getChat(chatId)
        if (cancelled) return

        const latestAssistantId = getLatestAssistantMessageIdFromBackend(chat.messages)
        if (latestAssistantId && latestAssistantId !== waitState.baselineAssistantId) {
          history.setMessages(chat.messages.map(mapBackendMessage))
          clearResponseWait()
          setIsLoading(false)
          setStreamingText(null)
        }
      } catch {
        // Retry on the next interval.
      } finally {
        pollInFlight = false
      }
    }

    void pollForCompletion()
    const intervalId = window.setInterval(() => {
      void pollForCompletion()
    }, RESPONSE_POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [isLoading, chatId, history, toast, clearResponseWait])

  const flows = useChatFlows(chatId, appendMessage, sendMessage)

  const handleStreamingChunk = React.useCallback((chunk: StreamingChunk) => {
    if (chatIdRef.current && chunk.chat_id && chunk.chat_id !== chatIdRef.current) return
    if (chunk.is_final) {
      setStreamingText(null)
      clearResponseWait()
      setIsLoading(false)
      if (chatIdRef.current) {
        void syncChatMessagesFromBackend(chatIdRef.current)
      } else {
        history.setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, text: chunk.full_response_so_far, isAi: true, timestamp: new Date(), sources: chunk.sources }])
      }
    } else {
      setStreamingText(chunk.full_response_so_far)
    }
  }, [history, clearResponseWait, syncChatMessagesFromBackend])

  const { isConnected, sendCableMessage } = useChatCable({
    enabled: true,
    onStreamingChunk: handleStreamingChunk,
    onChatUpdated: (p: ChatUpdatedPayload) => {
      list.updateChatListItem(p.chat_id, p.last_message as BackendChatSummary["last_message"], p.updated_at)
      if (chatIdRef.current && String(p.chat_id) === String(chatIdRef.current)) {
        const mappedMessages = mapChatUpdatedMessages(p.messages)
        if (mappedMessages.length > 0) {
          history.setMessages(mappedMessages)
        } else if (chatIdRef.current) {
          void syncChatMessagesFromBackend(chatIdRef.current)
        }
        clearResponseWait()
        setStreamingText(null)
        setIsLoading(false)
      }
    },
    onTypingStatus: (p: TypingStatusPayload) => {
      if (chatIdRef.current && String(p.chat_id) !== String(chatIdRef.current)) return
      if (!p.is_typing) {
        setIsLoading((prev) => {
          if (!prev || streamingText) return prev
          clearResponseWait()
          return false
        })
      }
    },
    onDraftCreated: (p) => {
      if (chatIdRef.current && p.chat_id && p.chat_id !== chatIdRef.current) return
      const d = mapDraftPayload(p)
      flows.setPendingDrafts((prev) => (prev.some((x) => x.id === d.id) ? prev : [...prev, d]))
      setIsLoading(false)
      toast({ title: "Draft Created", description: `A draft ${d.messageType} has been created.` })
    },
    onTemplateSelectionRequested: (p) => {
      if (chatIdRef.current && p.chat_id && p.chat_id !== chatIdRef.current) return
      flows.setPendingTemplateSelections((prev) => [...prev, mapTemplateSelectionPayload(p)])
      setIsLoading(false)
    },
    onTemplatePreviewCreated: (p) => {
      if (chatIdRef.current && p.chat_id && p.chat_id !== chatIdRef.current) return
      flows.setPendingTemplatePreviews((prev) => [...prev, mapTemplatePreviewPayload(p)])
      setIsLoading(false)
    },
    onDependencyClarification: (p) => {
      if (chatIdRef.current && p.chat_id && p.chat_id !== chatIdRef.current) return
      if (contextTransactionIdRef.current && p.transaction_id && p.transaction_id !== contextTransactionIdRef.current) return
      flows.setPendingDependencies((prev) => [...prev, mapDependencyPayload(p)])
      setIsLoading(false)
      toast({ title: "Task Dependency Clarification", description: p.clarification_message ?? "Please review dependency details." })
    },
    onDependencyRemovalConfirmation: (p) => {
      if (chatIdRef.current && p.chat_id && p.chat_id !== chatIdRef.current) return
      if (contextTransactionIdRef.current && p.transaction_id && p.transaction_id !== contextTransactionIdRef.current) return
      flows.setPendingRemovals((prev) => [...prev, mapRemovalPayload(p)])
      setIsLoading(false)
      toast({ title: "Task Dependency Removal", description: p.message ?? "Please confirm removal." })
    },
    onDependencyCreationReady: (p) => {
      let applied = false
      flows.setPendingDependencies((prev) => {
        if (!prev.some(d => d.circularResolutionLoading)) return prev
        applied = true
        return [...prev.filter(d => !d.circularResolutionLoading), mapCreationReadyToClarification(p)]
      })
      if (applied) {
        setIsLoading(false)
        toast({ title: "Ready to set dependency", description: "Review and confirm." })
      }
    },
    onCircularResolutionError: (p) => {
      flows.setPendingDependencies((prev) => prev.map(d => d.circularResolutionLoading ? { ...d, circularResolutionLoading: false, circularResolutionError: p.error } : d))
    },
    onCadetFillRequested: (p) => {
      if (chatIdRef.current && p.chat_id && String(p.chat_id) !== String(chatIdRef.current)) return
      clearResponseWait()
      setIsLoading(false)
      enqueueCadetFill(p)
    },
  })

  const openChat = React.useCallback(async (id: string) => {
    setIsInitializing(true)
    history.resetHistory()
    setStreamingText(null)
    flows.resetFlows()
    clearCadetFills()
    clearCadetActions()
    setInput("")

    try {
      const chat = await chatService.getChat(id)
      setChatId(chat.id)
      setContextUploadId(chat.context_upload_id)
      setContextTransactionId(chat.context_transaction_id)
      await history.loadInitialMessages(id)
      const drafts = await fetchChatDraftsForHydration(id)
      flows.setPendingDrafts(drafts)
    } catch (error) {
      captureApiError(error, { operation: "get:user_chats/show", path: `/user_chats/${id}` })
      toast({ variant: "destructive", title: "Error", description: "Could not load conversation." })
    } finally {
      setIsInitializing(false)
    }
  }, [history, flows, toast, clearCadetFills, clearCadetActions])

  const createNewChat = React.useCallback(async (params: CreateChatParams = {}) => {
    setIsInitializing(true)
    history.resetHistory()
    setStreamingText(null)
    flows.resetFlows()
    clearCadetFills()
    clearCadetActions()
    setInput("")

    try {
      const chat = await chatService.createChat({
        title: params.title ?? "New Chat",
        transaction_id: params.transaction_id,
        upload_id: params.upload_id,
        initial_message: params.initial_message,
      })
      setChatId(chat.id)
      setContextUploadId(chat.context_upload_id)
      setContextTransactionId(chat.context_transaction_id)
      if (chat.messages.length > 0) {
        const mapped = chat.messages.map(mapBackendMessage)
        history.setMessages(mapped)
        const drafts = await fetchChatDraftsForHydration(chat.id)
        flows.setPendingDrafts(drafts)
      }
      list.refreshChatList()
      return chat.id
    } catch (error) {
      captureApiError(error, { operation: "post:user_chats", path: "/user_chats" })
      toast({ variant: "destructive", title: "Connection Error", description: "Could not start chat session." })
      return null
    } finally {
      setIsInitializing(false)
    }
  }, [history, flows, list, toast, clearCadetFills, clearCadetActions])

  const clearActiveChat = React.useCallback(() => {
    setChatId(null)
    history.resetHistory()
    setStreamingText(null)
    setIsLoading(false)
    flows.resetFlows()
    clearCadetFills()
    clearCadetActions()
    setContextUploadId(null)
    setContextTransactionId(null)
    setInput("")
  }, [history, flows, clearCadetFills, clearCadetActions])

  const loadOlderMessages = React.useCallback(() => {
    return history.loadOlderMessages(chatId)
  }, [chatId, history])

  const applyTemplateSelection = React.useCallback((requestId: string, templateId: string) => {
    return flows.applyTemplateSelection(requestId, templateId, history.messages)
  }, [flows, history.messages])

  const resolveCircularDependency = React.useCallback((
    depId: string,
    childId: string,
    parentId: string,
    days: number,
    confId: string
  ) => {
    flows.setPendingDependencies((prev) =>
      prev.map((d) => (d.id === depId ? { ...d, circularResolutionLoading: true, circularResolutionError: null } : d))
    )
    sendCableMessage({
      type: "resolve_circular_dependency",
      child_task_id: childId,
      parent_task_id: parentId,
      days_after_parent: days,
      conflicting_child_task_id: confId,
    })
  }, [flows, sendCableMessage])

  return {
    // State
    chatId,
    input,
    setInput,
    isLoading,
    isInitializing,
    isConnected,
    streamingText,
    contextUploadId,

    // Sub-hook State & Methods
    ...history,
    ...list,
    ...flows,
    pendingCadetFills,
    retryCadetFill,
    pendingCadetActions,
    retryCadetAction,

    // Overridden/Orchestrated Methods
    openChat,
    createNewChat,
    sendMessage,
    clearActiveChat,
    appendMessage,
    loadOlderMessages,
    applyTemplateSelection,
    resolveCircularDependency,
  }
}
