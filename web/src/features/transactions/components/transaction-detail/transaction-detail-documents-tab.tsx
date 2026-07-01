"use client";

import { useRef, useState } from "react";
import { FileText, Grid3X3, List, Plus } from "lucide-react";
import {
  DOCUMENT_VIEW_MODES,
  type DocumentViewMode,
} from "@/features/documents/utils";
import type { Transaction } from "@/features/workspace/types";
import { cn } from "@/lib/utils";
import { Button, Txt } from "@/shared/ui";
import { ConfirmModal, type ConfirmModalRef } from "@/shared/ui/confirm-modal";
import { TransactionDocumentActionModal } from "./transaction-document-action-modal";
import { TransactionDocumentCardItem } from "./transaction-document-card-item";
import { TransactionDocumentPreviewModal } from "./transaction-document-preview-modal";
import { TransactionDocumentReprocessReviewModal } from "./transaction-document-reprocess-review-modal";
import { useDocumentDialogs, DOCUMENT_ACTION_MODE } from "../../hooks/use-document-dialogs";
import { useDocumentActions } from "../../hooks/use-document-actions";

type TransactionDetailDocumentsTabProps = {
  transaction: Transaction;
  transactionId: string;
  onSyncedFromApi?: () => void | Promise<void>;
};

export function TransactionDetailDocumentsTab({
  transaction,
  transactionId,
  onSyncedFromApi,
}: TransactionDetailDocumentsTabProps) {
  const confirmModalRef = useRef<ConfirmModalRef | null>(null);
  const [viewMode, setViewMode] = useState<DocumentViewMode>(
    DOCUMENT_VIEW_MODES.GRID,
  );

  const dialogs = useDocumentDialogs();
  const {
    actionMode,
    isActionModalOpen,
    setIsActionModalOpen,
    pendingReview,
    setPendingReview,
    isPreviewOpen,
    setIsPreviewOpen,
    previewTitle,
    previewUrl,
  } = dialogs;

  const actions = useDocumentActions({
    transaction,
    transactionId,
    onSyncedFromApi,
    dialogs,
    confirmModalRef,
  });

  const {
    addInputRef,
    isBusy,
    isLoading,
    documents,
    updateProgressByDocumentId,
    updateLabelByDocumentId,
    replacingUploadId,
    pendingFile,
    isSavingReview,
    handleChooseAddFile,
    handleChooseReplaceFile,
    handlePreview,
    handleDownload,
    handleRequestReplace,
    handleDeleteDocument,
    handleApplyReview,
    handleConfirmAction,
    resetPendingAction,
    clearPreviewObjectUrl,
  } = actions;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6 duration-500">
      <input
        ref={addInputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={isBusy}
        onChange={(event) => handleChooseAddFile(event.target.files)}
      />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Txt as="h2" size="2xl" weight="bold" className="tracking-tighter">
            Documents
          </Txt>
          <Txt
            as="p"
            size="sm"
            tone="muted"
            className="font-bold uppercase tracking-tight"
          >
            Add files or replace existing ones for this transaction.
          </Txt>
        </div>
        <Button
          type="button"
          variant="dark"
          className="h-11 rounded-2xl px-5"
          onClick={() => addInputRef.current?.click()}
          disabled={isBusy}
        >
          <Plus className="size-4" />
          Add Document
        </Button>
      </div>

      <div className="ml-auto flex w-fit items-center gap-1 rounded-[1.2rem] border border-black/[0.05] bg-white p-1.5 shadow-default">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-xl",
            viewMode === DOCUMENT_VIEW_MODES.GRID
              ? "bg-white shadow-default"
              : "opacity-40 hover:opacity-100",
          )}
          onClick={() => setViewMode(DOCUMENT_VIEW_MODES.GRID)}
        >
          <Grid3X3 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10 rounded-xl",
            viewMode === DOCUMENT_VIEW_MODES.LIST
              ? "bg-white shadow-default"
              : "opacity-40 hover:opacity-100",
          )}
          onClick={() => setViewMode(DOCUMENT_VIEW_MODES.LIST)}
        >
          <List className="size-4" />
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-black/[0.06] bg-black/[0.02] p-10 text-center">
          <div className="size-8 animate-spin rounded-full border-2 border-black/10 border-t-black/45" />
          <Txt as="p" size="sm" tone="muted">
            Loading transaction documents...
          </Txt>
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6 rounded-[2rem] border-2 border-dashed border-black/10 bg-black/[0.02] p-12 text-center">
          <div className="flex size-20 items-center justify-center rounded-[2rem] bg-muted/50">
            <FileText
              className="size-10 text-muted-foreground"
              strokeWidth={1.5}
            />
          </div>
          <Txt as="p" size="lg" weight="medium" className="max-w-md opacity-60">
            No documents linked to this transaction yet.
          </Txt>
        </div>
      ) : (
        <div
          className={
            viewMode === DOCUMENT_VIEW_MODES.GRID
              ? "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              : "space-y-4"
          }
        >
          {documents.map((document) => {
            const progress = updateProgressByDocumentId[document.id];
            const updateLabel =
              updateLabelByDocumentId[document.id] ??
              "Updating document...";
            const isUpdating =
              replacingUploadId === document.id || progress !== undefined;

            return (
              <TransactionDocumentCardItem
                key={document.id}
                document={document}
                viewMode={viewMode}
                isBusy={isBusy}
                isUpdating={isUpdating}
                progress={progress}
                updateLabel={updateLabel}
                onFileSelected={handleChooseReplaceFile}
                onPreview={(doc) => {
                  void handlePreview(doc);
                }}
                onDownload={(doc) => {
                  void handleDownload(doc);
                }}
                onRequestReplace={handleRequestReplace}
                onDelete={(doc) => {
                  void handleDeleteDocument(doc);
                }}
                registerInputRef={(id, element) => {
                  actions.fileInputsRef.current[id] = element;
                }}
              />
            );
          })}
        </div>
      )}

      <TransactionDocumentActionModal
        open={isActionModalOpen}
        onOpenChange={(open) => {
          setIsActionModalOpen(open);
          if (!open) resetPendingAction();
        }}
        title={
          actionMode === DOCUMENT_ACTION_MODE.ADD
            ? "Add document"
            : "Update document"
        }
        description={
          actionMode === DOCUMENT_ACTION_MODE.ADD
            ? "Attach a new file and optionally reprocess transaction data."
            : "Replace this file and optionally reprocess transaction data."
        }
        confirmOnlyLabel={
          actionMode === DOCUMENT_ACTION_MODE.ADD ? "Add only" : "Replace only"
        }
        confirmReprocessLabel={
          actionMode === DOCUMENT_ACTION_MODE.ADD
            ? "Add & Reprocess"
            : "Replace & Reprocess"
        }
        disabled={isBusy || !pendingFile}
        onConfirmOnly={() => void handleConfirmAction(false)}
        onConfirmReprocess={() => void handleConfirmAction(true)}
      />
      <ConfirmModal ref={confirmModalRef} />
      <TransactionDocumentPreviewModal
        open={isPreviewOpen}
        onOpenChange={(open) => {
          setIsPreviewOpen(open);
          if (!open) {
            clearPreviewObjectUrl();
          }
        }}
        title={previewTitle}
        previewUrl={previewUrl}
      />
      <TransactionDocumentReprocessReviewModal
        open={Boolean(pendingReview)}
        isSaving={isSavingReview}
        changes={pendingReview?.changes ?? []}
        onOpenChange={(open) => {
          if (open) return;
          setPendingReview(null);
        }}
        onApply={() => {
          void handleApplyReview();
        }}
      />
    </div>
  );
}
