"use client"

import * as React from "react"

interface OpenChatOptions {
  initialMessage?: string
  transactionId?: string
  transactionTitle?: string
  uploadId?: string
}

interface ChatWidgetContextValue {
  isOpen: boolean
  isClosing: boolean
  pendingMessage: string | null
  pendingTransactionId: string | null
  pendingTransactionTitle: string | null
  pendingUploadId: string | null
  handleOpen: (options?: OpenChatOptions) => void
  handleClose: () => void
  clearPendingMessage: () => void
}

const ChatWidgetContext = React.createContext<ChatWidgetContextValue | null>(null)

export function ChatWidgetProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isClosing, setIsClosing] = React.useState(false)
  const [pendingMessage, setPendingMessage] = React.useState<string | null>(null)
  const [pendingTransactionId, setPendingTransactionId] = React.useState<string | null>(null)
  const [pendingTransactionTitle, setPendingTransactionTitle] = React.useState<string | null>(null)
  const [pendingUploadId, setPendingUploadId] = React.useState<string | null>(null)
  const closeTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    }
  }, [])

  const handleOpen = React.useCallback((options?: OpenChatOptions) => {
    if (options?.initialMessage) {
      setPendingMessage(options.initialMessage)
    }
    if (options?.transactionId) {
      setPendingTransactionId(options.transactionId)
    }
    if (options?.transactionTitle) {
      setPendingTransactionTitle(options.transactionTitle)
    }
    if (options?.uploadId) {
      setPendingUploadId(options.uploadId)
    }
    setIsOpen(true)
  }, [])

  const handleClose = React.useCallback(() => {
    setIsClosing(true)
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
      setIsClosing(false)
    }, 700)
  }, [])

  const clearPendingMessage = React.useCallback(() => {
    setPendingMessage(null)
    setPendingTransactionId(null)
    setPendingTransactionTitle(null)
    setPendingUploadId(null)
  }, [])

  const value = React.useMemo(
    () => ({
      isOpen,
      isClosing,
      pendingMessage,
      pendingTransactionId,
      pendingTransactionTitle,
      pendingUploadId,
      handleOpen,
      handleClose,
      clearPendingMessage,
    }),
    [isOpen, isClosing, pendingMessage, pendingTransactionId, pendingTransactionTitle, pendingUploadId, handleOpen, handleClose, clearPendingMessage]
  )

  return (
    <ChatWidgetContext.Provider value={value}>
      {children}
    </ChatWidgetContext.Provider>
  )
}

export function useChatWidgetContext() {
  const context = React.useContext(ChatWidgetContext)
  if (!context) {
    throw new Error("useChatWidgetContext must be used within a ChatWidgetProvider")
  }
  return context
}
