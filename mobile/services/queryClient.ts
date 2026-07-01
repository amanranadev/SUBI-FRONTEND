import { ApiError } from "@/types/auth";
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,

      retry: (failureCount, error) => {
        if (error instanceof Error && "status" in error) {
          const status = (error as ApiError).status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }

        return failureCount < 3;
      },

      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: (failureCount, error) => {
        if (error instanceof Error && "status" in error) {
          const status = (error as ApiError).status;
          if (status && status >= 400 && status < 500) {
            return false;
          }
        }

        return failureCount < 2;
      },

      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    profile: () => [...queryKeys.auth.all, "profile"] as const,
  },
  transactions: {
    all: ["transactions"] as const,
    lists: () => [...queryKeys.transactions.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.transactions.lists(), filters] as const,
    details: () => [...queryKeys.transactions.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.transactions.details(), id] as const,
    user: (userId: string) =>
      [...queryKeys.transactions.all, "user", userId] as const,
    urgent: (userId: string) =>
      [...queryKeys.transactions.all, "urgent", userId] as const,
    dueDates: (userId: string) =>
      [...queryKeys.transactions.all, "dueDates", userId] as const,
  },
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...queryKeys.tasks.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.tasks.lists(), filters] as const,
    details: () => [...queryKeys.tasks.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
    transaction: (transactionId: string) =>
      [...queryKeys.tasks.all, "transaction", transactionId] as const,
  },
} as const;
