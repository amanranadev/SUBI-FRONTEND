"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  addTransactionDocument,
  deleteTransactionDocument,
  fetchTransactionDocumentAnalysis,
  fetchTransactionDocuments,
  reprocessTransactionDocument,
  type TransactionDocumentMutationResult,
} from "../api/transaction-documents"
import type { RawTransactionData } from "../types"
import { WORKSPACE_TRANSACTIONS_QUERY_KEY } from "@/features/workspace/constants"

const TRANSACTION_DOCUMENTS_QUERY_KEY = "transaction-documents"

type ReplaceDocumentInput = {
  uploadId: string
  file: File
  reprocess: boolean
}

export function useTransactionDocuments(transactionId: string) {
  const queryClient = useQueryClient()
  const queryKey = [TRANSACTION_DOCUMENTS_QUERY_KEY, transactionId] as const

  const documentsQuery = useQuery({
    queryKey,
    queryFn: () => fetchTransactionDocuments(transactionId),
    enabled: Boolean(transactionId),
  })

  const addMutation = useMutation({
    mutationFn: (input: { file: File; reprocess: boolean }) =>
      addTransactionDocument(transactionId, input.file, {
        reprocess: input.reprocess,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ["transaction-detail", transactionId] })
      queryClient.invalidateQueries({ queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY })
    },
  })

  const replaceMutation = useMutation({
    mutationFn: (input: ReplaceDocumentInput) =>
      reprocessTransactionDocument(transactionId, input.uploadId, input.file, {
        reprocess: input.reprocess,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ["transaction-detail", transactionId] })
      queryClient.invalidateQueries({ queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (uploadId: string) => deleteTransactionDocument(uploadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey })
      queryClient.invalidateQueries({ queryKey: ["transaction-detail", transactionId] })
      queryClient.invalidateQueries({ queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY })
    },
  })

  return {
    documents: documentsQuery.data ?? [],
    isLoading: documentsQuery.isLoading,
    error: documentsQuery.error,
    refetch: documentsQuery.refetch,
    addFile: async (file: File, reprocess: boolean): Promise<TransactionDocumentMutationResult> =>
      addMutation.mutateAsync({ file, reprocess }),
    replaceFile: async (
      uploadId: string,
      file: File,
      reprocess: boolean,
    ): Promise<TransactionDocumentMutationResult> =>
      replaceMutation.mutateAsync({ uploadId, file, reprocess }),
    deleteFile: async (uploadId: string): Promise<void> =>
      deleteMutation.mutateAsync(uploadId),
    getAnalysis: async (uploadId: string): Promise<RawTransactionData | null> =>
      fetchTransactionDocumentAnalysis(uploadId),
    isAdding: addMutation.isPending,
    replacingUploadId:
      replaceMutation.isPending ? replaceMutation.variables?.uploadId ?? null : null,
    deletingUploadId:
      deleteMutation.isPending ? deleteMutation.variables ?? null : null,
    isBusy: addMutation.isPending || replaceMutation.isPending || deleteMutation.isPending,
  }
}
