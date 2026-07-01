"use client";

import { useCallback, useRef, useState } from "react";
import { documentService } from "../api/document-service";
import { mapRawToFormData } from "../utils/map-transaction-data";
import { draftStorage } from "../utils/draft-storage";
import {
  PROCESSING_STEP,
  TRANSACTION_CATEGORY,
  PROCESSOR_VERSION,
  type ProcessingStep,
  type TransactionCategory,
} from "../constants";
import type { TransactionFormData, ProcessingProgress } from "../types";

type ProcessingState = {
  isActive: boolean;
  progress: ProcessingProgress;
  result: TransactionFormData | null;
  fileId: string | null;
  error: string | null;
};

const INITIAL_PROGRESS: ProcessingProgress = {
  step: PROCESSING_STEP.IDLE,
  percent: 0,
  message: "",
};

const INITIAL_STATE: ProcessingState = {
  isActive: false,
  progress: INITIAL_PROGRESS,
  result: null,
  fileId: null,
  error: null,
};

export function useDocumentProcessing() {
  const [state, setState] = useState<ProcessingState>(INITIAL_STATE);
  const abortRef = useRef<AbortController | null>(null);

  const setProgress = useCallback(
    (step: ProcessingStep, percent: number, message: string) => {
      setState((prev) => ({
        ...prev,
        progress: { step, percent, message },
      }));
    },
    [],
  );

  const getStepByProgress = useCallback((percent: number): ProcessingStep => {
    if (percent >= 70) return PROCESSING_STEP.ANALYZING;
    if (percent >= 30) return PROCESSING_STEP.EXTRACTING;
    return PROCESSING_STEP.UPLOADING;
  }, []);

  const pollAndResolve = useCallback(
    async (
      fileId: string,
      controller: AbortController,
      _category?: TransactionCategory,
    ): Promise<TransactionFormData | null> => {
      const metadata =
        {
          processor_version: PROCESSOR_VERSION.THIRD_PARTY,
          // PSA is intentionally forced for now.
          // TODO(listing-rollout): use selected category from flow state.
          transaction_category: TRANSACTION_CATEGORY.PSA,
        };

      const immediate = await documentService.submitAnalysis(
        fileId,
        metadata,
        controller.signal,
      );

      let transactionData = immediate;
      if (!transactionData) {
        const pollResult = await documentService.pollUntilComplete(fileId, {
          intervalMs: 1_500,
          signal: controller.signal,
          onProgress: (percent, message) => {
            setProgress(getStepByProgress(percent), percent, message);
          },
        });
        transactionData = pollResult.transactionData;
      }

      controller.signal.throwIfAborted();

      const formData = mapRawToFormData(transactionData);

      draftStorage.clear();

      setState({
        isActive: false,
        progress: {
          step: PROCESSING_STEP.COMPLETE,
          percent: 100,
          message: "All done!",
        },
        result: formData,
        fileId,
        error: null,
      });

      return formData;
    },
    [setProgress, getStepByProgress],
  );

  const handleError = useCallback((error: unknown): null => {
    if (error instanceof DOMException && error.name === "AbortError") {
      setState(INITIAL_STATE);
      return null;
    }

    const message =
      error instanceof Error
        ? error.message
        : "Something went wrong processing your document.";

    setState((prev) => ({
      ...prev,
      isActive: false,
      progress: { step: PROCESSING_STEP.ERROR, percent: 0, message },
      error: message,
    }));

    return null;
  }, []);

  const processFile = useCallback(
    async (
      file: File,
      category: TransactionCategory = TRANSACTION_CATEGORY.PSA,
    ): Promise<TransactionFormData | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        isActive: true,
        progress: {
          step: PROCESSING_STEP.UPLOADING,
          percent: 10,
          message: "Uploading document...",
        },
        result: null,
        fileId: null,
        error: null,
      });

      try {
        const uploadResponse = await documentService.upload({
          file,
          transactionCategory: category,
          processorVersion: PROCESSOR_VERSION.THIRD_PARTY,
        });

        controller.signal.throwIfAborted();

        const fileId = String(uploadResponse.file.id);

        draftStorage.setFileId(fileId);
        setState((prev) => ({ ...prev, fileId }));
        setProgress(
          PROCESSING_STEP.EXTRACTING,
          25,
          "Checking cache and starting analysis...",
        );

        return await pollAndResolve(fileId, controller, category);
      } catch (error) {
        return handleError(error);
      }
    },
    [setProgress, pollAndResolve, handleError],
  );

  const resumeFromFileId = useCallback(
    async (fileId: string): Promise<TransactionFormData | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        isActive: true,
        progress: {
          step: PROCESSING_STEP.EXTRACTING,
          percent: 25,
          message: "Resuming... checking document status...",
        },
        result: null,
        fileId,
        error: null,
      });

      try {
        return await pollAndResolve(fileId, controller);
      } catch (error) {
        draftStorage.clear();
        return handleError(error);
      }
    },
    [pollAndResolve, handleError],
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    draftStorage.clear();
    setState(INITIAL_STATE);
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    draftStorage.clear();
    setState(INITIAL_STATE);
  }, []);

  return {
    ...state,
    processFile,
    resumeFromFileId,
    cancel,
    reset,
  };
}
