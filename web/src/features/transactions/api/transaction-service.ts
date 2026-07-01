import { apiClient } from "@/lib/api/client";
import { TRANSACTION_ENDPOINTS } from "./endpoints";
import type { TransactionFormData } from "../types";
import { TRANSACTION_API_STATUS } from "../constants";
import {
  FETCH_USER_TRANSACTIONS_FILTER,
  type FetchUserTransactionsFilter,
} from "../constants";
import { parseCurrencyToNumber, parseDateToISO } from "@/shared/utils/format";
import { TRANSACTION_SERVICE_MESSAGES } from "./transaction-service-messages";
import {
  buildCreatePayload,
  type CreateTransactionDraftOptions,
} from "./build-create-payload";
import {
  applyChecklistTemplateToTransaction,
  applyChecklistToTransaction,
} from "./checklist-service";
import {
  mapApiTransactionToTransaction,
  type ApiTransactionListItem,
} from "./map-api-transaction";
import type { Transaction } from "@/features/workspace/types";
import type { TransactionStatus } from "@/features/workspace/status";
import { buildUpdateTransactionPayload } from "@/features/transactions/utils/build-update-transaction-payload";

// --- Create transaction from draft ---

export type { CreateTransactionDraftOptions };

export type CreateTransactionResponse = {
  id: string;
  address: string;
  amount: number;
  status?: string;
  closeDate?: string;
  warnings?: string[];
};

const CHECKLIST_APPLY_RETRY_DELAYS_MS = [250, 750] as const;

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function applyChecklistWithRetry(input: {
  transactionId: string;
  checklistId: string;
  baseDate?: string;
}): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= CHECKLIST_APPLY_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await applyChecklistToTransaction({
        transactionId: input.transactionId,
        checklistId: input.checklistId,
        baseDate: input.baseDate,
      });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === CHECKLIST_APPLY_RETRY_DELAYS_MS.length) break;
      await sleep(CHECKLIST_APPLY_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

async function applyChecklistTemplateWithRetry(input: {
  transactionId: string;
  checklistTemplateId: string;
  baseDate?: string;
}): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= CHECKLIST_APPLY_RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      await applyChecklistTemplateToTransaction({
        transactionId: input.transactionId,
        checklistTemplateId: input.checklistTemplateId,
        baseDate: input.baseDate,
      });
      return;
    } catch (error) {
      lastError = error;
      if (attempt === CHECKLIST_APPLY_RETRY_DELAYS_MS.length) break;
      await sleep(CHECKLIST_APPLY_RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}

export async function createTransactionFromDraft(
  formData: TransactionFormData,
  userUploadId?: string | null,
  options?: CreateTransactionDraftOptions,
): Promise<CreateTransactionResponse> {
  const payload = buildCreatePayload(formData, userUploadId, options);

  const { data } = await apiClient.post<CreateTransactionResponse>(
    TRANSACTION_ENDPOINTS.create,
    payload,
  );

  const id = data?.id;
  if (!id) {
    throw new Error(TRANSACTION_SERVICE_MESSAGES.ERROR_NO_ID_RETURNED);
  }

  const warnings: string[] = [];
  if (formData.checklistTemplateId) {
    try {
      await applyChecklistTemplateWithRetry({
        transactionId: String(id),
        checklistTemplateId: formData.checklistTemplateId,
        baseDate: parseDateToISO(formData.closeDate) ?? undefined,
      });
    } catch (error) {
      console.error(
        "[transactions] checklist-template-apply-failed-after-retries",
        {
          transactionId: String(id),
          checklistTemplateId: formData.checklistTemplateId,
          error,
        },
      );
      warnings.push(
        "Transaction was saved, but saved checklist template could not be attached. Open the transaction and apply template again.",
      );
    }
  } else if (formData.checklistId) {
    try {
      await applyChecklistWithRetry({
        transactionId: String(id),
        checklistId: formData.checklistId,
        baseDate: parseDateToISO(formData.closeDate) ?? undefined,
      });
    } catch (error) {
      console.error(
        "[transactions] checklist-apply-failed-after-retries",
        {
          transactionId: String(id),
          checklistId: formData.checklistId,
          error,
        },
      );
      warnings.push(
        "Transaction was saved, but checklist could not be attached. Open the transaction and apply checklist again.",
      );
    }
  }

  return {
    id: String(id),
    address: data?.address ?? formData.address,
    amount: data?.amount ?? parseCurrencyToNumber(formData.price),
    status: data?.status ?? TRANSACTION_API_STATUS.PENDING_INSPECTION,
    closeDate:
      data?.closeDate ?? parseDateToISO(formData.closeDate) ?? undefined,
    ...(warnings.length > 0 ? { warnings } : {}),
  };
}

// --- List transactions ---

export type { ApiTransactionListItem };

export { mapApiTransactionToTransaction };

export type FetchUserTransactionsOptions = {
  status?: FetchUserTransactionsFilter;
};

type TransactionListResponse =
  | ApiTransactionListItem[]
  | { data?: ApiTransactionListItem[] };

function extractTransactionList(
  response: TransactionListResponse | null | undefined,
): ApiTransactionListItem[] {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

/** List transactions for the current user (agent view). */
export async function fetchUserTransactions(
  userId: string,
  options?: FetchUserTransactionsOptions,
): Promise<Transaction[]> {
  const params =
    options?.status === FETCH_USER_TRANSACTIONS_FILTER.ARCHIVED
      ? { status: FETCH_USER_TRANSACTIONS_FILTER.ARCHIVED }
      : undefined;

  const { data } = await apiClient.get<TransactionListResponse>(
    TRANSACTION_ENDPOINTS.listByUser(userId),
    { params },
  );

  const list = extractTransactionList(data);
  // Backend /transactions/user/:id doesn't return user_id — inject it since all results belong to this user
  return list.map((item) => mapApiTransactionToTransaction({ ...item, user_id: item.user_id ?? item.userId ?? userId }));
}

/** List all transactions the current user can access (broker: team transactions). Uses GET /transactions with X-Team-Id. */
export async function fetchTransactions(
  teamId?: string | null,
): Promise<Transaction[]> {
  const { data } = await apiClient.get<TransactionListResponse>(
    TRANSACTION_ENDPOINTS.list,
    teamId ? { params: { team_id: teamId } } : undefined,
  );
  const list = extractTransactionList(data);
  return list.map(mapApiTransactionToTransaction);
}

/** Fetch a single transaction with full detail fields. */
export async function fetchTransactionById(
  transactionId: string,
): Promise<Transaction> {
  const { data } = await apiClient.get<ApiTransactionListItem>(
    TRANSACTION_ENDPOINTS.get(transactionId),
  );
  return mapApiTransactionToTransaction(data);
}

// --- Update transaction status (PUT /transactions/:id) ---

export type UpdateTransactionStatusPayload = {
  status: TransactionStatus;
};

export async function updateTransactionStatus(
  transactionId: string,
  payload: UpdateTransactionStatusPayload,
): Promise<void> {
  await apiClient.put(TRANSACTION_ENDPOINTS.update(transactionId), {
    status: payload.status,
  });
}

/** Full transaction row update (details tab). */
export async function updateTransactionDetail(
  transaction: Transaction,
): Promise<void> {
  const body = buildUpdateTransactionPayload(transaction);
  await apiClient.put(TRANSACTION_ENDPOINTS.update(transaction.id), body);
}

export async function deleteTransactionById(
  transactionId: string,
): Promise<void> {
  await apiClient.delete(TRANSACTION_ENDPOINTS.delete(transactionId));
}
