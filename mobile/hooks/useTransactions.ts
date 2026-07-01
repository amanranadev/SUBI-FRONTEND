import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionService } from "../services/transactionService";
import { Transaction } from "../types/transaction";

// Query keys
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...transactionKeys.lists(), { filters }] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
};

// Individual hooks
export const useTransactions = () => {
  return useQuery({
    queryKey: transactionKeys.lists(),
    queryFn: transactionService.getTransactions,
  });
};

export const useTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: transactionKeys.detail(transactionId),
    queryFn: () => transactionService.getTransaction(transactionId),
    enabled: !!transactionId,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionService.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      updates,
    }: {
      transactionId: string;
      updates: Partial<Transaction>;
    }) => transactionService.updateTransaction(transactionId, updates),
    onSuccess: (_, { transactionId }) => {
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(transactionId),
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: transactionService.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
    },
  });
};

export const useTransactionManagement = (transactionId?: string) => {
  const transactionsQuery = useTransactions();
  const transactionQuery = useTransaction(transactionId!);
  const createTransactionMutation = useCreateTransaction();
  const updateTransactionMutation = useUpdateTransaction();
  const deleteTransactionMutation = useDeleteTransaction();

  return {
    transactions: transactionsQuery.data || [],
    transaction: transactionQuery.data,
    isLoading: transactionsQuery.isLoading,
    isLoadingTransaction: transactionQuery.isLoading,
    isSuccessTransactions: transactionsQuery.isSuccess,
    isSuccessTransaction: transactionQuery.isSuccess,
    isError: transactionsQuery.isError,
    error: transactionsQuery.error,
    refetch: transactionsQuery.refetch,

    // Mutations
    createTransaction: createTransactionMutation.mutate,
    updateTransaction: updateTransactionMutation.mutate,
    deleteTransaction: deleteTransactionMutation.mutate,

    // Mutation states
    isCreating: createTransactionMutation.isPending,
    isUpdating: updateTransactionMutation.isPending,
    isDeleting: deleteTransactionMutation.isPending,

    // Success states
    isCreateSuccess: createTransactionMutation.isSuccess,
    isUpdateSuccess: updateTransactionMutation.isSuccess,
    isDeleteSuccess: deleteTransactionMutation.isSuccess,

    // Error states
    isCreateError: createTransactionMutation.isError,
    isUpdateError: updateTransactionMutation.isError,
    isDeleteError: deleteTransactionMutation.isError,

    // Errors
    createError: createTransactionMutation.error,
    updateError: updateTransactionMutation.error,
    deleteError: deleteTransactionMutation.error,
  };
};
