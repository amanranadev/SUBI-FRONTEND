"use client";

import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/features/workspace/types";
import type { TransactionStatus } from "@/features/workspace/status";
import { TransactionCard } from "./transaction-card";
import { AgentGroupedTransactions } from "./agent-grouped-transactions";
import { TransactionsListSkeleton } from "./transactions-list-skeleton";

type ViewMode = "grid" | "list";

type TransactionsListContentProps = {
  viewMode: ViewMode;
  isLoading: boolean;
  error: Error | null;
  transactions: Transaction[];
  groupByAgent?: boolean;
  getAgentDisplayName?: (transaction: Transaction) => string | null;
  getAgentGroup?: (
    transaction: Transaction,
  ) => { key: string; label: string } | null;
  onRetry: () => void;
  onStatusChanged?: (transactionId: string, newStatus: TransactionStatus) => void;
};

export function TransactionsListContent({
  viewMode,
  isLoading,
  error,
  transactions,
  groupByAgent = false,
  getAgentDisplayName,
  getAgentGroup,
  onRetry,
  onStatusChanged,
}: TransactionsListContentProps) {
  if (isLoading) {
    return <TransactionsListSkeleton viewMode={viewMode} />;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="rounded-2xl">
        <AlertTitle>Could not load transactions</AlertTitle>
        <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
          {error.message}
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="mt-1"
          >
            Try again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (transactions.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12 text-sm">
        No transactions yet. Create one from a document.
      </p>
    );
  }

  if (groupByAgent) {
    return (
      <AgentGroupedTransactions
        viewMode={viewMode}
        transactions={transactions}
        getAgentDisplayName={getAgentDisplayName}
        getAgentGroup={getAgentGroup}
        onStatusChanged={onStatusChanged}
      />
    );
  }

  return (
    <div
      className={cn(
        "animate-in fade-in duration-500",
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          : "space-y-6",
      )}
    >
      {transactions.map((t) => (
        <TransactionCard
          key={t.id}
          transaction={t}
          viewMode={viewMode}
          onStatusChanged={onStatusChanged}
        />
      ))}
    </div>
  );
}
