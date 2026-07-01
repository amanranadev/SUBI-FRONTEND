"use client"

import * as React from "react"
import { Button } from "@/shared/ui/button"
import { Input } from "@/shared/ui/input"
import { Textarea } from "@/shared/ui/textarea"
import { Txt } from "@/shared/ui"
import type { EmailTemplateSource } from "@/features/settings/api/email-template-service"
import type { EmailTemplatePreview } from "../types"

interface TemplatePreviewCardProps {
  preview: EmailTemplatePreview
  onSave: (
    previewId: string,
    payload: { name: string; content: string; description?: string; source?: EmailTemplateSource },
  ) => Promise<void>
  onDismiss: (previewId: string) => void
}

export function TemplatePreviewCard({
  preview,
  onSave,
  onDismiss,
}: TemplatePreviewCardProps) {
  const [name, setName] = React.useState(preview.name)
  const [description, setDescription] = React.useState(preview.description ?? "")
  const [content, setContent] = React.useState(preview.content)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
    if (!name.trim() || !content.trim()) return
    setIsSaving(true)
    try {
      await onSave(preview.id, {
        name: name.trim(),
        content: content.trim(),
        description: description.trim() || undefined,
        source: preview.source,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="space-y-1">
        <Txt as="p" size="sm" weight="semibold">
          Generated template preview
        </Txt>
        <Txt as="p" size="xs" tone="muted">
          Edit if needed, then save to your template library.
        </Txt>
      </div>

      <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Template name" />
      <Input
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
      />
      <Textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={8}
        placeholder="Template content"
      />

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleSave} disabled={!name.trim() || !content.trim() || isSaving}>
          {isSaving ? "Saving..." : "Save template"}
        </Button>
        <Button size="sm" variant="ghost" onClick={() => onDismiss(preview.id)} disabled={isSaving}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
