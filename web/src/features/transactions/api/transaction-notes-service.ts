import { z } from "zod"
import { apiClient } from "@/lib/api/client"

const transactionNoteSchema = z.object({
  id: z.coerce.string(),
  transaction_id: z.coerce.string(),
  user_id: z.coerce.string(),
  text: z.string(),
  position: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
})

const notesListResponseSchema = z.object({
  notes: z.array(transactionNoteSchema),
})

export type TransactionNote = z.infer<typeof transactionNoteSchema>

export async function listTransactionNotes(
  transactionId: string,
): Promise<TransactionNote[]> {
  const response = await apiClient.get(
    `/transactions/${transactionId}/notes`,
  )
  const parsed = notesListResponseSchema.parse(response.data)
  return parsed.notes
}

export async function createTransactionNote(
  transactionId: string,
  text: string,
): Promise<TransactionNote> {
  const response = await apiClient.post(
    `/transactions/${transactionId}/notes`,
    { text },
  )
  return transactionNoteSchema.parse(response.data)
}

export async function updateTransactionNote(
  transactionId: string,
  noteId: string,
  text: string,
): Promise<TransactionNote> {
  const response = await apiClient.patch(
    `/transactions/${transactionId}/notes/${noteId}`,
    { text },
  )
  return transactionNoteSchema.parse(response.data)
}

export async function deleteTransactionNote(
  transactionId: string,
  noteId: string,
): Promise<void> {
  await apiClient.delete(
    `/transactions/${transactionId}/notes/${noteId}`,
  )
}

export async function reorderTransactionNotes(
  transactionId: string,
  noteIds: string[],
): Promise<TransactionNote[]> {
  const response = await apiClient.patch(
    `/transactions/${transactionId}/notes/reorder`,
    { note_ids: noteIds },
  )
  const parsed = notesListResponseSchema.parse(response.data)
  return parsed.notes
}
