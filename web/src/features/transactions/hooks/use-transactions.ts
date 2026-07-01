"use client"

import { useQuery } from "@tanstack/react-query"
import apiService from "@/lib/api/apiService"
import { normalizeTransactionFromAPI } from "../utils/normalize-Transaction"
import type { Transaction } from "@/features/workspace/types"

export function useTransactions() {
	type ExtendedTransaction = Transaction & {
		deleted?: boolean
		deletedAt?: Date | null
	}

	return useQuery({
		queryKey: ["transactions"],
		queryFn: async (): Promise<Transaction[]> => {
			const response = await apiService.getTransactions()
			const transactions =
				Array.isArray(response.data?.data || response.data)
					? response.data?.data || response.data
					: []

			const normalizedTransactions = (transactions.map(
				normalizeTransactionFromAPI,
			) as unknown) as ExtendedTransaction[]

			const activeTransactions = normalizedTransactions.filter(
				(transaction) => !transaction.deleted && !transaction.deletedAt,
			)

			return activeTransactions
		},
		staleTime: 30 * 1000,
	})
}
