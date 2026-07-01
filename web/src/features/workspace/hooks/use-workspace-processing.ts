"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDocumentProcessing } from "@/features/transactions/hooks/use-document-processing";
import { usePendingUploads } from "@/features/transactions/hooks/use-pending-uploads";
import { mapRawToFormData } from "@/features/transactions/utils/map-transaction-data";
import { draftStorage } from "@/features/transactions/utils/draft-storage";
import type {
  PendingUpload,
  ProcessingProgress,
  TransactionFormData,
} from "@/features/transactions/types";

type UseWorkspaceProcessingReturn = {
  isDialogOpen: boolean;
  setIsDialogOpen: (open: boolean) => void;
  extractedData: TransactionFormData | null;
  dialogSourceFileId: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  isProcessingFile: boolean;
  processingProgress: ProcessingProgress;
  processingError: string | null;
  drafts: PendingUpload[];
  isDraftsLoading: boolean;
  draftsHasMore: boolean;
  draftsLoadMore: () => void;
  draftsLoadingMore: boolean;
  draftsTotalCount?: number;
  isDeletingDraft: boolean;
  closeTransactionDialog: () => void;
  handleOpenDialogFromDropzone: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpenDraft: (draft: PendingUpload) => void;
  handleDeleteDraft: (id: string) => void;
  cancelProcessing: () => void;
  retryProcessing: () => void;
  resetProcessingState: (shouldCloseDialog: boolean) => void;
  invalidateDrafts: () => void;
};

export function useWorkspaceProcessing(): UseWorkspaceProcessingReturn {
  const [isDialogOpen, setIsDialogOpenState] = useState(false);
  const [extractedData, setExtractedData] = useState<TransactionFormData | null>(
    null,
  );
  const [dialogSourceFileId, setDialogSourceFileId] = useState<string | null>(
    null,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastFileRef = useRef<File | null>(null);
  const resumeAttemptedRef = useRef(false);

  const processing = useDocumentProcessing();
  const pendingUploads = usePendingUploads();

  // Resume interrupted processing on mount.
  useEffect(() => {
    if (resumeAttemptedRef.current) return;
    resumeAttemptedRef.current = true;

    const pendingFileId = draftStorage.getFileId();
    if (!pendingFileId) return;

    processing.resumeFromFileId(pendingFileId).then((result) => {
      if (!result) return;
      setExtractedData(result);
      setIsDialogOpenState(true);
      pendingUploads.invalidate();
    });
  }, [processing, pendingUploads]);

  // Keep dialog source in sync with latest processing file id.
  useEffect(() => {
    if (processing.fileId) {
      setDialogSourceFileId(processing.fileId);
    }
  }, [processing.fileId]);

  const closeTransactionDialog = useCallback(() => {
    setIsDialogOpenState(false);
    setExtractedData(null);
    setDialogSourceFileId(null);
  }, []);

  const startProcessing = useCallback(
    async (file: File) => {
      lastFileRef.current = file;
      const result = await processing.processFile(file);
      if (!result) return;

      setExtractedData(result);
      setIsDialogOpenState(true);
      pendingUploads.invalidate();
    },
    [processing, pendingUploads],
  );

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (!file) return;
      startProcessing(file);
    },
    [startProcessing],
  );

  const handleOpenDialogFromDropzone = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleOpenDraft = useCallback((draft: PendingUpload) => {
    if (!draft.ai_processing_result) return;

    const formData = mapRawToFormData(draft.ai_processing_result);
    setExtractedData(formData);
    setDialogSourceFileId(draft.id);
    setIsDialogOpenState(true);
  }, []);

  const handleDeleteDraft = useCallback(
    (id: string) => {
      pendingUploads.deleteDraft(id);
    },
    [pendingUploads],
  );

  const cancelProcessing = useCallback(() => {
    processing.cancel();
    lastFileRef.current = null;
  }, [processing]);

  const retryProcessing = useCallback(() => {
    const file = lastFileRef.current;
    if (file) {
      startProcessing(file);
    }
  }, [startProcessing]);

  const resetProcessingState = useCallback(
    (shouldCloseDialog: boolean) => {
      if (shouldCloseDialog) {
        closeTransactionDialog();
      }
      processing.reset();
      pendingUploads.invalidate();
    },
    [closeTransactionDialog, processing, pendingUploads],
  );

  const setIsDialogOpen = useCallback((open: boolean) => {
    setIsDialogOpenState(open);
  }, []);

  const invalidateDrafts = useCallback(() => {
    pendingUploads.invalidate();
  }, [pendingUploads]);

  return {
    isDialogOpen,
    setIsDialogOpen,
    extractedData,
    dialogSourceFileId,
    fileInputRef,
    isProcessingFile: processing.isActive,
    processingProgress: processing.progress,
    processingError: processing.error,
    drafts: pendingUploads.drafts,
    isDraftsLoading: pendingUploads.isLoading,
    draftsHasMore: pendingUploads.hasMore,
    draftsLoadMore: pendingUploads.loadMore,
    draftsLoadingMore: pendingUploads.isLoadingMore,
    draftsTotalCount: pendingUploads.totalCount,
    isDeletingDraft: pendingUploads.isDeleting,
    closeTransactionDialog,
    handleOpenDialogFromDropzone,
    handleFileSelect,
    handleOpenDraft,
    handleDeleteDraft,
    cancelProcessing,
    retryProcessing,
    resetProcessingState,
    invalidateDrafts,
  };
}

