/**
 * Centralized messages for transaction service (errors, defaults).
 * Avoids loose strings in transaction-service.ts.
 */
export const TRANSACTION_SERVICE_MESSAGES = {
  ERROR_NO_ID_RETURNED:
    "Transaction was created but no ID was returned from the server.",
  DEFAULT_DESCRIPTION_PREFIX: "Transaction for",
} as const

export function defaultTransactionDescription(address: string): string {
  return `${TRANSACTION_SERVICE_MESSAGES.DEFAULT_DESCRIPTION_PREFIX} ${address}`
}
