import type { TransactionResultState } from "@/components/TransactionResultDrawer";
import type { PersonInfo } from "@/components/PersonInfoList";
import type { BuyerSeller } from "@/types/transaction";
import type { ExtractedData } from "@/types/document";
import type { PSAFormData } from "@/types/transactionForm";

import { resolveDrawerPsaType } from "@/utils/mapExtractedDataToDrawerState";

export interface HomeTransactionSaveContext {
  uploadedFileId: string | null;
  extractedData: ExtractedData | null;
}

interface RawBuyerSeller {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
}

function mapPersonToBuyerSeller(person: PersonInfo): BuyerSeller {
  return {
    firstName: person.firstName.trim(),
    lastName: person.lastName.trim(),
    email: person.email.trim(),
    phone: person.phone?.trim() ?? "",
    representing: false,
    isFromAPI: false,
  };
}

function extractPartiesFromData(
  data: Record<string, unknown>,
  party: "buyers" | "sellers",
): BuyerSeller[] {
  const buyersAndSellers = data.buyersandsellers;
  let parties: RawBuyerSeller[] = [];

  if (Array.isArray(buyersAndSellers) && buyersAndSellers.length > 0) {
    const firstEntry = buyersAndSellers[0] as Record<string, unknown>;
    if (Array.isArray(firstEntry[party])) {
      parties = firstEntry[party] as RawBuyerSeller[];
    }
  } else if (
    buyersAndSellers &&
    typeof buyersAndSellers === "object" &&
    Array.isArray((buyersAndSellers as Record<string, unknown>)[party])
  ) {
    parties = (buyersAndSellers as Record<string, unknown>)[party] as RawBuyerSeller[];
  } else if (typeof buyersAndSellers === "string") {
    try {
      const parsed = JSON.parse(buyersAndSellers) as Record<string, RawBuyerSeller[]>;
      parties = parsed[party] ?? [];
    } catch {
      parties = [];
    }
  }

  if (parties.length === 0 && Array.isArray(data[party])) {
    parties = data[party] as RawBuyerSeller[];
  }

  return parties
    .filter((entry) => entry && typeof entry === "object")
    .map((entry) => ({
      firstName: entry.firstName?.trim() ?? "",
      lastName: entry.lastName?.trim() ?? "",
      email: entry.email?.trim() ?? "",
      phone: entry.phone?.trim() ?? "",
      representing: false,
      isFromAPI: true,
    }));
}

function buildCityState(city: string, state: string): string | undefined {
  const parts = [city.trim(), state.trim()].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : undefined;
}

function resolveCounty(context: HomeTransactionSaveContext): string {
  const extracted = context.extractedData;
  if (!extracted) {
    return "";
  }

  return (
    extracted.dealSummary?.county ??
    (typeof extracted.data?.county === "string" ? extracted.data.county : "") ??
    ""
  );
}

function resolvePropertyType(
  drawerPsaType: string,
  context: HomeTransactionSaveContext,
): string {
  const trimmed = drawerPsaType.trim();
  if (trimmed && trimmed.toUpperCase() !== "PSA") {
    return trimmed;
  }

  const extracted = context.extractedData?.data;
  if (!extracted || typeof extracted !== "object") {
    return "RESIDENTIAL";
  }

  return resolveDrawerPsaType(
    extracted as Record<string, unknown>,
    context.extractedData?.dealSummary?.psaType,
  );
}

/**
 * Maps editable drawer state into PSA form data for existing validation/normalization.
 */
export function buildTransactionPayloadFromDrawerState(
  state: TransactionResultState,
  context: HomeTransactionSaveContext,
): PSAFormData {
  const extractedRecord = (context.extractedData?.data ?? {}) as Record<string, unknown>;
  const buyers =
    state.clientInformation.buyers.length > 0
      ? state.clientInformation.buyers.map(mapPersonToBuyerSeller)
      : extractPartiesFromData(extractedRecord, "buyers");
  const sellers = extractPartiesFromData(extractedRecord, "sellers");

  const selectedTasks = state.formsAndTasks.tasks
    .filter((task) => task.status !== "skipped")
    .map((task) => ({
      id: task.id,
      name: task.taskName,
      description: "",
      information: "",
      type: "TASK" as const,
      dueDate: task.dueDate ?? null,
    }));

  return {
    pendDate: state.transactionSummary.mutualAcceptance ?? null,
    closeDate: state.transactionSummary.closingDate ?? null,
    salePrice: state.transactionSummary.purchasePrice,
    earnestMoney: state.transactionSummary.earnestMoney || undefined,
    buyers,
    sellers,
    propertyAddress: state.transactionSummary.propertyAddress,
    cityState: buildCityState(
      state.propertyInformation.city,
      state.propertyInformation.state,
    ),
    county: resolveCounty(context),
    propertyType: resolvePropertyType(
      state.transactionSummary.psaType,
      context,
    ),
    parcelNumber: state.propertyInformation.parcelNumber || undefined,
    itemsThatStay: state.propertyInformation.itemsThatStay,
    lender: state.propertyInformation.lender || undefined,
    titleCompany: state.propertyInformation.titleCompany || undefined,
    closingOfficer: state.propertyInformation.closingAgent || undefined,
    escrowAgentEmail: state.propertyInformation.escrowEmail,
    selectedTasks,
    userUploadIds: context.uploadedFileId ? [context.uploadedFileId] : [],
  };
}
