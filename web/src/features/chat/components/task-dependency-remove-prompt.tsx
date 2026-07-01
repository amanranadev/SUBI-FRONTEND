"use client"

import * as React from "react"
import { Link2Off, Loader2, X, AlertTriangle } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { cn } from "@/lib/utils"

export interface TaskDependencyRemovePromptProps {
  message: string
  childTaskName: string
  parentTaskName: string
  /** Child task id of the dependency being removed — empty disables confirm */
  childTaskId: string
  compact?: boolean
  /** Parent-controlled loading (e.g. WebSocket circular resolution) */
  loading?: boolean
  inlineError?: string | null
  confirmLabel?: string
  onConfirm: () => void | Promise<void>
  onDismiss: () => void
}

/**
 * Shared “Remove Task Dependency” shell (rose card, detail box, Confirm Removal / Cancel).
 * Used by server-driven removal confirmations and by the circular-dependency resolution prompt.
 */
export function TaskDependencyRemovePrompt({
  message,
  childTaskName,
  parentTaskName,
  childTaskId,
  compact,
  loading: externalLoading = false,
  inlineError,
  confirmLabel = "Confirm Removal",
  onConfirm,
  onDismiss,
}: TaskDependencyRemovePromptProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)
  const busy = isConfirming || externalLoading

  const handleConfirm = async () => {
    if (!childTaskId) return
    setIsConfirming(true)
    try {
      await onConfirm()
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-200 bg-rose-50/50 overflow-hidden",
        compact ? "text-sm" : "text-base",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-2.5 bg-rose-100/60 border-b border-rose-200">
        <Link2Off className="size-4 text-rose-700" />
        <span className="font-semibold text-rose-800">Remove Task Dependency</span>
      </div>

      <div className={cn("space-y-3", compact ? "p-3" : "p-4")}>
        <p className={cn("text-rose-800/80", compact ? "text-xs" : "text-sm")}>{message}</p>

        {(childTaskName || parentTaskName) && (
          <div className="rounded-lg border border-rose-200 bg-white/60 px-3 py-2 space-y-1">
            {childTaskName && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700/60 w-16 shrink-0">
                  Task
                </span>
                <span className={cn("font-medium text-rose-900", compact ? "text-xs" : "text-sm")}>
                  {childTaskName}
                </span>
              </div>
            )}
            {parentTaskName && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-700/60 w-16 shrink-0">
                  Depends on
                </span>
                <span className={cn("font-medium text-rose-900", compact ? "text-xs" : "text-sm")}>
                  {parentTaskName}
                </span>
              </div>
            )}
          </div>
        )}

        {inlineError && (
          <div
            className={cn(
              "flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive",
              compact ? "text-xs" : "text-sm",
            )}
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
            <span>{inlineError}</span>
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <Button
            onClick={handleConfirm}
            disabled={busy || !childTaskId}
            size="sm"
            className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            {busy ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Link2Off className="size-3.5" />
            )}
            {confirmLabel}
          </Button>

          <Button
            onClick={onDismiss}
            disabled={busy}
            variant="ghost"
            size="sm"
            className="gap-1.5 text-muted-foreground hover:text-destructive"
          >
            <X className="size-3.5" />
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}
