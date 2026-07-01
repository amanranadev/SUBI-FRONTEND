"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/shared/ui/button"
import { Txt } from "@/shared/ui"
import type { TemplateSelectionRequest } from "../types"

interface TemplateSelectionCardProps {
  request: TemplateSelectionRequest
  onSelect: (requestId: string, templateId: string) => Promise<void>
  onDeleteTemplate: (requestId: string, templateId: string) => Promise<void>
  onCreateNewTemplate: (requestId: string) => Promise<void>
  onDismiss: (requestId: string) => void
}

export function TemplateSelectionCard({
  request,
  onSelect,
  onDeleteTemplate,
  onCreateNewTemplate,
  onDismiss,
}: TemplateSelectionCardProps) {
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string>("")
  const [isApplying, setIsApplying] = React.useState(false)
  const [deletingTemplateId, setDeletingTemplateId] = React.useState<string | null>(null)
  const [isCreatingNew, setIsCreatingNew] = React.useState(false)

  const handleApply = async () => {
    if (!selectedTemplateId) return
    setIsApplying(true)
    try {
      await onSelect(request.id, selectedTemplateId)
    } finally {
      setIsApplying(false)
    }
  }

  const handleDeleteTemplate = async (templateId: string) => {
    setDeletingTemplateId(templateId)
    try {
      await onDeleteTemplate(request.id, templateId)
      if (selectedTemplateId === templateId) setSelectedTemplateId("")
    } finally {
      setDeletingTemplateId(null)
    }
  }

  const handleCreateNew = async () => {
    setIsCreatingNew(true)
    try {
      await onCreateNewTemplate(request.id)
    } finally {
      setIsCreatingNew(false)
    }
  }

  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-3">
      <div className="space-y-1">
        <Txt as="p" size="sm" weight="semibold">
          Select a template
        </Txt>
        <Txt as="p" size="xs" tone="muted">
          {request.message}
        </Txt>
        {request.noMatchMessage ? (
          <Txt as="p" size="xs" tone="muted" className="text-amber-700">
            {request.noMatchMessage}
          </Txt>
        ) : null}
      </div>

      <div className="space-y-2">
        {request.templates.map((template) => (
          <div
            key={template.id}
            className="flex items-start gap-2 rounded-xl border border-black/10 bg-white p-3"
          >
            <input
              id={`template-selection-${request.id}-${template.id}`}
              type="radio"
              name={`template-selection-${request.id}`}
              value={template.id}
              checked={selectedTemplateId === template.id}
              onChange={() => setSelectedTemplateId(template.id)}
              className="mt-1"
            />
            <label
              htmlFor={`template-selection-${request.id}-${template.id}`}
              className="flex-1 cursor-pointer space-y-1"
            >
              <Txt as="p" size="sm" weight="semibold">
                {template.name}
              </Txt>
              {template.description ? (
                <Txt as="p" size="xs" tone="muted">
                  {template.description}
                </Txt>
              ) : null}
            </label>
            <Button
              size="icon"
              variant="ghost"
              className="size-7 text-muted-foreground hover:text-destructive"
              onClick={() => handleDeleteTemplate(template.id)}
              disabled={deletingTemplateId === template.id || isApplying || isCreatingNew}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" onClick={handleApply} disabled={!selectedTemplateId || isApplying}>
          {isApplying ? "Applying..." : "Use template"}
        </Button>
        {request.allowCreateNew ? (
          <Button size="sm" variant="outline" onClick={handleCreateNew} disabled={isCreatingNew || isApplying}>
            <Plus className="size-3.5" />
            {isCreatingNew ? "Creating..." : "Create new template"}
          </Button>
        ) : null}
        <Button size="sm" variant="ghost" onClick={() => onDismiss(request.id)} disabled={isApplying}>
          Dismiss
        </Button>
      </div>
    </div>
  )
}
