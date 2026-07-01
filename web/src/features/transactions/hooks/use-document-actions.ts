import { useRef, useState, useEffect } from "react";
import type { DocumentRecord } from "@/features/documents/types";
import { TRANSACTION_ENDPOINTS } from "@/features/transactions/api/endpoints";
import type { Transaction } from "@/features/workspace/types";
import { getUserUploadDownloadTarget } from "@/features/documents/api/user-uploads";
import { useTransactionDocumentProgress } from "@/features/transactions/hooks/use-transaction-document-progress";
import { useTransactionDocuments } from "@/features/transactions/hooks/use-transaction-documents";
import { apiClient } from "@/lib/api/client";
import { useToast } from "@/shared/hooks/use-toast";
import type { ConfirmModalRef } from "@/shared/ui/confirm-modal";
import {
  buildReviewFromReprocess,
  getActionErrorMessage,
} from "@/features/transactions/components/transaction-detail/transaction-detail-documents-review";
import { useDocumentDialogs, DOCUMENT_ACTION_MODE } from "./use-document-dialogs";

type UseDocumentActionsProps = {
  transaction: Transaction;
  transactionId: string;
  onSyncedFromApi?: () => void | Promise<void>;
  dialogs: ReturnType<typeof useDocumentDialogs>;
  confirmModalRef: React.RefObject<ConfirmModalRef | null>;
};

export function useDocumentActions({
  transaction,
  transactionId,
  onSyncedFromApi,
  dialogs,
  confirmModalRef,
}: UseDocumentActionsProps) {
  const { toast } = useToast();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentRecord | null>(null);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const previewObjectUrlRef = useRef<string | null>(null);
  const addInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputsRef = useRef<Record<string, HTMLInputElement | null>>({});

  const {
    documents,
    isLoading,
    isBusy,
    replacingUploadId,
    addFile,
    replaceFile,
    deleteFile,
    getAnalysis,
    refetch,
  } = useTransactionDocuments(transactionId);

  const {
    updateProgressByDocumentId,
    updateLabelByDocumentId,
    startUpdateProgress,
    finishUpdateProgress,
    failUpdateProgress,
    waitForReprocessCompletion,
  } = useTransactionDocumentProgress();

  const clearPreviewObjectUrl = () => {
    if (!previewObjectUrlRef.current) return;
    window.URL.revokeObjectURL(previewObjectUrlRef.current);
    previewObjectUrlRef.current = null;
  };

  useEffect(() => {
    return () => {
      if (!previewObjectUrlRef.current) return;
      window.URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    };
  }, []);

  const resetPendingAction = () => {
    setPendingFile(null);
    setSelectedDocument(null);
    dialogs.closeActionModal();
  };

  const syncFromApi = async () => {
    await onSyncedFromApi?.();
  };

  const resolveDocumentUrl = async (document: DocumentRecord) => {
    const target = getUserUploadDownloadTarget(document);
    if (target.mode === "authenticated") {
      const response = await apiClient.get<Blob>(target.url, {
        responseType: "blob",
      });
      const objectUrl = window.URL.createObjectURL(response.data);
      return { url: objectUrl, isObjectUrl: true };
    }
    return { url: target.url, isObjectUrl: false };
  };

  const resolveDocumentPreviewUrl = async (document: DocumentRecord) => {
    const target = getUserUploadDownloadTarget(document);
    const previewSourceUrl = document.file?.url ?? target.url;

    if (target.mode === "authenticated") {
      const response = await apiClient.get<Blob>(previewSourceUrl, {
        responseType: "blob",
      });
      const blob = response.data;
      const normalizedBlob =
        blob.type && blob.type !== "application/octet-stream"
          ? blob
          : new Blob([blob], { type: "application/pdf" });

      return window.URL.createObjectURL(normalizedBlob);
    }

    return previewSourceUrl;
  };

  const handlePreview = async (document: DocumentRecord) => {
    try {
      const objectUrl = await resolveDocumentPreviewUrl(document);
      clearPreviewObjectUrl();
      previewObjectUrlRef.current = objectUrl;
      dialogs.openPreview(document.file?.filename ?? "Document preview", objectUrl);
    } catch (error) {
      toast({
        title: "Unable to open document",
        description: getActionErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleDownload = async (document: DocumentRecord) => {
    try {
      const resolved = await resolveDocumentUrl(document);
      const link = window.document.createElement("a");
      link.href = resolved.url;
      link.download = document.file?.filename ?? "document.pdf";
      link.rel = "noopener noreferrer";
      link.target = "_blank";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      if (resolved.isObjectUrl) {
        window.setTimeout(() => {
          window.URL.revokeObjectURL(resolved.url);
        }, 60_000);
      }
    } catch (error) {
      toast({
        title: "Unable to download document",
        description: getActionErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    }
  };

  const handleChooseAddFile = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setPendingFile(file);
    setSelectedDocument(null);
    dialogs.openActionModal(DOCUMENT_ACTION_MODE.ADD);
    if (addInputRef.current) addInputRef.current.value = "";
  };

  const handleChooseReplaceFile = (document: DocumentRecord, file: File) => {
    setSelectedDocument(document);
    setPendingFile(file);
    dialogs.openActionModal(DOCUMENT_ACTION_MODE.REPLACE);
  };

  const handleRequestReplace = (document: DocumentRecord) => {
    fileInputsRef.current[document.id]?.click();
  };

  const handleDeleteDocument = async (document: DocumentRecord) => {
    const confirmed =
      (await confirmModalRef.current?.confirm({
        title: "Delete document?",
        description: "This will permanently remove this document from this transaction.",
        confirmLabel: "Delete",
        cancelLabel: "Cancel",
        variant: "danger",
      })) ?? false;

    if (!confirmed) return;

    try {
      await deleteFile(document.id);
      toast({
        title: "Document deleted",
        description: document.file?.filename ?? "The document has been removed.",
      });
      await syncFromApi();
    } catch (error) {
      toast({
        title: "Delete failed",
        description: getActionErrorMessage(error, "We could not delete this document right now."),
        variant: "destructive",
      });
    }
  };

  const handleApplyReview = async () => {
    if (!dialogs.pendingReview || isSavingReview) return;

    setIsSavingReview(true);
    try {
      await apiClient.put(
        TRANSACTION_ENDPOINTS.update(transactionId),
        dialogs.pendingReview.payload,
      );
      dialogs.setPendingReview(null);
      toast({
        title: "Transaction updated",
        description: "Only changed fields from reprocessing were applied.",
      });
      await syncFromApi();
    } catch (error) {
      toast({
        title: "Unable to save updates",
        description: getActionErrorMessage(error, "Please try again."),
        variant: "destructive",
      });
    } finally {
      setIsSavingReview(false);
    }
  };

  const handleConfirmAction = async (reprocess: boolean) => {
    if (!pendingFile || !dialogs.actionMode) return;
    const currentActionMode = dialogs.actionMode;
    dialogs.setIsActionModalOpen(false);

    try {
      if (currentActionMode === DOCUMENT_ACTION_MODE.ADD) {
        await addFile(pendingFile, reprocess);
        toast({
          title: reprocess ? "Document added and reprocessing started" : "Document added",
          description: reprocess
            ? "You can continue working while analysis runs."
            : "The file was attached to this transaction.",
        });
      } else if (selectedDocument) {
        startUpdateProgress(selectedDocument.id);
        await replaceFile(selectedDocument.id, pendingFile, reprocess);
        if (!reprocess) {
          finishUpdateProgress(selectedDocument.id);
          toast({
            title: "Document updated",
            description: "The file was replaced without reprocessing.",
          });
        } else {
          toast({
            title: "Reprocessing started",
            description: "We are analyzing the updated document.",
          });
          const processedDoc = await waitForReprocessCompletion(
            selectedDocument.id,
            documents,
            refetch,
          );
          const analysis =
            processedDoc.aiProcessingResult ?? (await getAnalysis(selectedDocument.id));
          finishUpdateProgress(selectedDocument.id);

          if (!analysis) {
            toast({
              title: "Reprocessing completed",
              description: "No review data was returned for this document.",
            });
          } else {
            const review = buildReviewFromReprocess(transaction, analysis);
            if (review.changes.length === 0) {
              toast({
                title: "Reprocessing completed",
                description: "No transaction fields changed.",
              });
            } else {
              dialogs.setPendingReview({
                uploadId: selectedDocument.id,
                changes: review.changes,
                payload: review.payload,
              });
            }
          }
        }
      }

      await syncFromApi();
      resetPendingAction();
    } catch (error) {
      if (selectedDocument) {
        failUpdateProgress(selectedDocument.id);
      }
      toast({
        title: "Action failed",
        description: getActionErrorMessage(error, "Unable to process document."),
        variant: "destructive",
      });
    }
  };

  return {
    documents,
    isLoading,
    isBusy,
    replacingUploadId,
    updateProgressByDocumentId,
    updateLabelByDocumentId,
    isSavingReview,
    pendingFile,
    selectedDocument,
    addInputRef,
    fileInputsRef,
    handlePreview,
    handleDownload,
    handleDeleteDocument,
    handleApplyReview,
    handleConfirmAction,
    handleChooseAddFile,
    handleChooseReplaceFile,
    handleRequestReplace,
    resetPendingAction,
    clearPreviewObjectUrl,
  };
}
