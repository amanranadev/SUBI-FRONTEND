"use client";

import Link from "next/link";
import { AnimatedProgress } from "@/shared/ui/animated-progress";
import { TransactionStatusSelect } from "./transaction-status-select";
import type { Transaction } from "@/features/workspace/types";
import type { TransactionStatus } from "@/features/workspace/status";

type ViewMode = "grid" | "list";

type TransactionCardProps = {
  transaction: Transaction;
  viewMode: ViewMode;
  onStatusChanged?: (transactionId: string, newStatus: TransactionStatus) => void;
};

export function TransactionCard({
  transaction,
  viewMode,
  onStatusChanged,
}: TransactionCardProps) {
  const href = `/transactions/${transaction.id}`;

  if (viewMode === "list") {
    return (
      <Link
        href={href}
        className="group glass-card rounded-[2rem] p-6 flex items-center justify-between transition-all hover:scale-[1.005] shadow-default border-white/80 dark:border-white/10"
      >
        <div className="flex items-center gap-8">
          <div className="space-y-0.5">
            <h3 className="text-lg font-bold tracking-tighter leading-tight group-hover:text-foreground/70 transition-colors">
              {transaction.address}
            </h3>
            <p className="text-sm font-bold opacity-40 tracking-tighter">
              {transaction.price}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-12">
          <TransactionStatusSelect
            transactionId={transaction.id}
            transactionStatus={transaction.status}
            onStatusChanged={onStatusChanged}
            size="sm"
          />
          <span className="text-sm font-bold opacity-60 tracking-tighter">
            {transaction.date}
          </span>
          {transaction.hasTasks && (
            <span className="text-sm font-bold text-primary tracking-tighter">
              {transaction.progress}%
            </span>
          )}
          <span className="h-9 px-6 rounded-xl bg-foreground text-background font-bold text-xs inline-flex items-center">
            View
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group glass-card rounded-[3rem] p-8 flex flex-col gap-6 transition-all hover:scale-[1.01] shadow-default border-white/80 dark:border-white/10"
    >
      <div className="flex items-center justify-between">
        <TransactionStatusSelect
          transactionId={transaction.id}
          transactionStatus={transaction.status}
          onStatusChanged={onStatusChanged}
        />
        <span className="text-[10px] font-bold opacity-30 tracking-widest uppercase">
          {transaction.date}
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="text-xl font-bold tracking-tighter leading-tight group-hover:text-foreground/70 transition-colors">
          {transaction.address}
        </h3>
        <p className="text-base font-bold opacity-40 tracking-tighter">
          {transaction.price}
        </p>
      </div>
      {transaction.hasTasks && (
        <div className="space-y-3 mt-auto">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest opacity-40">
            <span>Transaction Progress</span>
            <span>{transaction.progress}%</span>
          </div>
          <AnimatedProgress
            value={transaction.progress}
            className="h-1.5 bg-black/5"
            striped={false}
          />
        </div>
      )}
    </Link>
  );
}
