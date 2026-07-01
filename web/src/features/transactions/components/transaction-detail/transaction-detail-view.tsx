"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircle2,
  Download,
  FileText,
  Layout,
  Notebook,
  Send,
} from "lucide-react";

import type { Transaction } from "@/features/workspace/types";
import type { TransactionStatus } from "@/features/workspace/status";
import { TRANSACTION_DETAIL_TAB } from "@/features/transactions/constants/transaction-detail-tabs";
import type { TransactionDetailTab } from "@/features/transactions/constants/transaction-detail-tabs";
import { TRANSACTION_ENDPOINTS } from "@/features/transactions/api/endpoints";
import { TransactionStatusSelect } from "@/features/transactions/components/transaction-status-select";

import { apiClient } from "@/lib/api/client";
import { cn } from "@/lib/utils";

import { useToast } from "@/shared/hooks/use-toast";
import { Button, Txt } from "@/shared/ui";

import { TransactionDetailChecklistTab } from "./transaction-detail-checklist-tab";
import { TransactionDetailCommunicationTab } from "./transaction-detail-communication-tab";
import { TransactionDetailDetailsTab } from "./transaction-detail-details-tab";
import { TransactionDetailDocumentsTab } from "./transaction-detail-documents-tab";
import { TransactionDetailNotesTab } from "./transaction-detail-notes-tab";

export type TransactionDetailViewProps = {
  transaction: Transaction;
  contentScrollRef?: React.RefObject<HTMLDivElement | null>;
  onHeaderCollapseChange?: (collapsed: boolean) => void;
  onUpdate: (transaction: Transaction) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSyncedFromApi?: () => void | Promise<void>;
  onStatusChanged?: (transactionId: string, newStatus: TransactionStatus) => void;
};

export function TransactionDetailView({
  transaction,
  contentScrollRef,
  onHeaderCollapseChange,
  onUpdate,
  onDelete,
  onSyncedFromApi,
  onStatusChanged,
}: TransactionDetailViewProps) {
  const headerRef = React.useRef<HTMLDivElement | null>(null);
  const tabsRowRef = React.useRef<HTMLDivElement | null>(null);
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);

  const canCollapseRef = React.useRef(false);

  const animationTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const searchParams = useSearchParams();

  const requestedTab = searchParams.get("tab");
  const highlightedTaskId = searchParams.get("taskId");

  const initialTab = React.useMemo<TransactionDetailTab>(() => {
    if (
      requestedTab &&
      Object.values(TRANSACTION_DETAIL_TAB).includes(
        requestedTab as TransactionDetailTab,
      )
    ) {
      return requestedTab as TransactionDetailTab;
    }

    return TRANSACTION_DETAIL_TAB.DETAILS;
  }, [requestedTab]);

  const [activeTab, setActiveTab] =
    React.useState<TransactionDetailTab>(initialTab);

  const [isHeaderCollapsed, setIsHeaderCollapsed] = React.useState(false);

  const [maxHeaderOffset, setMaxHeaderOffset] = React.useState(0);

  const { toast } = useToast();

  const headerOffset = isHeaderCollapsed ? maxHeaderOffset : 0;

  const collapseProgress = isHeaderCollapsed ? 1 : 0;

  const headerGap = 32 - 14 * collapseProgress;

  const headerBottomPadding = 40 - 24 * collapseProgress;

  const contentGap = 48 - 28 * collapseProgress;

  const setCollapsed = React.useCallback((value: boolean) => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    setIsHeaderCollapsed(value);
  }, []);

  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  React.useEffect(() => {
    onHeaderCollapseChange?.(isHeaderCollapsed);
  }, [isHeaderCollapsed, onHeaderCollapseChange]);

  React.useLayoutEffect(() => {
    const measureMaxOffset = () => {
      if (!headerRef.current || !tabsRowRef.current) return;

      const headerTop = headerRef.current.getBoundingClientRect().top;

      const tabsTop = tabsRowRef.current.getBoundingClientRect().top;

      setMaxHeaderOffset(Math.max(0, tabsTop - headerTop));
    };

    measureMaxOffset();

    window.addEventListener("resize", measureMaxOffset);

    return () => {
      window.removeEventListener("resize", measureMaxOffset);
    };
  }, []);

  React.useEffect(() => {
    const scrollContainer = scrollContainerRef.current;

    if (!scrollContainer) return;

    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }

    canCollapseRef.current = false;

    scrollContainer.scrollTop = 0;

    setIsHeaderCollapsed(false);

    const frame = requestAnimationFrame(() => {
      canCollapseRef.current =
        scrollContainer.scrollHeight > scrollContainer.clientHeight + 24;
    });

    return () => cancelAnimationFrame(frame);
  }, [activeTab]);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;

    const scrollContainer = scrollContainerRef.current;

    if (!sentinel || !scrollContainer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!canCollapseRef.current) return;

        const shouldCollapse = !entry.isIntersecting;

        setCollapsed(shouldCollapse);
      },
      {
        root: scrollContainer,
        threshold: 0.05,
        rootMargin: "-8px 0px 0px 0px",
      },
    );

    observer.observe(sentinel);

    return () => observer.disconnect();
  }, [activeTab, setCollapsed]);

  const handleDownloadAllData = async () => {
    try {
      const { data } = await apiClient.get(
        TRANSACTION_ENDPOINTS.get(transaction.id),
      );

      const payload = {
        exported_at: new Date().toISOString(),
        transaction,
        transaction_api_payload: data,
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });

      const objectUrl = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");

      link.href = objectUrl;

      link.download = `transaction-${transaction.id}-data.json`;

      window.document.body.appendChild(link);

      link.click();

      window.document.body.removeChild(link);

      window.URL.revokeObjectURL(objectUrl);
    } catch {
      toast({
        title: "Unable to export data",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const tabButtonClass = (tab: TransactionDetailTab) =>
    cn(
      "flex h-12 items-center gap-2 rounded-2xl border-black/10 px-6 font-bold transition-all",
      activeTab === tab
        ? "border-primary bg-primary text-white hover:bg-primary/90"
        : "border-0 bg-black/[0.03] text-foreground/40 hover:bg-black/10 hover:text-foreground",
    );

  const setScrollRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      scrollContainerRef.current = node;

      if (contentScrollRef) {
        contentScrollRef.current = node;
      }
    },
    [contentScrollRef],
  );

  return (
    <div
      className="flex h-full min-h-0 max-w-4xl flex-col overflow-hidden"
      style={{
        gap: `${contentGap}px`,
      }}
    >
      <div
        ref={headerRef}
        className="shrink-0 border-b border-black/[0.03]"
        style={{
          display: "flex",
          flexDirection: "column",
          rowGap: `${headerGap}px`,
          marginBottom: `${-headerOffset}px`,
          paddingBottom: `${headerBottomPadding}px`,
          transform: `translate3d(0, -${headerOffset}px, 0)`,
          transition:
            "transform 800ms cubic-bezier(0.16, 1, 0.3, 1), margin-bottom 800ms cubic-bezier(0.16, 1, 0.3, 1), padding-bottom 800ms cubic-bezier(0.16, 1, 0.3, 1), row-gap 800ms cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "transform, margin-bottom, padding-bottom",
        }}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <TransactionStatusSelect
              transactionId={transaction.id}
              transactionStatus={transaction.status}
              onStatusChanged={onStatusChanged}
              size="default"
            />

            <Button
              type="button"
              variant="outline-dark"
              className="h-11 rounded-2xl px-5"
              onClick={() => {
                void handleDownloadAllData();
              }}
            >
              <Download className="size-4" />
              Download all data related to this transaction
            </Button>
          </div>

          <Txt as="h1" size="3xl" weight="bold" className="tracking-tighter">
            {transaction.address}
          </Txt>

          <div className="flex flex-wrap items-center gap-6 text-base font-bold">
            <span className="text-xl text-foreground/20">
              Price:{" "}
              <span className="text-xl text-foreground/50">
                {transaction.price}
              </span>
            </span>

            <span className="text-xl text-foreground/20">
              Mutual Acceptance:{" "}
              <span className="text-xl text-foreground/50">
                {transaction.mutualAcceptanceDate || "—"}
              </span>
            </span>
          </div>
        </div>

        <div
          ref={tabsRowRef}
          className="flex flex-wrap items-center gap-3 pt-5"
        >
          <Button
            type="button"
            variant={
              activeTab === TRANSACTION_DETAIL_TAB.DETAILS
                ? "default"
                : "outline"
            }
            className={tabButtonClass(TRANSACTION_DETAIL_TAB.DETAILS)}
            onClick={() => setActiveTab(TRANSACTION_DETAIL_TAB.DETAILS)}
          >
            <Layout className="size-4" strokeWidth={2} />
            Details
          </Button>

          <Button
            type="button"
            variant={
              activeTab === TRANSACTION_DETAIL_TAB.DOCUMENTS
                ? "default"
                : "outline"
            }
            className={tabButtonClass(TRANSACTION_DETAIL_TAB.DOCUMENTS)}
            onClick={() => setActiveTab(TRANSACTION_DETAIL_TAB.DOCUMENTS)}
          >
            <FileText className="size-4" strokeWidth={2} />
            Documents
          </Button>

          <Button
            type="button"
            variant={
              activeTab === TRANSACTION_DETAIL_TAB.CHECKLIST
                ? "default"
                : "outline"
            }
            className={tabButtonClass(TRANSACTION_DETAIL_TAB.CHECKLIST)}
            onClick={() => setActiveTab(TRANSACTION_DETAIL_TAB.CHECKLIST)}
          >
            <CheckCircle2 className="size-4" strokeWidth={2} />
            Checklist
          </Button>

          <Button
            type="button"
            variant={
              activeTab === TRANSACTION_DETAIL_TAB.NOTES ? "default" : "outline"
            }
            className={tabButtonClass(TRANSACTION_DETAIL_TAB.NOTES)}
            onClick={() => setActiveTab(TRANSACTION_DETAIL_TAB.NOTES)}
          >
            <Notebook className="size-4" strokeWidth={2} />
            Notes
          </Button>

          <Button
            type="button"
            variant={
              activeTab === TRANSACTION_DETAIL_TAB.COMMUNICATION
                ? "default"
                : "outline"
            }
            className={tabButtonClass(TRANSACTION_DETAIL_TAB.COMMUNICATION)}
            onClick={() => setActiveTab(TRANSACTION_DETAIL_TAB.COMMUNICATION)}
          >
            <Send className="size-4" strokeWidth={2} />
            Communication
          </Button>
        </div>
      </div>

      <div
        ref={setScrollRef}
        className="
          subtle-scrollbar
          flex-1
          min-h-0
          overflow-y-auto
          pr-4
          pt-2
          pb-24
        "
        style={{
          scrollbarGutter: "stable",
        }}
      >
        <div
          ref={sentinelRef}
          className="h-px w-full shrink-0"
          aria-hidden="true"
        />

        <div>
          {activeTab === TRANSACTION_DETAIL_TAB.DETAILS ? (
            <TransactionDetailDetailsTab
              transaction={transaction}
              onSave={onUpdate}
              onDelete={onDelete}
            />
          ) : activeTab === TRANSACTION_DETAIL_TAB.DOCUMENTS ? (
            <TransactionDetailDocumentsTab
              transaction={transaction}
              transactionId={transaction.id}
              onSyncedFromApi={onSyncedFromApi}
            />
          ) : activeTab === TRANSACTION_DETAIL_TAB.CHECKLIST ? (
            <TransactionDetailChecklistTab
              transaction={transaction}
              highlightedTaskId={highlightedTaskId}
            />
          ) : activeTab === TRANSACTION_DETAIL_TAB.NOTES ? (
            <TransactionDetailNotesTab transactionId={transaction.id} />
          ) : (
            <TransactionDetailCommunicationTab
              transactionId={transaction.id}
              transactionAddress={transaction.address}
            />
          )}
        </div>
      </div>
    </div>
  );
}
