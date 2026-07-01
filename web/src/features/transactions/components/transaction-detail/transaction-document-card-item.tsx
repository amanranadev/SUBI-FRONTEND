"use client";

import { Download, Eye, RefreshCw, Trash2 } from "lucide-react";
import { DocumentCard } from "@/features/documents/components/document-card";
import type { DocumentRecord } from "@/features/documents/types";
import {
  DOCUMENT_VIEW_MODES,
  type DocumentViewMode,
} from "@/features/documents/utils";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui";

type TransactionDocumentCardItemProps = {
  document: DocumentRecord;
  viewMode: DocumentViewMode;
  isBusy: boolean;
  isUpdating: boolean;
  progress?: number;
  updateLabel: string;
  onFileSelected: (document: DocumentRecord, file: File) => void;
  onPreview: (document: DocumentRecord) => void;
  onDownload: (document: DocumentRecord) => void;
  onRequestReplace: (document: DocumentRecord) => void;
  onDelete: (document: DocumentRecord) => void;
  registerInputRef: (id: string, element: HTMLInputElement | null) => void;
};

export function TransactionDocumentCardItem({
  document,
  viewMode,
  isBusy,
  isUpdating,
  progress,
  updateLabel,
  onFileSelected,
  onPreview,
  onDownload,
  onRequestReplace,
  onDelete,
  registerInputRef,
}: TransactionDocumentCardItemProps) {
  const isGrid = viewMode === DOCUMENT_VIEW_MODES.GRID;
  const progressValue = Math.max(8, progress ?? 12);

  return (
    <div className="relative group">
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        disabled={isBusy || isUpdating}
        ref={(element) => {
          registerInputRef(document.id, element);
        }}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onFileSelected(document, file);
          event.target.value = "";
        }}
      />

      <DocumentCard
        document={document}
        viewMode={viewMode}
        showActions={false}
      />

      {isUpdating ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-20 flex items-end rounded-[2rem] p-4",
            isGrid ? "bg-black/30" : "bg-black/26",
          )}
        >
          <div className="w-full rounded-xl border border-white/25 bg-black/55 p-3 text-white backdrop-blur">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <RefreshCw className="size-4 animate-spin" />
              {updateLabel}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <div className="mt-1 text-xs text-white/80">{progressValue}%</div>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "pointer-events-none absolute inset-0 transition-all duration-300 opacity-0",
          isGrid
            ? "flex items-end rounded-[2rem] bg-linear-to-t from-black/35 via-black/10 to-transparent p-4"
            : "flex items-end justify-end rounded-[2rem] bg-linear-to-t from-black/30 via-black/5 to-transparent p-4",
          isGrid
            ? "translate-y-6 group-hover:translate-y-0 group-focus-within:translate-y-0"
            : "translate-y-4 group-hover:translate-y-0 group-focus-within:translate-y-0",
          isUpdating ? "opacity-0" : "group-hover:opacity-100 group-focus-within:opacity-100",
        )}
      >
        {isGrid ? (
          <div className="pointer-events-auto grid w-full grid-cols-4 gap-2">
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-3 backdrop-blur"
              disabled={isBusy || isUpdating || !document.file?.url}
              onClick={() => onPreview(document)}
            >
              <Eye className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-3 backdrop-blur"
              disabled={isBusy || isUpdating || !document.file?.url}
              onClick={() => onDownload(document)}
            >
              <Download className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-3 backdrop-blur"
              disabled={isBusy || isUpdating}
              onClick={() => onRequestReplace(document)}
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-3 backdrop-blur"
              disabled={isBusy || isUpdating}
              onClick={() => onDelete(document)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : (
          <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-4 backdrop-blur"
              disabled={isBusy || isUpdating || !document.file?.url}
              onClick={() => onPreview(document)}
            >
              <Eye className="size-4" />
              Preview
            </Button>
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-4 backdrop-blur"
              disabled={isBusy || isUpdating || !document.file?.url}
              onClick={() => onDownload(document)}
            >
              <Download className="size-4" />
              Download
            </Button>
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-4 backdrop-blur"
              disabled={isBusy || isUpdating}
              onClick={() => onRequestReplace(document)}
            >
              <RefreshCw className="size-4" />
              Update
            </Button>
            <Button
              type="button"
              variant="outline-dark"
              className="h-10 rounded-xl border-white/40 bg-white/95 px-4 backdrop-blur"
              disabled={isBusy || isUpdating}
              onClick={() => onDelete(document)}
            >
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
