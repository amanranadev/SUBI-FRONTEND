"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { TransactionStatus } from "@/features/workspace/status";
import {
  TRANSACTION_STATUS,
  TRANSACTION_STATUS_LABELS,
} from "@/features/workspace/status";
import { toast } from "@/shared/hooks/use-toast";
import { getStatusColor } from "../utils/transaction-status";
import { updateTransactionStatus } from "../api/transaction-service";

const STATUS_OPTIONS: TransactionStatus[] = [
  TRANSACTION_STATUS.STARTED,
  TRANSACTION_STATUS.PENDING_INSPECTION,
  TRANSACTION_STATUS.PENDING_APPRAISAL,
  TRANSACTION_STATUS.CLEAR_TO_CLOSE,
  TRANSACTION_STATUS.CLOSED,
  TRANSACTION_STATUS.CANCELLED,
  TRANSACTION_STATUS.ARCHIVE,
];

type TransactionStatusSelectProps = {
  transactionId: string;
  transactionStatus: TransactionStatus;
  onStatusChanged?: (transactionId: string, newStatus: TransactionStatus) => void;
  className?: string;
  size?: "default" | "sm";
};

export function TransactionStatusSelect({
  transactionId,
  transactionStatus,
  onStatusChanged,
  className,
  size = "sm",
}: TransactionStatusSelectProps) {
  const [optimisticStatus, setOptimisticStatus] = useState<TransactionStatus | null>(null);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (optimisticStatus && transactionStatus === optimisticStatus) {
      setOptimisticStatus(null);
    }
  }, [transactionStatus, optimisticStatus]);

  const displayStatus = optimisticStatus ?? transactionStatus;

  const handleStatusChange = useCallback(
    (newStatus: TransactionStatus) => {
      if (newStatus === displayStatus || isUpdatingRef.current) return;

      setOptimisticStatus(newStatus);
      isUpdatingRef.current = true;

      updateTransactionStatus(transactionId, { status: newStatus })
        .then(() => {
          onStatusChanged?.(transactionId, newStatus);
        })
        .catch(() => {
          setOptimisticStatus(null);
          toast({
            title: "Failed to update status",
            description: "The status could not be saved. Please try again.",
            variant: "destructive",
          });
        })
        .finally(() => {
          isUpdatingRef.current = false;
        });
    },
    [transactionId, displayStatus, onStatusChanged],
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-1 rounded-full border-0 font-bold uppercase tracking-widest transition-colors hover:opacity-90 disabled:opacity-50",
            getStatusColor(displayStatus),
            size === "sm" ? "px-3 py-1 text-[9px]" : "px-4 py-1.5 text-[10px]",
            className,
          )}
        >
          {TRANSACTION_STATUS_LABELS[displayStatus]}
          <ChevronDown className="size-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="min-w-[220px]"
      >
        {STATUS_OPTIONS.map((statusOption) => (
          <DropdownMenuItem
            key={statusOption}
            onSelect={(e) => {
              e.preventDefault();
              handleStatusChange(statusOption);
            }}
            className="flex cursor-pointer items-center justify-between"
          >
            <span>{TRANSACTION_STATUS_LABELS[statusOption]}</span>
            {displayStatus === statusOption && (
              <Check className="size-4 shrink-0" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
