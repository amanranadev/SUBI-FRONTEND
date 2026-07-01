import type {
  RawTransactionData,
  BuyerSeller,
  RawTransactionAgentContact,
  TransactionFormData,
  TransactionFormParty,
  TransactionFormTask,
} from "../types";
import { PSA_TYPE } from "../constants";
import { formatCurrency, formatDateDisplay } from "@/shared/utils/format";
import { deriveRepresentingPartyFromRows } from "@/features/transactions/utils/transaction-party-helpers";

function mapParty(raw: BuyerSeller): TransactionFormParty {
  return {
    firstName: raw.firstName?.trim() ?? "",
    lastName: raw.lastName?.trim() ?? "",
    email: raw.email?.trim() ?? "",
    phone: raw.phone?.trim() ?? "",
    representing: raw.representing ?? false,
  };
}

function splitFullName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const normalized = String(fullName ?? "").trim();
  if (!normalized) return { firstName: "", lastName: "" };
  const [firstName, ...lastNameParts] = normalized.split(/\s+/);
  return {
    firstName: firstName ?? "",
    lastName: lastNameParts.join(" ").trim(),
  };
}

function mapBrokerAgent(
  broker: { name?: string | null; email?: string | null; phone?: string | null },
  fallback?: RawTransactionAgentContact | null,
) {
  const fallbackMapped = {
    firstName: String(fallback?.firstName ?? fallback?.first_name ?? "").trim(),
    lastName: String(fallback?.lastName ?? fallback?.last_name ?? "").trim(),
    email: String(fallback?.email ?? "").trim(),
    phone: String(fallback?.phone ?? fallback?.phone_number ?? "").trim(),
  };
  const { firstName, lastName } = splitFullName(broker.name);
  const mapped = {
    firstName,
    lastName,
    email: String(broker.email ?? "").trim(),
    phone: String(broker.phone ?? "").trim(),
  };
  return Object.values(mapped).some(Boolean) ? mapped : fallbackMapped;
}

function extractParties(data: RawTransactionData): {
  buyers: TransactionFormParty[];
  sellers: TransactionFormParty[];
} {
  const rawBuyers = data.buyersandsellers?.[0]?.buyers ?? data.buyers ?? [];
  const rawSellers = data.buyersandsellers?.[0]?.sellers ?? data.sellers ?? [];

  return {
    buyers: rawBuyers.map(mapParty),
    sellers: rawSellers.map(mapParty),
  };
}

function extractCityState(cityState: string | undefined): {
  city: string;
  state: string;
  county: string;
} {
  if (!cityState) return { city: "", state: "", county: "" };
  const parts = cityState
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const city = parts[0] ?? "";
  const state = parts[1] ?? "";
  const county = parts.slice(2).join(", ").trim();
  return { city, state, county };
}

function extractItemsThatStay(raw: string | string[] | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String);
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fallback to split
  }
  return raw
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function extractTasks(data: RawTransactionData): TransactionFormTask[] {
  const tasks: TransactionFormTask[] = [];

  data.forms?.forEach((form) => {
    form.tasks?.forEach((task, taskIndex) => {
      const name =
        task.task_name_short || task.taskName || task.task_name || "";
      const dueDate = task.computed?.normalized ?? "";
      const calculation = task.offset
        ? `${task.offset.n} ${task.offset.unit.replace(/_/g, " ")} ${task.offset.direction} ${task.trigger.replace(/_/g, " ")}`
        : "";

      tasks.push({
        id: `${form.form_number}-${taskIndex}`,
        title: name,
        date: formatDateDisplay(dueDate),
        calculation,
        formName: form.form_name,
        isSelected: true,
        note: "",
      });
    });
  });

  return tasks;
}

function resolveEarnestMoney(
  value: number | { value?: number; dueDate?: string } | undefined,
): string {
  if (!value) return "";
  if (typeof value === "object") return formatCurrency(value.value);
  return formatCurrency(value);
}

export function mapRawToFormData(raw: RawTransactionData): TransactionFormData {
  const { buyers, sellers } = extractParties(raw);
  const { city, state, county: countyFromCityState } = extractCityState(
    raw.cityState ?? raw.city_state,
  );
  const representingParty = deriveRepresentingPartyFromRows(buyers, sellers);
  const buyerAgent = mapBrokerAgent(
    {
      name: raw.buyerBrokerName,
      email: raw.buyerBrokerEmail,
      phone: raw.buyerBrokerPhone,
    },
    raw.buyerAgent ?? raw.buyer_agent,
  );
  const sellerAgent = mapBrokerAgent(
    {
      name: raw.sellerBrokerName ?? raw.listingBrokerName,
      email: raw.sellerBrokerEmail ?? raw.listingBrokerEmail,
      phone: raw.sellerBrokerPhone ?? raw.listingBrokerPhone,
    },
    raw.sellerAgent ?? raw.seller_agent ?? raw.listingAgent ?? raw.listing_agent,
  );

  return {
    checklistId: raw.checklistId ?? raw.checklist_id ?? null,
    address: raw.address ?? "",
    price: formatCurrency(raw.amount),
    representingParty,
    buyers,
    sellers,
    buyerAgent,
    sellerAgent,
    parcelNumber: raw.parcelNumber ?? "",
    closeDate: formatDateDisplay(raw.closeDate),
    mutualAcceptanceDate: formatDateDisplay(raw.pendDate),
    earnestMoney: resolveEarnestMoney(raw.earnestMoney),
    city,
    state,
    county: raw.county ?? countyFromCityState,
    psaType: raw.psaType ?? PSA_TYPE.RESIDENTIAL,
    itemsThatStay: extractItemsThatStay(raw.itemsThatStay),
    itemsThatStayDraft: "",
    titleCompany: raw.titleCo ?? "",
    closingAgent: raw.closingAgent ?? raw.escrowOfficer ?? "",
    escrowEmail: raw.escrowEmail ?? "",
    lender: raw.lender ?? "",
    nwmlsNumber: raw.nwmlsNumber ?? "",
    description: raw.description ?? "",
    tasks: extractTasks(raw),
  };
}
