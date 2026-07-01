import { useState } from "react";
import type { TransactionReprocessChange } from "@/features/transactions/components/transaction-detail/transaction-document-reprocess-review-modal";

export const DOCUMENT_ACTION_MODE = {
  ADD: "add",
  REPLACE: "replace",
} as const;

export type DocumentActionMode =
  (typeof DOCUMENT_ACTION_MODE)[keyof typeof DOCUMENT_ACTION_MODE];

export type PendingReviewState = {
  uploadId: string;
  changes: TransactionReprocessChange[];
  payload: Record<string, unknown>;
};

export function useDocumentDialogs() {
  const [actionMode, setActionMode] = useState<DocumentActionMode | null>(null);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState("Document preview");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [pendingReview, setPendingReview] = useState<PendingReviewState | null>(null);

  const openActionModal = (mode: DocumentActionMode) => {
    setActionMode(mode);
    setIsActionModalOpen(true);
  };

  const closeActionModal = () => {
    setIsActionModalOpen(false);
    setActionMode(null);
  };

  const openPreview = (title: string, url: string) => {
    setPreviewTitle(title);
    setPreviewUrl(url);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewUrl(null);
  };

  return {
    actionMode,
    isActionModalOpen,
    setIsActionModalOpen,
    openActionModal,
    closeActionModal,
    
    isPreviewOpen,
    setIsPreviewOpen,
    previewTitle,
    previewUrl,
    openPreview,
    closePreview,
    
    pendingReview,
    setPendingReview,
  };
}
