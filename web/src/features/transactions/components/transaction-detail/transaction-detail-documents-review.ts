import { parseCurrencyToNumber, parseDateToISO } from "@/shared/utils/format";
import type { RawTransactionData } from "@/features/transactions/types";
import type { Transaction } from "@/features/workspace/types";
import type { TransactionReprocessChange } from "./transaction-document-reprocess-review-modal";

export function getActionErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "response" in error) {
    const axiosError = error as {
      response?: { status?: number; data?: { error?: string } };
    };
    if (axiosError.response?.status === 404) {
      return "This endpoint is not available on the backend yet.";
    }
    if (axiosError.response?.data?.error) {
      return axiosError.response.data.error;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

function formatReviewValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => String(entry).trim())
      .filter(Boolean)
      .join(", ");
    return normalized || "—";
  }
  return String(value);
}

function normalizeItemsThatStay(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(/[;,\n]/)
        .map((entry) => entry.trim())
        .filter(Boolean);
    }
  }
  return [];
}

function resolveEarnestMoneyValue(
  value: RawTransactionData["earnestMoney"] | Transaction["earnestMoney"],
): number {
  if (typeof value === "object" && value !== null && "value" in value) {
    return parseCurrencyToNumber(value.value);
  }
  return parseCurrencyToNumber(value as string | number | null | undefined);
}

export function buildReviewFromReprocess(
  transaction: Transaction,
  analysis: RawTransactionData,
): { changes: TransactionReprocessChange[]; payload: Record<string, unknown> } {
  const changes: TransactionReprocessChange[] = [];
  const payload: Record<string, unknown> = {};

  const currentCloseDateIso = parseDateToISO(transaction.date);
  const nextCloseDateIso = parseDateToISO(analysis.closeDate ?? "");
  if (nextCloseDateIso && nextCloseDateIso !== currentCloseDateIso) {
    changes.push({
      key: "closeDate",
      label: "Closing date",
      currentValue: formatReviewValue(transaction.date),
      nextValue: formatReviewValue(analysis.closeDate),
    });
    payload.closeDate = nextCloseDateIso;
  }

  const currentPendDateIso = parseDateToISO(transaction.mutualAcceptanceDate ?? "");
  const nextPendDateIso = parseDateToISO(analysis.pendDate ?? "");
  if (nextPendDateIso && nextPendDateIso !== currentPendDateIso) {
    changes.push({
      key: "pendDate",
      label: "Mutual acceptance date",
      currentValue: formatReviewValue(transaction.mutualAcceptanceDate),
      nextValue: formatReviewValue(analysis.pendDate),
    });
    payload.pendDate = nextPendDateIso;
  }

  const currentAmount = parseCurrencyToNumber(transaction.price);
  const nextAmount = parseCurrencyToNumber(analysis.amount);
  if (nextAmount > 0 && nextAmount !== currentAmount) {
    changes.push({
      key: "amount",
      label: "Purchase price",
      currentValue: formatReviewValue(transaction.price),
      nextValue: formatReviewValue(analysis.amount),
    });
    payload.amount = nextAmount;
  }

  const currentEarnestMoney = resolveEarnestMoneyValue(transaction.earnestMoney);
  const nextEarnestMoney = resolveEarnestMoneyValue(analysis.earnestMoney);
  if (nextEarnestMoney > 0 && nextEarnestMoney !== currentEarnestMoney) {
    changes.push({
      key: "earnestMoney",
      label: "Earnest money",
      currentValue: formatReviewValue(transaction.earnestMoney),
      nextValue: formatReviewValue(nextEarnestMoney),
    });
    payload.earnestMoney = nextEarnestMoney;
  }

  const currentParcel = (transaction.parcelNumber ?? "").trim();
  const nextParcel = (analysis.parcelNumber ?? "").trim();
  if (nextParcel && nextParcel !== currentParcel) {
    changes.push({
      key: "parcelNumber",
      label: "Parcel number",
      currentValue: formatReviewValue(currentParcel),
      nextValue: formatReviewValue(nextParcel),
    });
    payload.parcel_number = nextParcel;
  }

  const currentPsaType = (transaction.psaType ?? "").trim().toUpperCase();
  const nextPsaType = (analysis.psaType ?? "").trim().toUpperCase();
  if (nextPsaType && nextPsaType !== currentPsaType) {
    changes.push({
      key: "psaType",
      label: "PSA type",
      currentValue: formatReviewValue(transaction.psaType),
      nextValue: formatReviewValue(analysis.psaType),
    });
    payload.psa_type = nextPsaType;
  }

  const currentTitle = (transaction.titleCompany ?? "").trim();
  const nextTitle = (analysis.titleCo ?? "").trim();
  if (nextTitle && nextTitle !== currentTitle) {
    changes.push({
      key: "titleCo",
      label: "Title company",
      currentValue: formatReviewValue(currentTitle),
      nextValue: formatReviewValue(nextTitle),
    });
    payload.title_co = nextTitle;
  }

  const currentEscrowOfficer = (transaction.closingAgent ?? "").trim();
  const nextEscrowOfficer = (analysis.closingAgent ?? analysis.escrowOfficer ?? "").trim();
  if (nextEscrowOfficer && nextEscrowOfficer !== currentEscrowOfficer) {
    changes.push({
      key: "escrowOfficer",
      label: "Escrow officer",
      currentValue: formatReviewValue(currentEscrowOfficer),
      nextValue: formatReviewValue(nextEscrowOfficer),
    });
    payload.escrow_officer = nextEscrowOfficer;
  }

  const currentEscrowEmail = (transaction.escrowEmail ?? "").trim();
  const nextEscrowEmail = (analysis.escrowEmail ?? "").trim();
  if (nextEscrowEmail && nextEscrowEmail !== currentEscrowEmail) {
    changes.push({
      key: "escrowEmail",
      label: "Escrow email",
      currentValue: formatReviewValue(currentEscrowEmail),
      nextValue: formatReviewValue(nextEscrowEmail),
    });
    payload.escrow_agent_email = nextEscrowEmail;
  }

  const currentLender = (transaction.lender ?? "").trim();
  const nextLender = (analysis.lender ?? "").trim();
  if (nextLender && nextLender !== currentLender) {
    changes.push({
      key: "lender",
      label: "Lender",
      currentValue: formatReviewValue(currentLender),
      nextValue: formatReviewValue(nextLender),
    });
    payload.lender = nextLender;
  }

  const currentNwmls = (transaction.nwmlsNumber ?? "").trim();
  const nextNwmls = (analysis.nwmlsNumber ?? "").trim();
  if (nextNwmls && nextNwmls !== currentNwmls) {
    changes.push({
      key: "nwmlsNumber",
      label: "NWMLS number",
      currentValue: formatReviewValue(currentNwmls),
      nextValue: formatReviewValue(nextNwmls),
    });
    payload.nwmls_number = nextNwmls;
  }

  const currentDescription = (transaction.description ?? "").trim();
  const nextDescription = (analysis.description ?? "").trim();
  if (nextDescription && nextDescription !== currentDescription) {
    changes.push({
      key: "description",
      label: "Description",
      currentValue: formatReviewValue(currentDescription),
      nextValue: formatReviewValue(nextDescription),
    });
    payload.description = nextDescription;
  }

  const currentItems = normalizeItemsThatStay(transaction.itemsThatStay);
  const nextItems = normalizeItemsThatStay(analysis.itemsThatStay);
  if (nextItems.length > 0 && JSON.stringify(nextItems) !== JSON.stringify(currentItems)) {
    changes.push({
      key: "itemsThatStay",
      label: "Items that stay",
      currentValue: formatReviewValue(currentItems),
      nextValue: formatReviewValue(nextItems),
    });
    payload.itemsThatStay = JSON.stringify(nextItems);
  }

  return { changes, payload };
}
