"use client";

import Link from "next/link";
import { useCallback, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { TransactionDetail } from "@/features/transactions/components/transaction-detail";
import { fetchTransactionById } from "@/features/transactions/api/transaction-service";
import { useWorkspace } from "@/features/workspace/context";
import { TRANSACTIONS_ROUTES } from "@/features/transactions/routes";
import { useAuth } from "@/lib/auth/context";
import { Skeleton, Txt } from "@/shared/ui";

export default function TransactionDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const detailContentScrollRef = useRef<HTMLDivElement | null>(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    transactions,
    isTransactionsLoading,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleTransactionStatusChanged,
    refetchTransactions,
  } = useWorkspace();

  const {
    data: detailedTransaction,
    isLoading: isDetailLoading,
    isError: isDetailError,
    refetch: refetchDetail,
  } = useQuery({
    queryKey: ["transaction-detail", params.id],
    queryFn: () => fetchTransactionById(params.id),
    enabled: Boolean(params.id) && Boolean(user?.id) && !isAuthLoading,
    staleTime: 30_000,
  });

  const transaction = useMemo(
    () =>
      detailedTransaction ??
      transactions.find((item) => item.id === params.id) ??
      null,
    [detailedTransaction, transactions, params.id],
  );

  const handlePageWheel = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      const scrollArea = detailContentScrollRef.current;
      if (!scrollArea) return;

      const target = event.target as Node | null;
      if (target && scrollArea.contains(target)) return;

      const maxScrollTop = scrollArea.scrollHeight - scrollArea.clientHeight;
      if (maxScrollTop <= 0) return;

      const nextScrollTop = Math.max(
        0,
        Math.min(maxScrollTop, scrollArea.scrollTop + event.deltaY),
      );

      if (nextScrollTop === scrollArea.scrollTop) return;

      scrollArea.scrollTop = nextScrollTop;
      event.preventDefault();
    },
    [],
  );

  if (
    !transaction &&
    (isTransactionsLoading || isDetailLoading || isAuthLoading)
  ) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-10 pb-32">
        <div className="flex items-center gap-8">
          <Skeleton className="h-5 w-44 rounded-full" />
          <Skeleton className="h-3 w-72 rounded-full" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-12 w-32 rounded-2xl" />
          <Skeleton className="h-11 w-3/5 rounded-2xl" />
          <Skeleton className="h-8 w-56 rounded-2xl" />
        </div>
        <div className="space-y-6 rounded-[2rem] bg-black/[0.03] p-8">
          <Skeleton className="h-8 w-52 rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-[1.5rem]" />
          <Skeleton className="h-32 w-full rounded-[1.5rem]" />
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="w-full max-w-4xl mx-auto py-20">
        <Txt className="text-lg font-medium text-muted-foreground mb-4">
          Transaction not found.
        </Txt>
        <Link href={TRANSACTIONS_ROUTES.ROOT} className="underline">
          Back to transactions
        </Link>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-5xl mx-auto h-full min-h-0 flex flex-col overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500"
      onWheel={handlePageWheel}
      style={{
        gap: isHeaderCollapsed ? "15px" : "40px",
        transition: "gap 100ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div className="shrink-0 space-y-4">
        <div className="flex items-center gap-8">
          <button
            onClick={() => router.push(TRANSACTIONS_ROUTES.ROOT)}
            className="flex items-center gap-2 text-sm font-bold opacity-40 hover:opacity-100 transition-all hover:-translate-x-1 shrink-0"
          >
            <ArrowLeft className="size-4" /> Back to Transactions
          </button>
          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest opacity-30">
            <span>Transactions</span>
            <ChevronRight className="size-3" />
            <span>{transaction.address}</span>
          </div>
        </div>
        {isDetailError ? (
          <Txt className="text-sm text-muted-foreground">
            Could not load full transaction details. Showing list data only.
          </Txt>
        ) : null}
      </div>

      <TransactionDetail
        transaction={transaction}
        contentScrollRef={detailContentScrollRef}
        onHeaderCollapseChange={setIsHeaderCollapsed}
        onUpdate={handleUpdateTransaction}
        onStatusChanged={handleTransactionStatusChanged}
        onSyncedFromApi={() => {
          void Promise.all([refetchTransactions(), refetchDetail()]);
        }}
        onDelete={async (id) => {
          await handleDeleteTransaction(id);
          router.push(TRANSACTIONS_ROUTES.ROOT);
        }}
      />
    </div>
  );
}
