"use client"

import { X, Plus, FileText, ChevronLeft } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { SubiTextLogo } from "@/shared/ui"

interface ChatWidgetHeaderProps {
  currentView?: "home" | "transactions" | "detail"
  transactionTitle?: string
  contextUploadId?: string | null
  onClose: () => void
  onNewChat?: () => void
  onBackToList?: () => void
}

export function ChatWidgetHeader({
  currentView,
  transactionTitle,
  contextUploadId,
  onClose,
  onNewChat,
  onBackToList,
}: ChatWidgetHeaderProps) {
  return (
    <div className="z-10 flex shrink-0 items-center gap-4 rounded-t-[3rem] border-b border-black/5 px-6 py-4 shadow-[0_4px_12px_rgba(0,0,0,0.05)] sm:rounded-t-[4rem] sm:px-8 sm:py-5">
      <Button
        variant="ghost"
        onClick={onClose}
        className="size-10 rounded-full hover:bg-black/5 hover:text-black"
      >
        <X />
      </Button>
      <div className="flex min-w-0 items-center gap-3">
        {onBackToList && (
          <Button
            variant="ghost"
            onClick={onBackToList}
            className="size-8 rounded-full hover:bg-black/5 hover:text-black"
            title="Back to conversations"
          >
            <ChevronLeft className="size-4" />
          </Button>
        )}
        <SubiTextLogo height={20} />
        {transactionTitle && (
          <div className="animate-in fade-in slide-in-from-left-2 flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-white px-3 py-1 shadow-xs duration-500">
            <span className="text-[8px] font-bold uppercase leading-none tracking-widest text-orange-600">
              Property
            </span>
            <span className="truncate text-[9px] font-bold leading-none text-foreground">
              {transactionTitle}
            </span>
          </div>
        )}
        {contextUploadId && (
          <div className="animate-in fade-in flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 duration-300">
            <FileText className="size-3 text-emerald-600" />
            <span className="text-[9px] font-semibold text-emerald-700">
              Scoped to this document
            </span>
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          onClick={onNewChat}
          className="size-8 rounded-full hover:bg-black/5 hover:text-black"
          title="New Chat"
        >
          <Plus className="size-4" />
        </Button>
      </div>
    </div>
  )
}
