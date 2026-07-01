import {
  DEFAULT_POLL_TIMEOUT_MS,
  PROCESSING_STATE,
  type ProcessingState,
} from "@/constants/documentProcessing";
import { createDocumentProcessingOrchestrator } from "@/services/documentProcessingOrchestrator";
import type { DocumentUploadFile } from "@/types/document";
import type {
  UseDocumentProcessingOptions,
  UseDocumentProcessingReturn,
} from "@/types/documentProcessing";
import type { ProcessingProgress } from "@/types/documentProcessing";
import {
  buildAnalysisStatusView,
  deriveCombinedProgressPercent,
  deriveDefaultProgressMessage,
  deriveUploadAndAnalysisProgress,
} from "@/utils/documentProcessingProgress";
import { isAnalyzingState, isProcessingActive, isUploadingState } from "@/utils/processingStateMachine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type {
  UseDocumentProcessingOptions,
  UseDocumentProcessingReturn,
} from "@/types/documentProcessing";

export function useDocumentProcessing(
  options: UseDocumentProcessingOptions = {},
): UseDocumentProcessingReturn {
  const {
    transactionCategory = "PSA",
    maxDuration = DEFAULT_POLL_TIMEOUT_MS,
    onUploadComplete,
    onExtractionComplete,
    onError,
    onTimeout,
    onProcessingStateChange,
  } = options;

  const orchestratorRef = useRef(createDocumentProcessingOrchestrator());
  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const processingStartedAtRef = useRef<number | null>(null);

  const [state, setState] = useState<ProcessingState>(PROCESSING_STATE.IDLE);
  const [fileId, setFileId] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<
    UseDocumentProcessingReturn["extractedData"]
  >(null);
  const [error, setError] = useState<UseDocumentProcessingReturn["error"]>(null);
  const [progress, setProgress] = useState<ProcessingProgress>({
    percent: 0,
    message: "",
  });

  const callbacksRef = useRef({
    onUploadComplete,
    onExtractionComplete,
    onError,
    onTimeout,
    onProcessingStateChange,
  });

  callbacksRef.current = {
    onUploadComplete,
    onExtractionComplete,
    onError,
    onTimeout,
    onProcessingStateChange,
  };

  useEffect(() => {
    const orchestrator = orchestratorRef.current;
    orchestrator.setPollTimeoutMs(maxDuration);
    orchestrator.setCallbacks({
      onStateChange: (nextState) => {
        setState(nextState);
        const ctx = orchestrator.getContext();
        setFileId(ctx.fileId);
        setFilename(ctx.filename);
        setExtractedData(ctx.extractedData);
        setError(ctx.error);

        callbacksRef.current.onProcessingStateChange?.(
          isProcessingActive(nextState),
        );

        if (isProcessingActive(nextState) && !processingStartedAtRef.current) {
          processingStartedAtRef.current = Date.now();
        }

        if (
          nextState === PROCESSING_STATE.COMPLETED ||
          nextState === PROCESSING_STATE.IDLE
        ) {
          processingStartedAtRef.current = null;
        }
      },
      onProgress: (nextProgress) => {
        setProgress(nextProgress);
      },
      onUploadComplete: (uploadedFileId) => {
        callbacksRef.current.onUploadComplete?.(uploadedFileId);
      },
      onExtractionComplete: (data) => {
        setExtractedData(data);
        callbacksRef.current.onExtractionComplete?.(data);
      },
      onError: (apiError) => {
        setError(apiError);
        callbacksRef.current.onError?.(apiError);
      },
    });

    return () => {
      orchestrator.cancel();
    };
  }, [maxDuration]);

  useEffect(() => {
    if (!isProcessingActive(state)) {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    if (!processingStartedAtRef.current) {
      processingStartedAtRef.current = Date.now();
    }

    timeoutRef.current = setInterval(() => {
      if (
        processingStartedAtRef.current &&
        Date.now() - processingStartedAtRef.current > maxDuration
      ) {
        orchestratorRef.current.cancel();
        callbacksRef.current.onTimeout?.();
        setState(PROCESSING_STATE.FAILED);
        setError({
          message:
            "Document analysis timed out. Please try again or continue manually.",
          code: "TIMEOUT",
        });
        processingStartedAtRef.current = null;
      }
    }, 1000);

    return () => {
      if (timeoutRef.current) {
        clearInterval(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [state, maxDuration]);

  const processDocument = useCallback(
    async (file: DocumentUploadFile) => {
      setError(null);
      setExtractedData(null);
      processingStartedAtRef.current = Date.now();
      try {
        await orchestratorRef.current.processFile(file, transactionCategory);
      } catch {
        // Errors surfaced via onError callback
      }
    },
    [transactionCategory],
  );

  const retryAnalysis = useCallback(async () => {
    setError(null);
    processingStartedAtRef.current = Date.now();
    try {
      await orchestratorRef.current.retryAnalysis();
    } catch {
      // Errors surfaced via onError callback
    }
  }, []);

  const cancel = useCallback(() => {
    orchestratorRef.current.cancel();
    processingStartedAtRef.current = null;
    setState(PROCESSING_STATE.IDLE);
    setProgress({ percent: 0, message: "" });
  }, []);

  const reset = useCallback(() => {
    orchestratorRef.current.reset();
    processingStartedAtRef.current = null;
    setState(PROCESSING_STATE.IDLE);
    setFileId(null);
    setFilename(null);
    setExtractedData(null);
    setError(null);
    setProgress({ percent: 0, message: "" });
  }, []);

  const { uploadProgress, analysisProgress } = useMemo(
    () => deriveUploadAndAnalysisProgress({ state, progress }),
    [state, progress],
  );

  const overallProgress = useMemo(
    () =>
      deriveCombinedProgressPercent({
        state,
        uploadProgress,
        analysisProgress,
      }),
    [state, uploadProgress, analysisProgress],
  );

  const progressMessage = useMemo(
    () => deriveDefaultProgressMessage({ state, pipelineMessage: progress.message }),
    [state, progress.message],
  );

  const analysisStatus = useMemo(
    () =>
      buildAnalysisStatusView({
        state,
        filename,
        fileId,
        progress,
        errorMessage: error?.message,
      }),
    [state, filename, fileId, progress, error?.message],
  );

  return {
    processDocument,
    retryAnalysis,
    cancel,
    reset,
    state,
    fileId,
    filename,
    extractedData,
    error,
    uploadProgress,
    analysisProgress,
    overallProgress,
    progressMessage,
    analysisStatus,
    isUploading: isUploadingState(state),
    isAnalyzing: isAnalyzingState(state),
    isComplete: state === PROCESSING_STATE.COMPLETED,
    isFailed: state === PROCESSING_STATE.FAILED,
  };
}
