import { Transaction } from "../types/transaction";
import apiClient from "./api";

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    const response = await apiClient.get("/transactions");

    return response.data;
  },

  getTransaction: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.get(`/transactions/${transactionId}`);
    return response.data;
  },

  createTransaction: async (
    transactionData: Partial<Transaction>
  ): Promise<Transaction> => {
    // Rails backend may expect data nested under 'transaction' key
    // Try both formats: direct and nested
    const payload = (transactionData as any).transaction 
      ? transactionData 
      : { transaction: transactionData };
    
    const response = await apiClient.post("/transactions", payload);
    return response.data;
  },

  updateTransaction: async (
    transactionId: string,
    updates: Partial<Transaction>
  ): Promise<Transaction> => {
    const response = await apiClient.put(
      `/transactions/${transactionId}`,
      updates
    );
    return response.data;
  },

  deleteTransaction: async (transactionId: string): Promise<void> => {
    await apiClient.delete(`/transactions/${transactionId}`);
  },
};
