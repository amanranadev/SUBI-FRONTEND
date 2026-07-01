"use client";

import { cn } from "@/lib/utils";
import type { Transaction } from "@/features/workspace/types";
import type { TransactionStatus } from "@/features/workspace/status";
import { TransactionCard } from "./transaction-card";
import { Txt } from "@/shared/ui";

type ViewMode = "grid" | "list";

type AgentGroupedTransactionsProps = {
  viewMode: ViewMode;
  transactions: Transaction[];
  getAgentDisplayName?: (transaction: Transaction) => string | null;
  getAgentGroup?: (
    transaction: Transaction,
  ) => { key: string; label: string } | null;
  onStatusChanged?: (transactionId: string, newStatus: TransactionStatus) => void;
};

export function AgentGroupedTransactions({
  viewMode,
  transactions,
  getAgentDisplayName,
  getAgentGroup,
  onStatusChanged,
}: AgentGroupedTransactionsProps) {
  const groups = transactions.reduce<
    Array<{ key: string; agentName: string; transactions: Transaction[] }>
  >((acc, transaction) => {
    const customGroup = getAgentGroup?.(transaction) ?? null;
    if (getAgentGroup) {
      const fallbackAgentName =
        getAgentDisplayName?.(transaction)?.trim() ??
        transaction.agentName?.trim() ??
        null;
      const fallbackUserId = transaction.userId?.trim() ?? null;
      const groupKey =
        customGroup?.key?.trim() ?? fallbackUserId ?? fallbackAgentName;
      const groupLabel =
        customGroup?.label?.trim() ??
        fallbackAgentName ??
        (fallbackUserId ? "Team member" : null);

      if (!groupKey || !groupLabel) {
        return acc;
      }

      const group = acc.find((entry) => entry.key === groupKey);
      if (group) {
        group.transactions.push(transaction);
      } else {
        acc.push({
          key: groupKey,
          agentName: groupLabel,
          transactions: [transaction],
        });
      }
      return acc;
    }

    const fallbackAgentName =
      getAgentDisplayName?.(transaction)?.trim() ??
      transaction.agentName?.trim() ??
      null;

    const groupKey = transaction.userId?.trim() || fallbackAgentName || null;
    const groupLabel = fallbackAgentName;

    if (!groupKey || !groupLabel) {
      return acc;
    }
    const group = acc.find((entry) => entry.key === groupKey);
    if (group) {
      group.transactions.push(transaction);
    } else {
      acc.push({
        key: groupKey,
        agentName: groupLabel,
        transactions: [transaction],
      });
    }
    return acc;
  }, []);

  if (groups.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-12 text-sm">
        No agent transactions found for this team yet.
      </p>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {groups.map((group) => (
        <section key={group.key} className="space-y-5">
          <div className="flex items-center gap-2 border-b border-black/[0.05] pb-3">
            <Txt as="h3" size="3xl" weight="bold" className="tracking-tighter">
              {group.agentName}
            </Txt>
            <Txt className="text-[10px] font-medium text-muted-foreground border border-black/[0.05] rounded-full px-2 py-1 shadow-sm">
              {group.transactions.length} files in process
            </Txt>
          </div>
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                : "space-y-6",
            )}
          >
            {group.transactions.map((t) => (
              <TransactionCard
                key={t.id}
                transaction={t}
                viewMode={viewMode}
                onStatusChanged={onStatusChanged}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
