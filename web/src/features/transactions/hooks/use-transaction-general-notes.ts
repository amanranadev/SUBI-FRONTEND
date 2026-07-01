"use client"

import { useCallback } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  listTransactionNotes,
  createTransactionNote,
  updateTransactionNote,
  deleteTransactionNote,
  reorderTransactionNotes,
  type TransactionNote,
} from "@/features/transactions/api/transaction-notes-service"

const NOTES_QUERY_KEY = "transaction-notes"

export type { TransactionNote }

export function useTransactionGeneralNotes(transactionId: string) {
  const queryClient = useQueryClient()
  const queryKey = [NOTES_QUERY_KEY, transactionId]

  const notesQuery = useQuery({
    queryKey,
    queryFn: () => listTransactionNotes(transactionId),
    enabled: Boolean(transactionId),
  })

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey })
  }, [queryClient, queryKey])

  const addMutation = useMutation({
    mutationFn: (text: string) => createTransactionNote(transactionId, text),
    onSuccess: invalidate,
  })

  const updateMutation = useMutation({
    mutationFn: ({ noteId, text }: { noteId: string; text: string }) =>
      updateTransactionNote(transactionId, noteId, text),
    onSuccess: invalidate,
  })

  const deleteMutation = useMutation({
    mutationFn: (noteId: string) =>
      deleteTransactionNote(transactionId, noteId),
    onMutate: async (noteId) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<TransactionNote[]>(queryKey)
      queryClient.setQueryData<TransactionNote[]>(queryKey, (old) =>
        old?.filter((n) => n.id !== noteId),
      )
      return { previous }
    },
    onError: (_err, _noteId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: invalidate,
  })

  const reorderMutation = useMutation({
    mutationFn: (noteIds: string[]) =>
      reorderTransactionNotes(transactionId, noteIds),
    onMutate: async (noteIds) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<TransactionNote[]>(queryKey)
      if (previous) {
        const noteMap = new Map(previous.map((n) => [n.id, n]))
        const reordered = noteIds
          .map((id) => noteMap.get(id))
          .filter(Boolean) as TransactionNote[]
        queryClient.setQueryData(queryKey, reordered)
      }
      return { previous }
    },
    onError: (_err, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: invalidate,
  })

  const addNote = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed) return
      addMutation.mutate(trimmed)
    },
    [addMutation],
  )

  const updateNote = useCallback(
    (noteId: string, text: string) => {
      updateMutation.mutate({ noteId, text })
    },
    [updateMutation],
  )

  const deleteNote = useCallback(
    (noteId: string) => {
      deleteMutation.mutate(noteId)
    },
    [deleteMutation],
  )

  const reorderNotes = useCallback(
    (noteIds: string[]) => {
      reorderMutation.mutate(noteIds)
    },
    [reorderMutation],
  )

  return {
    notes: notesQuery.data ?? [],
    isLoading: notesQuery.isLoading,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
  }
}
