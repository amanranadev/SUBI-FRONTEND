"use client"

import { format } from "date-fns"
import { GripVertical, Trash2 } from "lucide-react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { cn } from "@/lib/utils"

type TransactionNoteCardProps = {
  id: string
  text: string
  createdAt: string
  isEditing: boolean
  editText: string
  onEditTextChange: (text: string) => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}

export function TransactionNoteCard({
  id,
  text,
  createdAt,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: TransactionNoteCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled: isEditing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group glass-card rounded-[2rem] p-6 flex items-start gap-5 hover:bg-black/[0.01]",
        isDragging && "opacity-50 scale-[0.98] shadow-none z-50 relative",
        isEditing && "bg-black/[0.02] border-black/5",
      )}
    >
      <button
        type="button"
        className="mt-1 cursor-grab active:cursor-grabbing opacity-20 hover:opacity-60 transition-opacity touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-5" />
      </button>

      <div className="flex-1 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">
            {format(new Date(createdAt), "MMMM do, yyyy")}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="h-12 w-12 rounded-xl hover:bg-destructive/10 text-destructive flex items-center justify-center transition-all"
          >
            <Trash2 className="size-6" />
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
            <Textarea
              autoFocus
              value={editText}
              onChange={(e) => onEditTextChange(e.target.value)}
              className="min-h-[100px] rounded-xl bg-white text-sm font-medium border-black/5 shadow-inner focus-visible:ring-black/5"
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onCancelEdit}
                className="h-10 px-6 !rounded-xl text-xs font-bold bg-black/5 hover:bg-black/10"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={onSaveEdit}
                className="h-10 px-6 !rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold shadow-lg shadow-green-500/10"
              >
                Save Changes
              </Button>
            </div>
          </div>
        ) : (
          <div onClick={onStartEdit} className="cursor-pointer">
            <p className="text-base font-bold opacity-70 leading-relaxed whitespace-pre-wrap">
              {text}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
