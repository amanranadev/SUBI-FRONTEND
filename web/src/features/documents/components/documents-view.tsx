"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  FileText,
  Grid3X3,
  List,
  Plus,
  Search,
} from "lucide-react";
import {
  AI_PROCESSING_STATUS,
  type AiProcessingStatus,
} from "@/features/transactions/constants";
import { WORKSPACE_ROUTES } from "@/features/workspace/routes";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import { ConfirmModal, type ConfirmModalRef } from "@/shared/ui/confirm-modal";
import { FormSelect } from "@/shared/ui/form-select";
import { Input } from "@/shared/ui/input";
import { cn } from "@/lib/utils";
import { useDocuments } from "../hooks/use-documents";
import type { DocumentRecord } from "../types";
import {
  DOCUMENT_VIEW_MODES,
  type DocumentViewMode,
  getDocumentStatusLabel,
} from "../utils";
import { DocumentCard } from "./document-card";

const ALL_STATUSES = "all";
const FILTERABLE_STATUSES: AiProcessingStatus[] = [
  AI_PROCESSING_STATUS.COMPLETED,
  AI_PROCESSING_STATUS.PROCESSING,
  AI_PROCESSING_STATUS.FAILED,
  AI_PROCESSING_STATUS.NOT_PROCESSED,
];

export function DocumentsView() {
  const router = useRouter();
  const confirmModalRef = React.useRef<ConfirmModalRef | null>(null);
  const [isFilterMounted, setIsFilterMounted] = React.useState(false);
  const [searchInputValue, setSearchInputValue] = React.useState("");
  const [selectedStatus, setSelectedStatus] = React.useState<
    AiProcessingStatus | typeof ALL_STATUSES
  >(ALL_STATUSES);
  const [viewMode, setViewMode] = React.useState<DocumentViewMode>(
    DOCUMENT_VIEW_MODES.GRID,
  );
  const {
    documents,
    isLoading,
    error,
    refetch,
    deleteDocument,
    downloadDocument,
    deletingId,
    downloadingId,
  } = useDocuments();
  const { toast } = useToast();
  const deferredSearchTerm = React.useDeferredValue(
    searchInputValue.trim().toLowerCase(),
  );

  React.useEffect(() => {
    setIsFilterMounted(true);
  }, []);

  const statusOptions = React.useMemo(() => {
    return [
      { value: ALL_STATUSES, label: "All statuses" },
      ...FILTERABLE_STATUSES.map((status) => ({
        value: status,
        label: `${getDocumentStatusLabel(status)} (${documents.filter(
          (document) => document.aiProcessingStatus === status,
        ).length})`,
      })),
    ];
  }, [documents]);

  const selectedStatusLabel = React.useMemo(() => {
    return (
      statusOptions.find((option) => option.value === selectedStatus)?.label ??
      "All statuses"
    );
  }, [selectedStatus, statusOptions]);

  const filteredDocuments = React.useMemo(() => {
    return documents.filter((document) => {
      const searchTarget = [
        document.file?.filename,
        document.file?.contentType,
        document.relatedTransactionAddress,
        document.uploadedBy,
        getDocumentStatusLabel(document.aiProcessingStatus),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = deferredSearchTerm
        ? searchTarget.includes(deferredSearchTerm)
        : true;
      const matchesStatus =
        selectedStatus === ALL_STATUSES ||
        document.aiProcessingStatus === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [deferredSearchTerm, documents, selectedStatus]);

  const handleUploadRedirect = React.useCallback(() => {
    router.push(WORKSPACE_ROUTES.HOME);
  }, [router]);

  const handleDownload = React.useCallback(
    async (document: DocumentRecord) => {
      try {
        await downloadDocument(document);
        toast({
          title: "Document opened",
          description:
            document.file?.filename ?? "Your document opened in a new tab.",
        });
      } catch (downloadError) {
        toast({
          title: "Unable to open document",
          description:
            downloadError instanceof Error
              ? downloadError.message
              : "We could not open this document right now.",
          variant: "destructive",
        });
      }
    },
    [downloadDocument, toast],
  );

  const handleDelete = React.useCallback(
    async (document: DocumentRecord) => {
      const confirmed =
        (await confirmModalRef.current?.confirm({
          title: "Delete document?",
          description:
            "This will permanently remove the document from your workspace.",
          confirmLabel: "Delete",
          cancelLabel: "Cancel",
          variant: "danger",
        })) ?? false;

      if (!confirmed) {
        return;
      }

      try {
        await deleteDocument(document.id);
        toast({
          title: "Document deleted",
          description:
            document.file?.filename ?? "The document has been removed.",
        });
      } catch (deleteError) {
        toast({
          title: "Delete failed",
          description:
            deleteError instanceof Error
              ? deleteError.message
              : "We could not delete this document right now.",
          variant: "destructive",
        });
      }
    },
    [deleteDocument, toast],
  );

  return (
    <div className="mx-auto w-full max-w-7xl animate-in fade-in slide-in-from-bottom-8 space-y-10 pb-32 duration-700">
      <ConfirmModal ref={confirmModalRef} />

      <div className="space-y-8 border-b border-black/[0.04] pb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tighter leading-none">
              Documents
            </h1>
            <p className="text-base font-medium tracking-tight text-foreground/40">
              Access all your uploaded documents in one place.
            </p>
          </div>

          <Button
            type="button"
            onClick={handleUploadRedirect}
            className="h-12 rounded-[1.4rem] px-6 shadow-lg shadow-primary/20"
          >
            <Plus className="size-4" />
            Upload Document
          </Button>
        </div>

        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <Input
              value={searchInputValue}
              onChange={(event) => setSearchInputValue(event.target.value)}
              leftIcon={<Search className="size-4" />}
              placeholder="Search documents"
              className="h-14 rounded-full border-black/[0.06] bg-white px-5 text-base shadow-default"
              containerClassName="w-full md:w-[27.5rem]"
              showClearButton
            />

            {isFilterMounted ? (
              <FormSelect
                value={selectedStatus}
                onValueChange={(value) =>
                  setSelectedStatus(value as AiProcessingStatus | typeof ALL_STATUSES)
                }
                options={statusOptions}
                className="h-14 min-w-0 rounded-full border-black/[0.06] bg-white text-base shadow-default md:w-[17.5rem]"
                placeholder="All statuses"
              />
            ) : (
              <div
                aria-hidden="true"
                className="flex h-14 min-w-0 items-center justify-between rounded-full border border-black/[0.06] bg-white px-5 py-2 text-base text-foreground shadow-default md:w-[17.5rem]"
              >
                <span className="truncate">{selectedStatusLabel}</span>
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 self-start rounded-[1.6rem] border border-black/[0.05] bg-white p-1.5 shadow-default xl:self-auto">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-12 w-12 rounded-[1.2rem]",
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
                "h-12 w-12 rounded-[1.2rem]",
                viewMode === DOCUMENT_VIEW_MODES.LIST
                  ? "bg-white shadow-default"
                  : "opacity-40 hover:opacity-100",
              )}
              onClick={() => setViewMode(DOCUMENT_VIEW_MODES.LIST)}
            >
              <List className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card rounded-[2rem] border-white/60 p-10 text-center shadow-default">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-foreground/15 border-t-foreground/60" />
          <p className="text-sm font-medium text-foreground/55">
            Loading documents...
          </p>
        </div>
      ) : error ? (
        <div className="glass-card rounded-[2rem] border-white/60 p-10 text-center shadow-default">
          <p className="text-sm font-medium text-destructive">
            Unable to load documents right now.
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 rounded-2xl"
            onClick={() => void refetch()}
          >
            Try again
          </Button>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="glass-card rounded-[2rem] border-white/60 p-12 text-center shadow-default">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-black/[0.04] text-foreground/35">
            <FileText className="size-8" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">No documents found</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-foreground/50">
            {searchInputValue.trim() || selectedStatus !== ALL_STATUSES
              ? "Try adjusting the search or status filter."
              : "Upload your first PSA from the home page to start building your documents library."}
          </p>
        </div>
      ) : (
        <div
          className={cn(
            viewMode === DOCUMENT_VIEW_MODES.GRID
              ? "grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
              : "space-y-4",
          )}
        >
          {filteredDocuments.map((document) => {
            const busyAction =
              downloadingId === document.id
                ? "download"
                : deletingId === document.id
                  ? "delete"
                  : null;

            return (
              <DocumentCard
                key={document.id}
                document={document}
                viewMode={viewMode}
                busyAction={busyAction}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
