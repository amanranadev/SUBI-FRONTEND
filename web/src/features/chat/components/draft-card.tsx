"use client"

import * as React from "react"
import { AlertTriangle, Ban, CheckCheck, Mail, MessageSquare, Send, Pencil, X } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { LoadingSpinner } from "@/shared/ui/loading-spinner"
import { cn } from "@/lib/utils"
import { DraftEditDialog } from "./draft-edit-dialog"
import {
  MESSAGE_DRAFT_SENT_VIA,
  MESSAGE_DRAFT_STATUS,
  type MessageDraft,
} from "../types"
import type { EditDraftPayload } from "../api/draft-service"

interface DraftCardProps {
  draft: MessageDraft
  onSend: (draftId: string) => Promise<void>
  onEdit?: (draftId: string, payload: EditDraftPayload) => Promise<void>
  onCancel: (draftId: string) => Promise<void>
  compact?: boolean
}

export function DraftCard({ draft, onSend, onEdit, onCancel, compact }: DraftCardProps) {
  const [isSending, setIsSending] = React.useState(false)
  const [isCancelling, setIsCancelling] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const handleSend = async () => {
    setIsSending(true)
    try {
      await onSend(draft.id)
    } finally {
      setIsSending(false)
    }
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    try {
      await onCancel(draft.id)
    } finally {
      setIsCancelling(false)
    }
  }

  const handleStartEdit = () => {
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async (payload: EditDraftPayload) => {
    if (!onEdit) return
    setIsSaving(true)
    try {
      await onEdit(draft.id, payload)
      setIsEditDialogOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  const isEmail = draft.messageType === "email"
  const Icon = isEmail ? Mail : MessageSquare
  const isBusy = isSending || isCancelling || isSaving
  const isSent = draft.status === MESSAGE_DRAFT_STATUS.SENT
  const isCancelled = draft.status === MESSAGE_DRAFT_STATUS.CANCELLED
  const isFailed = draft.status === MESSAGE_DRAFT_STATUS.FAILED
  const isReadOnly = isSent || isCancelled
  const sentLabel = draft.sentVia === MESSAGE_DRAFT_SENT_VIA.GMAIL
    ? "Sent via Gmail"
    : draft.sentVia === MESSAGE_DRAFT_SENT_VIA.SMS
      ? "Sent via Subi SMS"
      : "Sent via Subi"

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border border-primary/20 bg-primary/5 overflow-hidden",
          compact ? "text-sm" : "text-base",
        )}
      >
        <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 border-b border-primary/10">
          <Icon className="size-4 text-primary" />
          <span className="font-semibold text-primary">
            Draft {isEmail ? "Email" : "SMS"}
          </span>
          {isCancelled ? (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <Ban className="size-3.5 text-destructive/80" aria-hidden />
              Cancelled
            </span>
          ) : isFailed ? (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-destructive">
              <AlertTriangle className="size-3.5" aria-hidden />
              Send failed
            </span>
          ) : isSent ? (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <CheckCheck className="size-3.5 text-primary" aria-hidden />
              {sentLabel}
            </span>
          ) : draft.requiresConfirmation ? (
            <span className="ml-auto text-xs text-muted-foreground">
              Requires confirmation
            </span>
          ) : null}
        </div>

        <div className={cn("space-y-2", compact ? "p-3" : "p-4")}>
          <div className="space-y-1 text-sm">
            <div className="flex gap-2">
              <span className="font-medium text-muted-foreground w-12">To:</span>
              <span>
                {draft.recipient.name}
                {draft.recipient.email && (
                  <span className="text-muted-foreground ml-1">
                    ({draft.recipient.email})
                  </span>
                )}
                {draft.recipient.phone && !draft.recipient.email && (
                  <span className="text-muted-foreground ml-1">
                    ({draft.recipient.phone})
                  </span>
                )}
              </span>
            </div>

            {draft.ccEmails && draft.ccEmails.length > 0 && (
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-12">CC:</span>
                <span className="text-muted-foreground">
                  {draft.ccEmails.join(", ")}
                </span>
              </div>
            )}

            {draft.subject && (
              <div className="flex gap-2">
                <span className="font-medium text-muted-foreground w-12">Subj:</span>
                <span>{draft.subject}</span>
              </div>
            )}
          </div>

          <div
            className={cn(
              "whitespace-pre-wrap rounded-xl bg-white border border-border/50",
              compact ? "p-3 text-xs" : "p-4 text-sm",
            )}
          >
            {draft.body}
          </div>

          {isFailed && (
            <p className="text-xs text-destructive">
              Delivery was not confirmed. Review and try sending again.
            </p>
          )}

          {!isReadOnly && (
            <div className="flex items-center gap-2 pt-2">
              <Button
                onClick={handleSend}
                disabled={isBusy}
                size="sm"
                className="gap-1.5"
              >
                {isSending ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Send className="size-3.5" />
                )}
                Send
              </Button>

              {onEdit && (
                <Button
                  onClick={handleStartEdit}
                  disabled={isBusy}
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                >
                  <Pencil className="size-3.5" />
                  Edit
                </Button>
              )}

              <Button
                onClick={handleCancel}
                disabled={isBusy}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-destructive"
              >
                {isCancelling ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <X className="size-3.5" />
                )}
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      {onEdit ? (
        <DraftEditDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          draft={draft}
          isSaving={isSaving}
          onSave={handleSaveEdit}
        />
      ) : null}
    </>
  )
}
