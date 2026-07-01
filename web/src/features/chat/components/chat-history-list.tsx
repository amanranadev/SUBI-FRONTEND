"use client"

import * as React from "react"
import { MessageSquareText, Plus, Trash2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { LoadingSpinner } from "@/shared/ui/loading-spinner"
import { ScrollArea } from "@/shared/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { BackendChatSummary } from "../api/chat-service"
import {
  isInternalCommandPayloadMessage,
  sanitizeChatDisplayText,
} from "../chat-message-sanitizer"

interface ChatHistoryListProps {
  chats: BackendChatSummary[]
  isLoading: boolean
  hasMore: boolean
  onSelectChat: (id: string) => void
  onNewChat: () => void
  onDeleteChat: (id: string) => void
  onLoadMore: () => void
}

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60_000)
  const diffHours = Math.floor(diffMs / 3_600_000)
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function getPreviewText(chat: BackendChatSummary): string {
  if (chat.last_message?.content) {
    const content = chat.last_message.content
    if (isInternalCommandPayloadMessage(content)) {
      return "Template selected. Continuing with your draft."
    }

    const visibleContent = sanitizeChatDisplayText(content)
    if (!visibleContent) return "No messages yet"

    const previewSource = visibleContent
      .replace(/\s+/g, " ")
      .trim()
    if (!previewSource) return "No messages yet"

    const contentToShow = previewSource.length > 80
      ? previewSource.slice(0, 80) + "..."
      : previewSource

    return contentToShow
  }
  return "No messages yet"
}

export function ChatHistoryList({
  chats,
  isLoading,
  hasMore,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onLoadMore,
}: ChatHistoryListProps) {
  const sentinelRef = React.useRef<HTMLDivElement>(null)
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const viewport = scrollRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]",
    )
    if (!viewport) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          onLoadMore()
        }
      },
      { root: viewport, rootMargin: "100px" },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, onLoadMore])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-black/5 px-6 py-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Conversations
        </span>
        <Button
          onClick={onNewChat}
          size="sm"
          className="h-8 gap-1.5 rounded-xl text-xs"
        >
          <Plus className="size-3.5" />
          New Chat
        </Button>
      </div>

      <ScrollArea ref={scrollRef} className="min-h-0 flex-1">
        <div className="flex flex-col gap-1 p-3">
          {isLoading && chats.length === 0 ? (
            <div className="flex flex-col gap-2 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl bg-black/[0.03] p-4">
                  <div className="mb-2 h-3.5 w-3/4 rounded-sm bg-black/[0.06]" />
                  <div className="h-3 w-full rounded-sm bg-black/[0.04]" />
                </div>
              ))}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-primary/10">
                <MessageSquareText className="size-5 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">No conversations yet</p>
                <p className="text-xs text-muted-foreground">
                  Start a new chat with SUBI to get going.
                </p>
              </div>
              <Button
                onClick={onNewChat}
                size="sm"
                className="mt-2 gap-1.5 rounded-xl"
              >
                <Plus className="size-3.5" />
                Start a conversation
              </Button>
            </div>
          ) : (
            <>
              {chats.map((chat) => (
                <ChatHistoryItem
                  key={chat.id}
                  chat={chat}
                  onSelect={() => onSelectChat(chat.id)}
                  onDelete={() => onDeleteChat(chat.id)}
                />
              ))}
              {hasMore && <div ref={sentinelRef} className="h-1" />}
              {isLoading && chats.length > 0 && (
                <div className="flex items-center justify-center py-3">
                  <LoadingSpinner size="md" className="text-muted-foreground" />
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function ChatHistoryItem({
  chat,
  onSelect,
  onDelete,
}: {
  chat: BackendChatSummary
  onSelect: () => void
  onDelete: () => void
}) {
  const preview = getPreviewText(chat)
  const isAssistantLast = chat.last_message?.role === "assistant"

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        "group relative w-full cursor-pointer rounded-2xl px-4 py-3 text-left transition-colors",
        "hover:bg-black/[0.04] active:bg-black/[0.06]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <MessageSquareText className="size-3.5 text-primary" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
              {chat.title}
            </span>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatRelativeTime(chat.updated_at)}
            </span>
          </div>
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-xs",
              isAssistantLast ? "text-muted-foreground" : "text-foreground/70",
            )}
          >
            {isAssistantLast && (
              <span className="font-medium text-primary/70">SUBI: </span>
            )}
            {preview}
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div className="min-h-6">
              {chat.message_count > 0 && (
                <span className="inline-block text-[10px] text-muted-foreground/70">
                  {chat.message_count} message{chat.message_count !== 1 ? "s" : ""}
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="flex size-6 shrink-0 items-center justify-center rounded-full opacity-0 transition-opacity hover:bg-destructive/10 group-hover:opacity-100 focus-visible:opacity-100"
              title="Delete chat"
            >
              <Trash2 className="size-3 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
