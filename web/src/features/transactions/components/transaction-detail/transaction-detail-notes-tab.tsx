"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import {
  useTransactionGeneralNotes,
  type TransactionNote,
} from "@/features/transactions/hooks/use-transaction-general-notes"
import { useToast } from "@/shared/hooks/use-toast"
import { Button } from "@/shared/ui/button"
import { Textarea } from "@/shared/ui/textarea"
import { TransactionNoteCard } from "./transaction-note-card"

type TransactionDetailNotesTabProps = {
  transactionId: string
}

const NOTE_LENGTH = {
  MIN: 1,
  MAX: 5000,
} as const

export function TransactionDetailNotesTab({
  transactionId,
}: TransactionDetailNotesTabProps) {
  const { toast } = useToast()
  const {
    notes,
    isLoading,
    isAdding,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
  } = useTransactionGeneralNotes(transactionId)

  const [newNoteInput, setNewNoteInput] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState("")

  const validateNoteText = (input: string): string | null => {
    const trimmed = input.trim()
    if (trimmed.length < NOTE_LENGTH.MIN) {
      return "Note cannot be empty."
    }
    if (trimmed.length > NOTE_LENGTH.MAX) {
      return `Note must be ${NOTE_LENGTH.MAX} characters or less.`
    }
    return null
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleAddNote = () => {
    const trimmed = newNoteInput.trim()
    const validationError = validateNoteText(trimmed)
    if (validationError) {
      toast({
        title: "Invalid note",
        description: validationError,
        variant: "destructive",
      })
      return
    }
    addNote(trimmed)
    setNewNoteInput("")
  }

  const handleStartEdit = (note: TransactionNote) => {
    setEditingId(note.id)
    setEditingText(note.text)
  }

  const handleSaveEdit = (id: string) => {
    const trimmed = editingText.trim()
    const validationError = validateNoteText(trimmed)
    if (validationError) {
      toast({
        title: "Invalid note",
        description: validationError,
        variant: "destructive",
      })
      return
    }
    updateNote(id, trimmed)
    setEditingId(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = notes.findIndex((n) => n.id === active.id)
    const newIndex = notes.findIndex((n) => n.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(notes, oldIndex, newIndex)
    reorderNotes(reordered.map((n) => n.id))
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="space-y-8">
        <p className="text-[11px] font-bold uppercase tracking-widest opacity-40 ml-2">
          Add any notes relevant to this transaction here that you&apos;d like to
          remember or log for the future
        </p>
        <div className="glass-card rounded-[2rem] p-6 space-y-4 bg-black/[0.01]">
          <div className="flex gap-4">
            <Textarea
              value={newNoteInput}
              onChange={(e) => setNewNoteInput(e.target.value)}
              placeholder="Transaction notes..."
              maxLength={NOTE_LENGTH.MAX}
              className="min-h-[160px] rounded-2xl bg-white border-black/5 text-base font-medium shadow-sm focus-visible:ring-black/5"
            />
            <Button
              onClick={handleAddNote}
              disabled={
                Boolean(validateNoteText(newNoteInput)) || isAdding
              }
              className="self-center h-12 px-6 !rounded-2xl bg-primary text-white font-bold transition-all hover:scale-[1.02] active:scale-95"
            >
              {isAdding ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <Plus className="size-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={notes.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {notes.map((note) => (
                <TransactionNoteCard
                  key={note.id}
                  id={note.id}
                   text={note.text}
                  createdAt={note.created_at}
                  isEditing={editingId === note.id}
                  editText={editingText}
                  onEditTextChange={setEditingText}
                  onStartEdit={() => handleStartEdit(note)}
                  onSaveEdit={() => handleSaveEdit(note.id)}
                  onCancelEdit={() => setEditingId(null)}
                  onDelete={() => deleteNote(note.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
