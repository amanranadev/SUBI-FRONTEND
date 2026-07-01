"use client";

import type { Transaction } from "@/features/workspace/types";
import { GenericTaskModal } from "@/features/tasks/components/generic-task-modal";
import {
  TransactionTaskList,
} from "@/features/transactions/components/transaction-detail/transaction-task-list";
import {
  TRANSACTION_TASK_TYPES,
} from "@/features/transactions/types/transaction-type";
import {
  ConfirmModal,
  Txt,
} from "@/shared/ui";
import { useTransactionFormsAndTasks } from "../../hooks/use-transaction-forms-and-tasks";

type TransactionDetailFormsAndTasksSectionProps = {
  transaction: Transaction;
};

export function TransactionDetailFormsAndTasksSection({
  transaction,
}: TransactionDetailFormsAndTasksSectionProps) {
  const {
    tasks,
    isLoading,
    isModalOpen,
    setIsModalOpen,
    editingTask,
    setEditingTask,
    confirmModalRef,
    handleSaveTask,
    taskRows,
  } = useTransactionFormsAndTasks({ transaction });

  return (
    <div className="space-y-6">
      <GenericTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        initialData={
          editingTask ?? {
            transactionId: transaction.id,
            type: TRANSACTION_TASK_TYPES.TASK,
          }
        }
        title={editingTask ? "Edit item" : "Add item"}
        subtitle="Forms and tasks are stored as transaction tasks."
        showTransactionSelector={false}
        availableTasks={tasks}
      />

      {isLoading ? (
        <Txt as="p" size="sm" tone="muted">
          Loading forms and tasks...
        </Txt>
      ) : tasks.length === 0 ? (
        <div className="glass-card rounded-[2rem] border-white/60 p-8 text-sm font-medium opacity-60 dark:border-white/10">
          No forms or tasks linked to this transaction yet.
        </div>
      ) : (
        <TransactionTaskList rows={taskRows} className="space-y-4" />
      )}

      <ConfirmModal ref={confirmModalRef} />
    </div>
  );
}
