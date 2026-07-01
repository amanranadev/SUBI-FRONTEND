"use client";

import { useEffect, useRef, useState } from "react";
import type { DocumentRecord } from "@/features/documents/types";
import {
  AI_PROCESSING_STATUS,
  EXTRACTION_STATUS,
} from "@/features/transactions/constants";

type RefetchDocuments = () => Promise<{ data: DocumentRecord[] | undefined }>;

export function useTransactionDocumentProgress() {
  const [updateProgressByDocumentId, setUpdateProgressByDocumentId] = useState<
    Record<string, number>
  >({});
  const [updateLabelByDocumentId, setUpdateLabelByDocumentId] = useState<
    Record<string, string>
  >({});
  const progressTimersRef = useRef<Record<string, ReturnType<typeof setInterval>>>(
    {},
  );

  useEffect(() => {
    return () => {
      Object.values(progressTimersRef.current).forEach((timer) => {
        clearInterval(timer);
      });
      progressTimersRef.current = {};
    };
  }, []);

  const clearProgressTimer = (documentId: string) => {
    const timer = progressTimersRef.current[documentId];
    if (!timer) return;
    clearInterval(timer);
    delete progressTimersRef.current[documentId];
  };

  const startUpdateProgress = (documentId: string) => {
    clearProgressTimer(documentId);
    setUpdateLabelByDocumentId((prev) => ({
      ...prev,
      [documentId]: "Updating document...",
    }));
    setUpdateProgressByDocumentId((prev) => ({ ...prev, [documentId]: 8 }));
    progressTimersRef.current[documentId] = setInterval(() => {
      setUpdateProgressByDocumentId((prev) => {
        const current = prev[documentId] ?? 8;
        if (current >= 88) return prev;
        const next = Math.min(88, current + Math.floor(Math.random() * 9 + 3));
        return { ...prev, [documentId]: next };
      });
    }, 500);
  };

  const finishUpdateProgress = (documentId: string) => {
    clearProgressTimer(documentId);
    setUpdateProgressByDocumentId((prev) => ({ ...prev, [documentId]: 100 }));
    setUpdateLabelByDocumentId((prev) => ({
      ...prev,
      [documentId]: "Analysis completed.",
    }));
    window.setTimeout(() => {
      setUpdateProgressByDocumentId((prev) => {
        const { [documentId]: _removed, ...rest } = prev;
        return rest;
      });
      setUpdateLabelByDocumentId((prev) => {
        const { [documentId]: _removed, ...rest } = prev;
        return rest;
      });
    }, 500);
  };

  const failUpdateProgress = (documentId: string) => {
    clearProgressTimer(documentId);
    setUpdateProgressByDocumentId((prev) => {
      const { [documentId]: _removed, ...rest } = prev;
      return rest;
    });
    setUpdateLabelByDocumentId((prev) => {
      const { [documentId]: _removed, ...rest } = prev;
      return rest;
    });
  };

  const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

  const waitForReprocessCompletion = async (
    uploadId: string,
    fallbackDocuments: DocumentRecord[],
    refetchDocuments: RefetchDocuments,
  ): Promise<DocumentRecord> => {
    for (let attempt = 0; attempt < 180; attempt += 1) {
      const response = await refetchDocuments();
      const list = response.data ?? fallbackDocuments;
      const doc = list.find((entry) => entry.id === uploadId);

      if (!doc) {
        await sleep(2000);
        continue;
      }

      if (doc.aiProcessingStatus === AI_PROCESSING_STATUS.FAILED) {
        throw new Error("Reprocessing failed for this document.");
      }

      if (doc.aiProcessingStatus === AI_PROCESSING_STATUS.COMPLETED) {
        return doc;
      }

      if (doc.aiProcessingStatus === AI_PROCESSING_STATUS.PROCESSING) {
        setUpdateLabelByDocumentId((prev) => ({
          ...prev,
          [uploadId]: "Analyzing document...",
        }));
        setUpdateProgressByDocumentId((prev) => {
          const current = prev[uploadId] ?? 20;
          return { ...prev, [uploadId]: Math.max(current, 72) };
        });
      } else if (
        doc.extractionStatus === EXTRACTION_STATUS.PENDING ||
        doc.extractionStatus === EXTRACTION_STATUS.EXTRACTING
      ) {
        setUpdateLabelByDocumentId((prev) => ({
          ...prev,
          [uploadId]: "Extracting text...",
        }));
        setUpdateProgressByDocumentId((prev) => {
          const current = prev[uploadId] ?? 12;
          return { ...prev, [uploadId]: Math.max(current, 35) };
        });
      } else {
        setUpdateLabelByDocumentId((prev) => ({
          ...prev,
          [uploadId]: "Updating document...",
        }));
        setUpdateProgressByDocumentId((prev) => {
          const current = prev[uploadId] ?? 12;
          return { ...prev, [uploadId]: Math.max(current, 35) };
        });
      }

      await sleep(2000);
    }

    throw new Error(
      "The analysis is taking longer than expected. Please wait a little longer and try again.",
    );
  };

  return {
    updateProgressByDocumentId,
    updateLabelByDocumentId,
    startUpdateProgress,
    finishUpdateProgress,
    failUpdateProgress,
    waitForReprocessCompletion,
  };
}
