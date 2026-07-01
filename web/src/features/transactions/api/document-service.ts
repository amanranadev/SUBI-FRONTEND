import { apiClient } from "@/lib/api/client"
import { addBreadcrumb, captureApiError } from "@/lib/sentry"
import {
  EXTRACTION_STATUS,
  AI_PROCESSING_STATUS,
  type TransactionCategory,
} from "../constants"
import type {
  FileUploadResponse,
  FileStatusResponse,
  RawTransactionData,
} from "../types"
import { FILE_ENDPOINTS } from "./endpoints"

const MAX_CONSECUTIVE_FAILURES = 3
const DEFAULT_POLL_INTERVAL_MS = 3_000
const DEFAULT_POLL_TIMEOUT_MS = 5 * 60 * 1_000

type ProgressCallback = (percent: number, message: string) => void

type UploadParams = {
  file: File
  transactionCategory: TransactionCategory
  processorVersion?: string
  psaType?: string
}

type PollOptions = {
  intervalMs?: number
  timeoutMs?: number
  onProgress?: ProgressCallback
  signal?: AbortSignal
}

type PollResult = {
  transactionData: RawTransactionData
  userUploadId?: string
  fileId: string
}

type AnalysisMetadata = {
  transaction_category?: TransactionCategory
  processor_version?: string
  psa_type?: string
  skip_cache?: boolean
}

type LegacyFileStatus = FileStatusResponse["file"] & {
  analysis_status?: FileStatusResponse["file"]["ai_processing_status"]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function resolveTransactionDataPayload(data: unknown): unknown {
  if (!isRecord(data)) return null

  const wrapped = data.transactionData ?? data.transaction_data
  if (wrapped) return wrapped

  const hasTopLevelTransactionShape =
    "address" in data ||
    "buyersandsellers" in data ||
    "forms" in data ||
    "buyerBrokerName" in data ||
    "sellerBrokerName" in data ||
    "listingBrokerName" in data ||
    "sellingBrokerName" in data

  return hasTopLevelTransactionShape ? data : null
}

class DocumentService {
  async upload(params: UploadParams): Promise<FileUploadResponse> {
    const formData = new FormData()
    formData.append("file", params.file)
    formData.append("transaction_category", params.transactionCategory)

    if (params.processorVersion) {
      formData.append("processor_version", params.processorVersion)
    }
    if (params.psaType) {
      formData.append("psa_type", params.psaType)
    }

    addBreadcrumb("upload", "File upload started", {
      operation: "post:files/upload",
      category: params.transactionCategory,
    })

    let data: FileUploadResponse
    try {
      const response = await apiClient.post<FileUploadResponse>(
        `${FILE_ENDPOINTS.upload}?filename=${encodeURIComponent(params.file.name)}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      )
      data = response.data
    } catch (error) {
      captureApiError(error, {
        operation: "post:files/upload",
        method: "POST",
        path: "/file/upload",
      })
      throw error
    }

    if (!data?.file?.id) {
      throw new Error("Upload failed: no file ID received from server.")
    }

    return data
  }

  async pollUntilComplete(fileId: string, options?: PollOptions): Promise<PollResult> {
    const interval = options?.intervalMs ?? DEFAULT_POLL_INTERVAL_MS
    const timeout = options?.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS
    const start = Date.now()
    let consecutiveFailures = 0

    while (true) {
      this.throwIfAborted(options?.signal)

      if (Date.now() - start > timeout) {
        throw new Error("Document analysis timed out. Please try again.")
      }

      let status: FileStatusResponse["file"]
      try {
        status = await this.fetchStatus(fileId)
        consecutiveFailures = 0
      } catch (fetchError) {
        this.throwIfAborted(options?.signal)
        consecutiveFailures++

        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          throw fetchError
        }

        await this.sleep(interval, options?.signal)
        continue
      }

      if (status.extraction_status === EXTRACTION_STATUS.FAILED) {
        throw new Error(
          status.ai_processing_error_message || "Text extraction failed. The document may be unreadable.",
        )
      }

      if (status.ai_processing_status === AI_PROCESSING_STATUS.FAILED) {
        throw new Error(
          status.ai_processing_error_message || "AI analysis failed. Please try uploading again.",
        )
      }

      if (
        status.ai_processing_status === AI_PROCESSING_STATUS.COMPLETED &&
        status.transaction_data
      ) {
        options?.onProgress?.(100, "Analysis complete!")
        return {
          transactionData: status.transaction_data,
          fileId: String(status.id),
        }
      }

      this.reportProgress(options?.onProgress, status)
      await this.sleep(interval, options?.signal)
    }
  }

  async submitAnalysis(
    fileId: string,
    metadata?: AnalysisMetadata,
    signal?: AbortSignal,
  ): Promise<RawTransactionData | null> {
    addBreadcrumb("upload", "File analysis started", {
      operation: "post:files/analyze",
    })

    try {
      return await this.postAnalyze(fileId, metadata)
    } catch (error: unknown) {
      this.throwIfAborted(signal)

      const status = this.getHttpStatus(error)
      if (status === 202) return null

      // Legacy/built-in path can return 422 while extraction is still running.
      if (status === 422) {
        const file = await this.waitUntilReady(fileId, signal)
        if (
          file.ai_processing_status === AI_PROCESSING_STATUS.COMPLETED &&
          file.transaction_data
        ) {
          return file.transaction_data
        }

        return this.postAnalyze(fileId, metadata)
      }

      const isTransient = !status || status >= 500 || this.isNetworkError(error)
      if (isTransient) {
        await this.sleep(2_000, signal)
        try {
          return await this.postAnalyze(fileId, metadata)
        } catch (retryError) {
          captureApiError(retryError, {
            operation: "post:files/analyze",
            method: "POST",
            path: "/file/:id/analyze",
          })
          throw retryError
        }
      }

      captureApiError(error, {
        operation: "post:files/analyze",
        method: "POST",
        path: "/file/:id/analyze",
        status,
      })
      throw error
    }
  }

  async getStatus(fileId: string): Promise<FileStatusResponse["file"]> {
    return this.fetchStatus(fileId)
  }

  // --- Private ---

  private async postAnalyze(
    fileId: string,
    metadata?: AnalysisMetadata,
  ): Promise<RawTransactionData | null> {
    const { data } = await apiClient.post(FILE_ENDPOINTS.analyze(fileId), metadata)

    const transactionData = resolveTransactionDataPayload(data)

    if (transactionData && !data?.processing) {
      return transactionData as RawTransactionData
    }

    return null
  }

  private async fetchStatus(fileId: string): Promise<FileStatusResponse["file"]> {
    const { data } = await apiClient.get<FileStatusResponse>(
      FILE_ENDPOINTS.status(fileId),
    )

    const file = this.getFilePayload(data as FileStatusResponse | LegacyFileStatus)
    return {
      ...file,
      ai_processing_status: this.resolveAiProcessingStatus(file),
    }
  }

  private getFilePayload(
    response: FileStatusResponse | LegacyFileStatus,
  ): LegacyFileStatus {
    if ("file" in response && response.file) {
      return response.file as LegacyFileStatus
    }

    return response as LegacyFileStatus
  }

  private resolveAiProcessingStatus(file: LegacyFileStatus) {
    return (
      file.ai_processing_status ??
      file.analysis_status ??
      AI_PROCESSING_STATUS.NOT_PROCESSED
    )
  }

  private async waitUntilReady(
    fileId: string,
    signal?: AbortSignal,
  ): Promise<FileStatusResponse["file"]> {
    const timeoutMs = 90_000
    const intervalMs = 3_000
    const start = Date.now()
    let consecutiveFailures = 0

    while (Date.now() - start < timeoutMs) {
      this.throwIfAborted(signal)
      await this.sleep(intervalMs, signal)

      let file: FileStatusResponse["file"]
      try {
        file = await this.fetchStatus(fileId)
        consecutiveFailures = 0
      } catch (error) {
        this.throwIfAborted(signal)
        consecutiveFailures += 1
        if (consecutiveFailures >= MAX_CONSECUTIVE_FAILURES) {
          throw error
        }
        continue
      }

      if (file.extraction_status === EXTRACTION_STATUS.FAILED) {
        throw new Error(
          file.ai_processing_error_message ||
            "Text extraction failed. The document may be unreadable.",
        )
      }

      if (
        file.ai_processing_status === AI_PROCESSING_STATUS.COMPLETED &&
        file.transaction_data
      ) {
        return file
      }

      if (file.extraction_status === EXTRACTION_STATUS.EXTRACTED) {
        return file
      }
    }

    throw new Error("Text extraction timed out. Please try again.")
  }

  private reportProgress(
    onProgress: ProgressCallback | undefined,
    file: FileStatusResponse["file"],
  ) {
    if (!onProgress) return

    if (file.ai_processing_status === AI_PROCESSING_STATUS.PROCESSING) {
      onProgress(70, "AI is analyzing your document...")
    } else if (file.extraction_status === EXTRACTION_STATUS.EXTRACTED) {
      onProgress(50, "Text extracted. Starting AI analysis...")
    } else if (file.extraction_status === EXTRACTION_STATUS.EXTRACTING) {
      onProgress(30, "Extracting text from document...")
    } else {
      onProgress(10, "Preparing document...")
    }
  }

  private getHttpStatus(error: unknown): number | undefined {
    return (error as { response?: { status?: number } }).response?.status
  }

  private isNetworkError(error: unknown): boolean {
    const code = (error as { code?: string }).code
    return code === "ECONNABORTED" || code === "ERR_NETWORK" || code === "ECONNREFUSED"
  }

  private throwIfAborted(signal?: AbortSignal) {
    if (signal?.aborted) {
      throw new DOMException("Processing cancelled.", "AbortError")
    }
  }

  private sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, ms)
      signal?.addEventListener(
        "abort",
        () => {
          clearTimeout(timer)
          reject(new DOMException("Processing cancelled.", "AbortError"))
        },
        { once: true },
      )
    })
  }
}

export const documentService = new DocumentService()
