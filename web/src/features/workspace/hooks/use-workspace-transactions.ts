"use client";

import { useCallback, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createTransactionFromDraft,
  deleteTransactionById,
  fetchUserTransactions,
  fetchTransactions,
  updateTransactionDetail,
} from "@/features/transactions/api/transaction-service";
import { TASK_QUERY_KEYS } from "@/features/tasks/constants";
import type { TaskListItem } from "@/features/tasks/types";
import {
  FETCH_USER_TRANSACTIONS_FILTER,
  type FetchUserTransactionsFilter,
} from "@/features/transactions/constants";
import type { TransactionFormData } from "@/features/transactions/types";
import { WORKSPACE_TRANSACTIONS_QUERY_KEY } from "@/features/workspace/constants";
import {
  ARCHIVED_TRANSACTION_STATUSES,
  TRANSACTION_STATUS,
  type TransactionStatus,
} from "@/features/workspace/status";
import type { Transaction } from "@/features/workspace/types";
import { toast } from "@/shared/hooks/use-toast";

type SaveOptions = {
  closeDialog?: boolean;
  formData?: TransactionFormData;
  sourceFileId?: string | null;
};

type UseWorkspaceTransactionsArgs = {
  onAfterSave: (shouldCloseDialog: boolean) => void;
  currentAgentName: string;
  /** When set, transactions are loaded from the backend. When null, fallback to local mock in dev. */
  userId: string | null;
  teamId?: string | null;
  /** When true (broker view), use GET /transactions for team scope. When false, use GET /transactions/user/:id. */
  useTeamScope?: boolean;
  transactionsFilter?: FetchUserTransactionsFilter;
};

type UseWorkspaceTransactionsReturn = {
  transactions: Transaction[];
  isTransactionsLoading: boolean;
  transactionsError: Error | null;
  refetchTransactions: () => void;
  handleSaveTransaction: (
    transaction: Transaction,
    options?: SaveOptions,
  ) => Promise<Transaction>;
  handleUpdateTransaction: (transaction: Transaction) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleTransactionStatusChanged: (transactionId: string, newStatus: TransactionStatus) => void;
};

const LOCAL_FALLBACK_FLAG = "NEXT_PUBLIC_ALLOW_LOCAL_TRANSACTION_FALLBACK";

function canUseLocalFallbackInDev(): boolean {
  const isDevelopment = process.env.NODE_ENV === "development";
  const rawFlag = process.env[LOCAL_FALLBACK_FLAG];

  if (!isDevelopment || !rawFlag) return false;

  const normalized = rawFlag.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes";
}

export function useWorkspaceTransactions({
  onAfterSave,
  currentAgentName,
  userId,
  teamId = null,
  useTeamScope = false,
  transactionsFilter = FETCH_USER_TRANSACTIONS_FILTER.ACTIVE,
}: UseWorkspaceTransactionsArgs): UseWorkspaceTransactionsReturn {
  const queryClient = useQueryClient();

  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);

  const enabled = useTeamScope || Boolean(userId);
  const queryKey = useMemo(
    () =>
      useTeamScope
        ? [...WORKSPACE_TRANSACTIONS_QUERY_KEY, "team", teamId]
        : [...WORKSPACE_TRANSACTIONS_QUERY_KEY, userId],
    [useTeamScope, teamId, userId],
  );
  const queryFn = useTeamScope
    ? () => fetchTransactions(teamId)
    : () => fetchUserTransactions(userId!);

  const {
    data: apiTransactions,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime: 30_000,
    // Team scope needs near-realtime updates from other contributors.
    refetchInterval: useTeamScope ? 10_000 : false,
    refetchOnWindowFocus: true,
  });

  const transactions = (enabled ? (apiTransactions ?? []) : localTransactions).filter(
    (transaction) => {
      const isArchived = ARCHIVED_TRANSACTION_STATUSES.includes(transaction.status);
      return transactionsFilter === FETCH_USER_TRANSACTIONS_FILTER.ARCHIVED
        ? isArchived
        : !isArchived;
    },
  );

  const invalidateList = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY,
    });
  }, [queryClient]);

  const handleSaveTransaction = useCallback(
    async (
      newTransaction: Transaction,
      options?: SaveOptions,
    ): Promise<Transaction> => {
      const shouldCloseDialog = options?.closeDialog ?? true;
      const { formData, sourceFileId } = options ?? {};
      const agentName = newTransaction.agentName ?? currentAgentName;
      const allowLocalFallback = canUseLocalFallbackInDev();

      let transactionToAdd: Transaction;
      try {
        if (!formData) {
          throw new Error("Cannot persist transaction: form data is missing.");
        }

        const created = await createTransactionFromDraft(formData, sourceFileId, {
          agentName,
          teamId: formData.teamId ?? teamId,
        });
        if (created.warnings?.length) {
          toast({
            title: "Transaction saved with warning",
            description: created.warnings[0],
          });
        }

        transactionToAdd = {
          id: created.id,
          address: created.address,
          price: newTransaction.price,
          status: TRANSACTION_STATUS.PENDING_INSPECTION,
          date: created.closeDate ?? newTransaction.date,
          progress: 0,
          hasTasks: false,
          buyers: newTransaction.buyers,
          sellers: newTransaction.sellers,
          parcelNumber: newTransaction.parcelNumber,
          mutualAcceptanceDate: newTransaction.mutualAcceptanceDate,
          agentName,
        };
        invalidateList();
      } catch (error) {
        if (!allowLocalFallback) {
          throw error;
        }

        console.warn(
          `[workspace] Backend transaction persistence failed. Using local fallback because ${LOCAL_FALLBACK_FLAG} is enabled in development.`,
          error,
        );

        transactionToAdd = {
          ...newTransaction,
          agentName,
        };
      }

      if (!userId) {
        setLocalTransactions((prev) => [transactionToAdd, ...prev]);
      }

      onAfterSave(shouldCloseDialog);

      return transactionToAdd;
    },
    [onAfterSave, currentAgentName, invalidateList, teamId, userId],
  );

  const handleUpdateTransaction = useCallback(
    async (updated: Transaction) => {
      if (enabled) {
        await updateTransactionDetail(updated);
        await refetchTransactions();
        return;
      }
      setLocalTransactions((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
    },
    [enabled, refetchTransactions],
  );

  const handleDeleteTransaction = useCallback(
    async (id: string) => {
      if (enabled) {
        await deleteTransactionById(id);
        queryClient.setQueryData<TaskListItem[]>(
          TASK_QUERY_KEYS.all,
          (previousTasks) =>
            (previousTasks ?? []).filter((task) => task.transactionId !== id),
        );

        await Promise.all([
          queryClient.invalidateQueries({ queryKey }),
          queryClient.invalidateQueries({ queryKey: ["transactions"] }),
          queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all }),
        ]);
        return;
      }
      setLocalTransactions((prev) => prev.filter((t) => t.id !== id));
    },
    [enabled, queryClient, queryKey],
  );

  const handleTransactionStatusChanged = useCallback(
    (transactionId: string, newStatus: TransactionStatus) => {
      queryClient.setQueryData<Transaction[]>(queryKey, (prev) =>
        prev?.map((t) =>
          t.id === transactionId ? { ...t, status: newStatus } : t,
        ),
      );
      queryClient.setQueryData<Transaction>(
        ["transaction-detail", transactionId],
        (prev) => (prev ? { ...prev, status: newStatus } : prev),
      );
      queryClient.invalidateQueries({
        queryKey: WORKSPACE_TRANSACTIONS_QUERY_KEY,
      });
    },
    [queryClient, queryKey],
  );

  return {
    transactions,
    isTransactionsLoading: enabled && isTransactionsLoading,
    transactionsError: transactionsError as Error | null,
    refetchTransactions,
    handleSaveTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleTransactionStatusChanged,
  };
}

