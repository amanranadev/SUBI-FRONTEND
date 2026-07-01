"use client"

import * as React from "react"
import { SendHorizontal } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { cn } from "@/lib/utils"

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  className?: string
}

export function ChatInput({ onSendMessage, isLoading, className }: ChatInputProps) {
  const [input, setInput] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim())
      setInput("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [input])

  return (
    <div className={cn("relative w-full max-w-3xl mx-auto px-4", className)}>
      <div className="glass-card relative flex items-end gap-2 rounded-[2.5rem] p-5 transition-all focus-within:ring-8 focus-within:ring-primary/5 shadow-[0_60px_120px_-30px_rgba(0,0,0,0.35)] hover:shadow-[0_70px_130px_-35px_rgba(0,0,0,0.4)] dark:shadow-[0_60px_120px_-30px_rgba(0,0,0,0.7)] border-white/40">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind?"
          className="min-h-[60px] max-h-[200px] w-full resize-none bg-transparent border-0 focus-visible:ring-0 px-6 py-5 text-[18px] placeholder:text-muted-foreground/40 leading-relaxed"
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className={cn(
            "h-16 w-16 shrink-0 rounded-[1.5rem] transition-all duration-300",
            "bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95"
          )}
        >
          <SendHorizontal className={cn("h-8 w-8", isLoading && "animate-pulse")} />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </div>
  )
}