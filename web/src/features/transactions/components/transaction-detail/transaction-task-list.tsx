"use client";

import type { ChecklistTaskRowProps } from "@/features/transactions/components/transaction-detail/checklist-task-row";
import { ChecklistTaskRow } from "@/features/transactions/components/transaction-detail/checklist-task-row";

export type TransactionTaskListRow = ChecklistTaskRowProps & {
  rowKey: string;
};

type TransactionTaskListProps = {
  rows: TransactionTaskListRow[];
  className?: string;
};

export function TransactionTaskList({ rows, className }: TransactionTaskListProps) {
  return (
    <div className={className}>
      {rows.map(({ rowKey, ...rowProps }) => (
        <ChecklistTaskRow key={rowKey} {...rowProps} />
      ))}
    </div>
  );
}
