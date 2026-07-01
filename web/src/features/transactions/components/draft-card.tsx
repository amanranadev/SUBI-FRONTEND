"use client";

import { ArrowRight, FileText, Trash2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDateDisplay,
  formatFileSize,
  timeAgo,
} from "@/shared/utils/format";
import { Txt } from "@/shared/ui";
import type { PendingUpload, RawTransactionData } from "../types";

type DraftCardProps = {
  draft: PendingUpload;
  onOpen: (draft: PendingUpload) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

function getDraftSummary(result: RawTransactionData | null): {
  address: string;
  price: string;
  date: string;
} {
  if (!result) return { address: "Unknown address", price: "", date: "" };
  return {
    address: result.address || "Unknown address",
    price: formatCurrency(result.amount),
    date: formatDateDisplay(result.closeDate),
  };
}

export function DraftCard({
  draft,
  onOpen,
  onDelete,
  isDeleting,
}: DraftCardProps) {
  const summary = getDraftSummary(draft.ai_processing_result);
  const fileName = draft.file?.filename ?? "unknown file";
  const fileSize = draft.file?.byte_size
    ? formatFileSize(draft.file.byte_size)
    : null;

  return (
    <div
      className={cn(
        "group relative flex items-center gap-5 p-5 rounded-[2rem] [@media(max-height:720px)]:gap-3 [@media(max-height:720px)]:p-3 [@media(max-height:720px)]:rounded-2xl",
        "bg-black/[0.02] border border-black/[0.03]",
        "hover:bg-black/[0.04] transition-colors cursor-pointer",
      )}
      onClick={() => onOpen(draft)}
    >
      <div className="size-12 [@media(max-height:720px)]:size-9 rounded-2xl [@media(max-height:720px)]:rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <FileText className="size-5 [@media(max-height:720px)]:size-4 text-primary" />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <Txt className="font-bold text-base/5 [@media(max-height:720px)]:text-sm/5 tracking-tight truncate">
          {summary.address}
        </Txt>
        <div className="flex items-center gap-3 [@media(max-height:720px)]:gap-2 text-xs [@media(max-height:720px)]:text-[11px] text-muted-foreground">
          <span className="font-medium truncate">{fileName}</span>
          {fileSize && (
            <>
              <span className="opacity-30">·</span>
              <span>{fileSize}</span>
            </>
          )}
          <span className="opacity-30">·</span>
          <span>{timeAgo(draft.created_at)}</span>
          {summary.price && (
            <>
              <span className="opacity-30">·</span>
              <span className="font-bold text-foreground/60">
                {summary.price}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 [@media(max-height:720px)]:gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="size-9 [@media(max-height:720px)]:size-7 rounded-xl text-muted-foreground hover:text-white hover:bg-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(draft.id);
          }}
          disabled={isDeleting}
        >
          <Trash2 className="size-4 [@media(max-height:720px)]:size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-9 [@media(max-height:720px)]:size-7 rounded-xl text-primary"
        >
          <ArrowRight className="size-4 [@media(max-height:720px)]:size-3.5" />
        </Button>
      </div>
    </div>
  );
}
