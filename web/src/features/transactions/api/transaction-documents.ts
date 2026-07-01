import { apiClient } from "@/lib/api/client"
import type { DocumentRecord, UserUploadApiRecord } from "@/features/documents/types"
import type { RawTransactionData } from "../types"
import { normalizeDocumentUpload } from "@/features/documents/utils"
import { TRANSACTION_ENDPOINTS, USER_UPLOAD_ENDPOINTS } from "./endpoints"

type TransactionDocumentPayload = {
  user_upload_id?: string | number
  userUploadId?: string | number
  history_id?: string | number
  historyId?: string | number
  job_id?: string | null
  jobId?: string | null
}

export type TransactionDocumentMutationResult = {
  userUploadId: string | null
  historyId: string | null
  jobId: string | null
}

type TransactionDocumentMutationOptions = {
  reprocess: boolean
}

type TransactionDetailUploadsResponse = {
  documents?: UserUploadApiRecord[]
  userUploads?: UserUploadApiRecord[]
  user_uploads?: UserUploadApiRecord[]
}

function extractUploads(payload: TransactionDetailUploadsResponse): UserUploadApiRecord[] {
  if (Array.isArray(payload.documents)) return payload.documents
  if (Array.isArray(payload.userUploads)) return payload.userUploads
  if (Array.isArray(payload.user_uploads)) return payload.user_uploads
  return []
}

function normalizeMutationResponse(
  data: TransactionDocumentPayload | null | undefined,
): TransactionDocumentMutationResult {
  const userUploadId = data?.userUploadId ?? data?.user_upload_id
  const historyId = data?.historyId ?? data?.history_id
  const jobId = data?.jobId ?? data?.job_id ?? null

  return {
    userUploadId: userUploadId != null ? String(userUploadId) : null,
    historyId: historyId != null ? String(historyId) : null,
    jobId: jobId != null ? String(jobId) : null,
  }
}

function buildFormData(file: File, options: TransactionDocumentMutationOptions) {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("reprocess", String(options.reprocess))
  return formData
}

export async function fetchTransactionDocuments(
  transactionId: string,
): Promise<DocumentRecord[]> {
  const { data } = await apiClient.get<TransactionDetailUploadsResponse>(
    TRANSACTION_ENDPOINTS.get(transactionId),
  )

  const normalized = extractUploads(data ?? {})
    .map(normalizeDocumentUpload)
    .filter((upload) => upload.id)

  const unique = Array.from(
    new Map(normalized.map((upload) => [upload.id, upload])).values(),
  )

  return unique.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  )
}

export async function addTransactionDocument(
  transactionId: string,
  file: File,
  options: TransactionDocumentMutationOptions,
): Promise<TransactionDocumentMutationResult> {
  const { data } = await apiClient.post<TransactionDocumentPayload>(
    TRANSACTION_ENDPOINTS.addDocument(transactionId),
    buildFormData(file, options),
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  )

  return normalizeMutationResponse(data)
}

export async function reprocessTransactionDocument(
  transactionId: string,
  uploadId: string,
  file: File,
  options: TransactionDocumentMutationOptions,
): Promise<TransactionDocumentMutationResult> {
  const { data } = await apiClient.post<TransactionDocumentPayload>(
    TRANSACTION_ENDPOINTS.reprocess(transactionId, uploadId),
    buildFormData(file, options),
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  )

  return normalizeMutationResponse(data)
}

export async function deleteTransactionDocument(uploadId: string): Promise<void> {
  await apiClient.delete(USER_UPLOAD_ENDPOINTS.get(uploadId))
}

export async function fetchTransactionDocumentAnalysis(
  uploadId: string,
): Promise<RawTransactionData | null> {
  const { data } = await apiClient.get<{
    data?: RawTransactionData | null
    transaction_data?: RawTransactionData | null
    transactionData?: RawTransactionData | null
  }>(USER_UPLOAD_ENDPOINTS.analysis(uploadId))

  return data?.data ?? data?.transaction_data ?? data?.transactionData ?? null
}
