import { DEFAULT_POLL_TIMEOUT_MS, PROCESSING_WORKFLOW_STEPS } from "@/constants/documentProcessing";
import { useDocumentProcessing } from "@/hooks/useDocumentProcessing";
import { transactionKeys } from "@/hooks/useTransactions";
import type { TransactionResultState } from "@/components/TransactionResultDrawer";
import type { DocumentUploadFile } from "@/types/document";
import type * as DocumentPicker from "expo-document-picker";
import { deriveStepperActiveIndex } from "@/utils/documentProcessingProgress";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

import { mapExtractedDataToDrawerState } from "@/utils/mapExtractedDataToDrawerState";
import { saveHomeTransaction } from "@/services/homeTransactionService";

function mapPickerAssetToUploadFile(
  asset: DocumentPicker.DocumentPickerAsset,
): DocumentUploadFile {
  return {
    uri: asset.uri,
    name: asset.name || `document_${Date.now()}.pdf`,
    type: asset.mimeType || "application/pdf",
    size: asset.size,
  };
}

/**
 * Home upload adapter: maps shared document processing to design-system modals/drawer.
 * Processing state and progress come from useDocumentProcessing — not duplicated here.
 */
export function useHomeUploadFlow() {
  const isStoppingRef = useRef(false);
  const isSavingRef = useRef(false);
  const queryClient = useQueryClient();
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(
    null,
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const {
    processDocument,
    cancel,
    reset,
    isUploading,
    isAnalyzing,
    isComplete,
    isFailed,
    extractedData,
    fileId,
    error,
    overallProgress,
    progressMessage,
  } = useDocumentProcessing({
    transactionCategory: "PSA",
    maxDuration: DEFAULT_POLL_TIMEOUT_MS,
  });

  const handleFileSelected = useCallback(
    async (asset: DocumentPicker.DocumentPickerAsset) => {
      if (isUploading || isAnalyzing || isComplete) {
        return;
      }

      isStoppingRef.current = false;
      await processDocument(mapPickerAssetToUploadFile(asset));
    },
    [isAnalyzing, isComplete, isUploading, processDocument],
  );

  const handleStopProcessing = useCallback(() => {
    isStoppingRef.current = true;
    cancel();
    reset();
  }, [cancel, reset]);

  const handleRetry = useCallback(() => {
    isStoppingRef.current = false;
    cancel();
    reset();
  }, [cancel, reset]);

  const handleCancelFailure = useCallback(() => {
    handleRetry();
  }, [handleRetry]);

  const handleDrawerClose = useCallback(() => {
    reset();
  }, [reset]);

  const handleSaveTransaction = useCallback(
    async (state: TransactionResultState) => {
      if (isSavingRef.current) {
        return;
      }

      isSavingRef.current = true;

      try {
        const result = await saveHomeTransaction(state, {
          uploadedFileId: fileId,
          extractedData,
        });

        if (!result.ok) {
          if (result.kind === "validation") {
            Alert.alert("Validation Error", result.errorMessage);
          } else {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: result.errorMessage,
            });
          }
          return;
        }

        setCreatedTransactionId(result.transactionId);
        await queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        reset();
        setShowSuccessModal(true);
      } catch (error) {
        console.error("Error saving Home transaction:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to create transaction. Please try again.",
        });
      } finally {
        isSavingRef.current = false;
      }
    },
    [extractedData, fileId, queryClient, reset],
  );

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    setCreatedTransactionId(null);
  }, []);

  const handleCreateAnother = useCallback(() => {
    setShowSuccessModal(false);
    setCreatedTransactionId(null);
  }, []);

  const activeStep = useMemo(
    () =>
      deriveStepperActiveIndex(
        overallProgress,
        PROCESSING_WORKFLOW_STEPS.length,
      ),
    [overallProgress],
  );

  const showFailedModal = isFailed && !isStoppingRef.current && !!error;

  const transactionResultState = useMemo(
    () => mapExtractedDataToDrawerState(extractedData),
    [extractedData],
  );

  const transactionDrawerKey = useMemo(() => {
    if (!isComplete || !extractedData || !fileId) {
      return null;
    }

    return `${fileId}-${extractedData.filename}`;
  }, [extractedData, fileId, isComplete]);

  return {
    extractedData,
    transactionResultState,
    transactionDrawerKey,
    createdTransactionId,
    showSuccessModal,
    uploadedFileId: fileId,
    failureMessage: error?.message ?? "",
    overallProgress,
    progressDescription: progressMessage,
    activeStep,
    processingSteps: PROCESSING_WORKFLOW_STEPS,
    showProgressModal: isUploading || isAnalyzing,
    showFailedModal,
    showTransactionDrawer: isComplete,
    handleFileSelected,
    handleStopProcessing,
    handleRetry,
    handleCancelFailure,
    handleDrawerClose,
    handleSaveTransaction,
    handleSuccessModalClose,
    handleCreateAnother,
  };
}
