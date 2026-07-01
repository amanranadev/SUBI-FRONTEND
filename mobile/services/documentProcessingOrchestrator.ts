import {
  DEFAULT_POLL_TIMEOUT_MS,
  PROCESSING_STATE,
  PROCESSOR_VERSION,
  TRANSACTION_CATEGORY,
  type ProcessingState,
  type TransactionCategory,
} from "@/constants/documentProcessing";
import { submitAnalysis } from "@/services/documentAnalysisService";
import { pollUntilComplete } from "@/services/documentPollingService";
import { uploadDocument } from "@/services/documentUploadService";
import { ApiError } from "@/types/auth";
import type {
  AnalysisMetadata,
  ProcessingCallbacks,
  ProcessingContext,
  ProcessingProgress,
} from "@/types/documentProcessing";
import { normalizeExtractedData } from "@/utils/normalizeExtractedData";
import { assertTransition } from "@/utils/processingStateMachine";

type MobileUploadFile = {
  uri: string;
  name: string;
  type: string;
  size?: number;
};

function createInitialContext(): ProcessingContext {
  return {
    state: PROCESSING_STATE.IDLE,
    fileId: null,
    filename: null,
    userUploadId: null,
    progress: { percent: 0, message: "" },
    extractedData: null,
    error: null,
  };
}

function toApiError(error: unknown): ApiError {
  if (error && typeof error === "object" && "message" in error) {
    const candidate = error as ApiError;
    if (candidate.code || candidate.status !== undefined) {
      return candidate;
    }
    return {
      message: candidate.message || "Document processing failed",
      status: candidate.status,
      code: candidate.code,
      errors: candidate.errors,
    };
  }

  return {
    message:
      error instanceof Error
        ? error.message
        : "Something went wrong processing your document.",
    code: "PROCESSING_FAILED",
  };
}

function isCancelledError(error: unknown): boolean {
  const apiError = error as ApiError;
  return (
    apiError?.code === "ABORTED" ||
    (error instanceof Error && error.message.toLowerCase().includes("cancel"))
  );
}

function buildAnalysisMetadata(
  category: TransactionCategory,
): AnalysisMetadata {
  if (category === TRANSACTION_CATEGORY.PSA) {
    return {
      processor_version: PROCESSOR_VERSION.THIRD_PARTY,
      transaction_category: TRANSACTION_CATEGORY.PSA,
    };
  }

  return {
    transaction_category: TRANSACTION_CATEGORY.LISTING,
  };
}

function getStepByProgress(percent: number): ProcessingState {
  if (percent >= 70) {
    return PROCESSING_STATE.ANALYZING;
  }
  if (percent >= 30) {
    return PROCESSING_STATE.EXTRACTING;
  }
  return PROCESSING_STATE.UPLOADING;
}

export class DocumentProcessingOrchestrator {
  private context: ProcessingContext = createInitialContext();
  private abortController: AbortController | null = null;
  private lastFile: MobileUploadFile | null = null;
  private lastCategory: TransactionCategory = TRANSACTION_CATEGORY.PSA;
  private pollTimeoutMs = DEFAULT_POLL_TIMEOUT_MS;
  private callbacks: ProcessingCallbacks = {};

  setCallbacks(callbacks: ProcessingCallbacks) {
    this.callbacks = callbacks;
  }

  setPollTimeoutMs(timeoutMs: number) {
    this.pollTimeoutMs = timeoutMs;
  }

  getContext(): ProcessingContext {
    return this.context;
  }

  reset() {
    this.abortController?.abort();
    this.abortController = null;
    this.lastFile = null;
    this.context = createInitialContext();
    this.emitState(PROCESSING_STATE.IDLE);
  }

  cancel() {
    this.abortController?.abort();
    this.abortController = null;
    this.context = {
      ...createInitialContext(),
      state: PROCESSING_STATE.IDLE,
    };
    this.emitState(PROCESSING_STATE.IDLE);
  }

  async processFile(
    file: MobileUploadFile,
    category: TransactionCategory = TRANSACTION_CATEGORY.PSA,
  ): Promise<void> {
    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;
    this.lastFile = file;
    this.lastCategory = category;

    this.transition(PROCESSING_STATE.UPLOADING, {
      percent: 10,
      message: "Uploading document...",
    });

    try {
      const uploadResult = await uploadDocument({
        ...file,
        transactionCategory: category,
        signal: controller.signal,
        onProgress: (uploadPercent) => {
          this.updateProgress({
            percent: Math.min(25, Math.round(uploadPercent * 0.25)),
            message: "Uploading document...",
          });
        },
      });

      if (controller.signal.aborted) {
        throw toApiError({ message: "Processing cancelled.", code: "ABORTED" });
      }

      this.context = {
        ...this.context,
        fileId: uploadResult.fileId,
        filename: uploadResult.filename,
        userUploadId: uploadResult.userUploadId ?? null,
      };

      this.callbacks.onUploadComplete?.(uploadResult.fileId);

      this.transition(PROCESSING_STATE.EXTRACTING, {
        percent: 25,
        message: "Checking cache and starting analysis...",
      });

      const extractedData = await this.runAnalysisPipeline(
        uploadResult.fileId,
        uploadResult.filename,
        category,
        controller.signal,
      );

      this.context.extractedData = extractedData;
      this.transition(PROCESSING_STATE.COMPLETED, {
        percent: 100,
        message: "Analysis complete!",
      });
      this.callbacks.onExtractionComplete?.(extractedData);
    } catch (error) {
      if (isCancelledError(error)) {
        this.cancel();
        return;
      }

      const apiError = toApiError(error);
      this.context.error = apiError;
      this.transition(PROCESSING_STATE.FAILED, {
        percent: 0,
        message: apiError.message,
      });
      this.callbacks.onError?.(apiError);
      throw apiError;
    }
  }

  async retryAnalysis(): Promise<void> {
    if (!this.context.fileId) {
      if (this.lastFile) {
        return this.processFile(this.lastFile, this.lastCategory);
      }
      throw toApiError({ message: "No file available to retry.", code: "NO_FILE" });
    }

    this.abortController?.abort();
    const controller = new AbortController();
    this.abortController = controller;

    this.transition(PROCESSING_STATE.EXTRACTING, {
      percent: 25,
      message: "Retrying analysis...",
    });

    try {
      const extractedData = await this.runAnalysisPipeline(
        this.context.fileId,
        this.context.filename ?? this.context.fileId,
        this.lastCategory,
        controller.signal,
      );

      this.context.extractedData = extractedData;
      this.context.error = null;
      this.transition(PROCESSING_STATE.COMPLETED, {
        percent: 100,
        message: "Analysis complete!",
      });
      this.callbacks.onExtractionComplete?.(extractedData);
    } catch (error) {
      if (isCancelledError(error)) {
        this.cancel();
        return;
      }

      const apiError = toApiError(error);
      this.context.error = apiError;
      this.transition(PROCESSING_STATE.FAILED, {
        percent: 0,
        message: apiError.message,
      });
      this.callbacks.onError?.(apiError);
      throw apiError;
    }
  }

  private async runAnalysisPipeline(
    fileId: string,
    filename: string,
    category: TransactionCategory,
    signal: AbortSignal,
  ) {
    const metadata = buildAnalysisMetadata(category);
    const immediate = await submitAnalysis(fileId, metadata, signal);

    let rawData = immediate;
    if (!rawData) {
      const pollResult = await pollUntilComplete(fileId, {
        intervalMs: 1_500,
        timeoutMs: this.pollTimeoutMs,
        signal,
        onProgress: (percent, message) => {
          const nextState = getStepByProgress(percent);
          if (this.context.state !== nextState) {
            this.transition(nextState, { percent, message });
          } else {
            this.updateProgress({ percent, message });
          }
        },
      });
      rawData = pollResult.transactionData;
      if (pollResult.userUploadId) {
        this.context.userUploadId = pollResult.userUploadId;
      }
    }

    console.log(
      "[DocumentProcessing] Backend transaction_data:",
      rawData,
    );

    const extractedData = normalizeExtractedData(rawData, filename);

    console.log(
      "[DocumentProcessing] Normalized ExtractedData:",
      extractedData,
    );

    return extractedData;
  }

  private transition(nextState: ProcessingState, progress: ProcessingProgress) {
    assertTransition(this.context.state, nextState);
    this.context.state = nextState;
    this.context.progress = progress;
    this.callbacks.onProgress?.(progress);
    this.emitState(nextState);
  }

  private updateProgress(progress: ProcessingProgress) {
    this.context.progress = progress;
    this.callbacks.onProgress?.(progress);
  }

  private emitState(state: ProcessingState) {
    this.callbacks.onStateChange?.(state);
  }
}

export function createDocumentProcessingOrchestrator(): DocumentProcessingOrchestrator {
  return new DocumentProcessingOrchestrator();
}
