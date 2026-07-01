"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Download,
  FileText,
  MoreVertical,
  Trash2,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TRANSACTIONS_ROUTES } from "@/features/transactions/routes";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { formatDateDisplay, formatFileSize } from "@/shared/utils/format";
import type { DocumentRecord } from "../types";
import {
  type DocumentViewMode,
  DOCUMENT_VIEW_MODES,
  getDocumentStatusClasses,
  getDocumentStatusLabel,
  getDocumentTypeLabel,
} from "../utils";

type DocumentCardProps = {
  document: DocumentRecord;
  viewMode: DocumentViewMode;
  busyAction?: "download" | "delete" | null;
  onDownload?: (document: DocumentRecord) => Promise<void> | void;
  onDelete?: (document: DocumentRecord) => Promise<void> | void;
  showActions?: boolean;
};

function MetaPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1 text-xs font-medium text-foreground/55">
      {icon}
      <span className="truncate">{label}</span>
    </span>
  );
}

export function DocumentCard({
  document,
  viewMode,
  busyAction,
  onDownload,
  onDelete,
  showActions = true,
}: DocumentCardProps) {
  const isList = viewMode === DOCUMENT_VIEW_MODES.LIST;
  const filename = document.file?.filename ?? "Untitled document";
  const fileSize =
    document.file?.byteSize != null
      ? formatFileSize(document.file.byteSize)
      : "Unknown size";
  const createdDate = formatDateDisplay(document.createdAt) || "Unknown date";
  const uploadedBy = document.uploadedBy ?? "Uploaded file";
  const statusLabel = getDocumentStatusLabel(document.aiProcessingStatus);
  const hasTransactionLink =
    Boolean(document.relatedTransactionId) &&
    Boolean(document.relatedTransactionAddress);

  return (
    <article
      className={cn(
        "glass-card group relative overflow-hidden border border-white/60 shadow-default transition-all duration-300",
        isList
          ? "rounded-[2rem] p-5 hover:-translate-y-0.5 hover:shadow-lg"
          : "rounded-[2rem] p-6 hover:-translate-y-1 hover:shadow-xl",
      )}
    >
      {showActions && (onDownload || onDelete) ? (
        <div className="absolute right-4 top-4">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-xl text-foreground/50 hover:bg-black/[0.04] hover:text-foreground"
                aria-label={`Open actions for ${filename}`}
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-2xl border-black/[0.05] p-2 shadow-default"
            >
              {onDownload ? (
                <DropdownMenuItem
                  onSelect={() => void onDownload(document)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium hover:!bg-black hover:text-primary"
                  disabled={busyAction === "download" || !document.file?.url}
                >
                  <Download className="size-4" />
                  Download
                </DropdownMenuItem>
              ) : null}
              {onDelete ? (
                <DropdownMenuItem
                  onSelect={() => void onDelete(document)}
                  className="rounded-xl px-3 py-2.5 text-sm font-medium text-destructive focus:text-destructive hover:text-destructive hover:!bg-destructive/10"
                  disabled={busyAction === "delete"}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : null}

      <div
        className={cn(
          "flex gap-5",
          isList
            ? showActions && (onDownload || onDelete)
              ? "items-center pr-14"
              : "items-center"
            : "flex-col items-start",
        )}
      >
        <div className="flex size-16 shrink-0 items-center justify-center rounded-[1.75rem] bg-black/[0.04] text-foreground/45">
          <FileText className="size-8" />
        </div>

        <div className={cn("min-w-0", isList ? "flex-1" : "w-full")}>
          <div
            className={cn(
              "flex gap-4",
              isList ? "items-start justify-between" : "flex-col items-start",
            )}
          >
            <div className="min-w-0 space-y-3">
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em]",
                  getDocumentStatusClasses(document.aiProcessingStatus),
                )}
              >
                {statusLabel}
              </span>

              <h3 className="max-w-full truncate text-2xl font-bold tracking-tight text-foreground">
                {filename}
              </h3>
            </div>

            {isList && hasTransactionLink ? (
              <Link
                href={TRANSACTIONS_ROUTES.detail(
                  document.relatedTransactionId!,
                )}
                className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-black/[0.04] px-4 py-2 text-sm font-semibold text-foreground/75 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <span className="max-w-56 truncate">
                  {document.relatedTransactionAddress}
                </span>
                <ArrowUpRight className="size-4" />
              </Link>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <MetaPill
              icon={<FileText className="size-3.5 text-foreground/35" />}
              label={`${fileSize}-${getDocumentTypeLabel(document)}`}
            />
            <MetaPill
              icon={<CalendarDays className="size-3.5 text-foreground/35" />}
              label={createdDate}
            />
            <MetaPill
              icon={<UserRound className="size-3.5 text-foreground/35" />}
              label={uploadedBy}
            />
          </div>

          {!isList && hasTransactionLink ? (
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium text-foreground/55">
                Transaction:
              </span>
              <Link
                href={TRANSACTIONS_ROUTES.detail(
                  document.relatedTransactionId!,
                )}
                className="inline-flex max-w-full items-center gap-2 rounded-2xl bg-black/[0.04] px-4 py-2 text-sm font-semibold text-foreground/75 transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <span className="truncate">
                  {document.relatedTransactionAddress}
                </span>
                <ArrowUpRight className="size-4 shrink-0" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
