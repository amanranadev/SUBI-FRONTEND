"use client"

import { cn } from "@/lib/utils"
import { Markdown } from "../lib/markdown"
import { SmsLinkCard, extractSmsLinkData } from "./sms-link-card"

interface ChatMessageProps {
  message: string
  isAi: boolean
  timestamp: Date
  compact?: boolean
}

export function ChatMessage({ message, isAi, timestamp, compact }: ChatMessageProps) {
  const smsLinkData = isAi ? extractSmsLinkData(message) : null

  return (
    <div
      className={cn(
        "flex w-full gap-3 py-2 px-1 transition-all message-in",
        isAi ? "flex-row" : "flex-row-reverse"
      )}
    >
      <div className={cn(
        "flex flex-col gap-1.5 max-w-[85%]",
        isAi ? "items-start" : "items-end"
      )}>
        <div className={cn(
          "flex items-center gap-2 px-2",
          isAi ? "flex-row" : "flex-row-reverse"
        )}>
          <span className={cn(
            "font-bold tracking-widest text-foreground/70 uppercase",
            compact ? "text-[8.5px]" : "text-[10px]"
          )}>
            {isAi ? "SUBI" : "You"}
          </span>
          <span className={cn(
            "text-muted-foreground uppercase tracking-widest font-medium opacity-50",
            compact ? "text-[7.5px]" : "text-[9px]"
          )}>
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        {smsLinkData ? (
          <SmsLinkCard data={smsLinkData} compact={compact} />
        ) : (
          <div className={cn(
            "leading-relaxed break-words tracking-tighter transition-all",
            compact
              ? "text-[14px] px-6 py-3.5 rounded-[2.25rem]"
              : "text-[17px] px-8 py-5 rounded-[2.75rem]",
            isAi
              ? "bg-primary/10 text-foreground rounded-tl-none border border-primary/10"
              : "bg-white text-foreground rounded-tr-none border border-white/60 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.35)]"
          )}>
            {isAi ? (
              <Markdown content={message} className="chat-markdown" />
            ) : (
              <span className="whitespace-pre-wrap">{message}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
