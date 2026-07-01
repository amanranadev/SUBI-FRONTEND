import {
  AI_PROCESSING_STATUS,
  EXTRACTION_STATUS,
  EXTRACTION_WAIT_TIMEOUT_MS,
  FILE_ENDPOINTS,
} from "@/constants/documentProcessing";
import apiClient from "@/services/api";
import type {
  AnalysisMetadata,
  FileStatusFile,
  FileStatusResponse,
  RawTransactionData,
} from "@/types/documentProcessing";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function resolveTransactionDataPayload(
  data: unknown,
): RawTransactionData | null {
  if (!isRecord(data)) {
    return null;
  }

  const wrapped = data.transactionData ?? data.transaction_data;
  if (wrapped && isRecord(wrapped)) {
    return wrapped;
  }

  const hasTopLevelTransactionShape =
    "address" in data ||
    "buyersandsellers" in data ||
    "forms" in data ||
    "buyerBrokerName" in data ||
    "sellerBrokerName" in data ||
    "listingBrokerName" in data ||
    "sellingBrokerName" in data;

  return hasTopLevelTransactionShape ? data : null;
}

function getFilePayload(
  response: FileStatusResponse | FileStatusFile,
): FileStatusFile {
  if ("file" in response && response.file) {
    return response.file;
  }
  return response as FileStatusFile;
}

function resolveAiProcessingStatus(file: FileStatusFile) {
  return (
    file.ai_processing_status ??
    file.analysis_status ??
    AI_PROCESSING_STATUS.NOT_PROCESSED
  );
}

export async function fetchFileStatus(fileId: string): Promise<FileStatusFile> {
  const response = await apiClient.get<FileStatusResponse>(
    FILE_ENDPOINTS.status(fileId),
  );
  const file = getFilePayload(response.data);
  return {
    ...file,
    ai_processing_status: resolveAiProcessingStatus(file),
  };
}

async function postAnalyze(
  fileId: string,
  metadata?: AnalysisMetadata,
): Promise<RawTransactionData | null> {
  const { data } = await apiClient.post(FILE_ENDPOINTS.analyze(fileId), metadata);
  const transactionData = resolveTransactionDataPayload(data);

  if (transactionData && !(data as { processing?: boolean })?.processing) {
    return transactionData;
  }

  return null;
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new Error("Processing cancelled.");
    (error as Error & { code: string }).code = "ABORTED";
    throw error;
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        const error = new Error("Processing cancelled.");
        (error as Error & { code: string }).code = "ABORTED";
        reject(error);
      },
      { once: true },
    );
  });
}

function getHttpStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } }).response?.status;
}

function isNetworkError(error: unknown): boolean {
  const code = (error as { code?: string }).code;
  return (
    code === "ECONNABORTED" ||
    code === "ERR_NETWORK" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT"
  );
}

async function waitUntilReady(
  fileId: string,
  signal?: AbortSignal,
): Promise<FileStatusFile> {
  const intervalMs = 3_000;
  const start = Date.now();
  let consecutiveFailures = 0;

  while (Date.now() - start < EXTRACTION_WAIT_TIMEOUT_MS) {
    throwIfAborted(signal);
    await sleep(intervalMs, signal);

    let file: FileStatusFile;
    try {
      file = await fetchFileStatus(fileId);
      consecutiveFailures = 0;
    } catch (error) {
      throwIfAborted(signal);
      consecutiveFailures += 1;
      if (consecutiveFailures >= 3) {
        throw error;
      }
      continue;
    }

    if (file.extraction_status === EXTRACTION_STATUS.FAILED) {
      throw new Error(
        file.ai_processing_error_message ||
          "Text extraction failed. The document may be unreadable.",
      );
    }

    if (
      file.ai_processing_status === AI_PROCESSING_STATUS.COMPLETED &&
      file.transaction_data
    ) {
      return file;
    }

    if (file.extraction_status === EXTRACTION_STATUS.EXTRACTED) {
      return file;
    }
  }

  throw new Error("Text extraction timed out. Please try again.");
}

export async function submitAnalysis(
  fileId: string,
  metadata?: AnalysisMetadata,
  signal?: AbortSignal,
): Promise<RawTransactionData | null> {
  try {
    return await postAnalyze(fileId, metadata);
  } catch (error: unknown) {
    throwIfAborted(signal);

    const status = getHttpStatus(error);
    if (status === 202) {
      return null;
    }

    if (status === 422) {
      const file = await waitUntilReady(fileId, signal);
      if (
        file.ai_processing_status === AI_PROCESSING_STATUS.COMPLETED &&
        file.transaction_data
      ) {
        return file.transaction_data;
      }
      return postAnalyze(fileId, metadata);
    }

    const isTransient = !status || status >= 500 || isNetworkError(error);
    if (isTransient) {
      await sleep(2_000, signal);
      return postAnalyze(fileId, metadata);
    }

    throw error;
  }
}

export function reportAnalysisProgress(
  file: FileStatusFile,
): { percent: number; message: string } {
  if (file.ai_processing_status === AI_PROCESSING_STATUS.PROCESSING) {
    return { percent: 70, message: "AI is analyzing your document..." };
  }
  if (file.extraction_status === EXTRACTION_STATUS.EXTRACTED) {
    return { percent: 50, message: "Text extracted. Starting AI analysis..." };
  }
  if (file.extraction_status === EXTRACTION_STATUS.EXTRACTING) {
    return { percent: 30, message: "Extracting text from document..." };
  }
  return { percent: 10, message: "Preparing document..." };
}

export function assertAnalysisNotFailed(file: FileStatusFile): void {
  if (file.extraction_status === EXTRACTION_STATUS.FAILED) {
    throw new Error(
      file.ai_processing_error_message ||
        "Text extraction failed. The document may be unreadable.",
    );
  }

  if (file.ai_processing_status === AI_PROCESSING_STATUS.FAILED) {
    throw new Error(
      file.ai_processing_error_message ||
        "AI analysis failed. Please try uploading again.",
    );
  }
}
