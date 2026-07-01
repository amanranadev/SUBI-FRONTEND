import type { PersonInfo } from "@/components/PersonInfoList";
import type {
  TransactionResultState,
  TransactionTask,
} from "@/components/TransactionResultDrawer";
import { createPersonId } from "@/components/TransactionResultDrawer/TransactionResultDrawer.utils";
import type { ExtractedData } from "@/types/document";
import { parseCurrency } from "@/utils/currencyUtils";
import { parseDateFromAPI } from "@/utils/dateFormatUtils";

import { createEmptyTransactionResultState } from "@/components/TransactionResultDrawer/TransactionResultDrawer.constants";

interface RawBuyerSeller {
  firstName?: string;
  lastName?: string;
  email?: string | null;
  phone?: string | null;
}

interface RawFormTask {
  id?: string;
  task_key?: string;
  deadline_key?: string;
  task_name?: string;
  task_name_short?: string;
  taskName?: string;
  name?: string;
  title?: string;
  dueDate?: string | { normalized: string };
  computed?: { normalized?: string };
}

interface RawForm {
  id?: string;
  form_number?: string;
  form_code?: string;
  form_name?: string;
  name?: string;
  tasks?: RawFormTask[];
}

const PSA_PROPERTY_TYPES = new Set([
  "RESIDENTIAL",
  "VACANT_LAND",
  "MANUFACTURED_HOME_LEASED_LAND",
  "CONDOMINIUM",
  "MULTI_FAMILY",
  "COMMERCIAL",
]);

function isGenericPsaCategory(value: string): boolean {
  return value.trim().toUpperCase() === "PSA";
}

function normalizePsaPropertyType(value: string): string {
  const normalized = value.trim().toUpperCase();

  if (PSA_PROPERTY_TYPES.has(normalized)) {
    return normalized;
  }

  if (normalized.includes("RESIDENTIAL") || normalized === "RES") {
    return "RESIDENTIAL";
  }
  if (normalized.includes("COMMERCIAL") || normalized === "COMM") {
    return "COMMERCIAL";
  }
  if (normalized.includes("CONDO") || normalized.includes("CONDOMINIUM")) {
    return "CONDOMINIUM";
  }
  if (normalized.includes("VACANT") || normalized.includes("LAND")) {
    return "VACANT_LAND";
  }
  if (normalized.includes("MULTI") || normalized.includes("FAMILY")) {
    return "MULTI_FAMILY";
  }
  if (normalized.includes("MANUFACTURED")) {
    return "MANUFACTURED_HOME_LEASED_LAND";
  }

  return value.trim();
}

/**
 * PSA Type in the drawer is the property type (e.g. RESIDENTIAL), not the
 * generic transaction category label "PSA" inferred from Form 21.
 */
export function resolveDrawerPsaType(
  data: Record<string, unknown>,
  dealSummaryPsaType?: string,
): string {
  const propertyType = getString(data, "property_type", "propertyType");
  if (propertyType) {
    const normalized = normalizePsaPropertyType(propertyType);
    if (!isGenericPsaCategory(normalized)) {
      return normalized;
    }
  }

  for (const candidate of [
    getString(data, "psaType"),
    getString(data, "psa_type"),
  ]) {
    if (!candidate) {
      continue;
    }

    const normalized = normalizePsaPropertyType(candidate);
    if (!isGenericPsaCategory(normalized)) {
      return normalized;
    }
  }

  if (dealSummaryPsaType?.trim()) {
    const normalized = normalizePsaPropertyType(dealSummaryPsaType);
    if (!isGenericPsaCategory(normalized)) {
      return normalized;
    }
  }

  return "RESIDENTIAL";
}

function getString(data: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return "";
}

function getPriceValue(
  data: Record<string, unknown>,
  ...keys: string[]
): number | string | null | undefined {
  for (const key of keys) {
    const value = data[key];
    if (value === null || value === undefined || value === "") {
      continue;
    }
    if (typeof value === "number" || typeof value === "string") {
      return value;
    }
  }
  return undefined;
}

function getUnknownValue(
  data: Record<string, unknown>,
  ...keys: string[]
): unknown {
  for (const key of keys) {
    const value = data[key];
    if (value !== null && value !== undefined && value !== "") {
      return value;
    }
  }
  return undefined;
}

function formatPriceDisplay(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  if (typeof value === "number") {
    return value > 0 ? `$${value.toLocaleString("en-US")}` : "";
  }

  const parsed = parseCurrency(value);
  return parsed > 0 ? `$${parsed.toLocaleString("en-US")}` : value.trim();
}

function parseOptionalDate(
  value: unknown,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = parseDateFromAPI(
    value as string | { normalized: string } | null | undefined,
  );
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed : undefined;
}

function splitFullName(fullName: string | null | undefined): {
  firstName: string;
  lastName: string;
} {
  const normalized = String(fullName ?? "").trim();
  if (!normalized) {
    return { firstName: "", lastName: "" };
  }

  const [firstName, ...lastNameParts] = normalized.split(/\s+/);
  return {
    firstName: firstName ?? "",
    lastName: lastNameParts.join(" ").trim(),
  };
}

function mapPartyToPersonInfo(
  party: RawBuyerSeller,
  prefix: string,
  index: number,
): PersonInfo {
  return {
    id: createPersonId(`${prefix}-${index}`),
    firstName: party.firstName?.trim() ?? "",
    lastName: party.lastName?.trim() ?? "",
    email: party.email?.trim() ?? "",
    phone: party.phone?.trim() || undefined,
  };
}

function extractBuyers(data: Record<string, unknown>): RawBuyerSeller[] {
  const buyersAndSellers = data.buyersandsellers;
  let buyers: RawBuyerSeller[] = [];

  if (Array.isArray(buyersAndSellers) && buyersAndSellers.length > 0) {
    const firstEntry = buyersAndSellers[0] as Record<string, unknown>;
    if (Array.isArray(firstEntry.buyers)) {
      buyers = firstEntry.buyers as RawBuyerSeller[];
    }
  } else if (
    buyersAndSellers &&
    typeof buyersAndSellers === "object" &&
    Array.isArray((buyersAndSellers as Record<string, unknown>).buyers)
  ) {
    buyers = (buyersAndSellers as Record<string, unknown>)
      .buyers as RawBuyerSeller[];
  } else if (typeof buyersAndSellers === "string") {
    try {
      const parsed = JSON.parse(buyersAndSellers) as {
        buyers?: RawBuyerSeller[];
      };
      buyers = parsed.buyers ?? [];
    } catch {
      buyers = [];
    }
  }

  if (buyers.length === 0 && Array.isArray(data.buyers)) {
    buyers = data.buyers as RawBuyerSeller[];
  }

  return buyers
    .filter((buyer) => buyer && typeof buyer === "object")
    .map((buyer) => ({
      firstName: buyer.firstName?.trim() ?? "",
      lastName: buyer.lastName?.trim() ?? "",
      email: buyer.email?.trim() ?? "",
      phone: buyer.phone?.trim() ?? "",
    }));
}

function mapBrokerAgent(
  broker: {
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  },
): PersonInfo[] {
  const hasContact =
    broker.name?.trim() || broker.email?.trim() || broker.phone?.trim();

  if (!hasContact) {
    return [];
  }

  const { firstName, lastName } = splitFullName(broker.name);
  return [
    {
      id: createPersonId("agent"),
      firstName,
      lastName,
      email: broker.email?.trim() ?? "",
      phone: broker.phone?.trim() || undefined,
    },
  ];
}

function parseCityState(cityState?: string): { city: string; state: string } {
  if (!cityState?.trim()) {
    return { city: "", state: "" };
  }

  const parts = cityState.split(",").map((part) => part.trim());
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[parts.length - 1],
    };
  }

  return { city: cityState.trim(), state: "" };
}

function parseItemsThatStay(value: unknown): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
    }
  }

  return [];
}

function resolveTaskName(task: RawFormTask): string {
  const candidates = [
    task.task_name_short,
    task.taskName,
    task.task_name,
    task.name,
    task.title,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function resolveTaskDueDate(task: RawFormTask): Date | undefined {
  if (task.dueDate) {
    return parseOptionalDate(task.dueDate);
  }

  if (task.computed?.normalized) {
    return parseOptionalDate({ normalized: task.computed.normalized });
  }

  return undefined;
}

function mapFormsToTasks(
  data: Record<string, unknown>,
  transactionName: string,
): TransactionTask[] {
  const rawForms = (data.forms ?? []) as RawForm[];
  const rawTasks = (data.tasks ?? []) as RawFormTask[];
  const tasks: TransactionTask[] = [];

  rawForms.forEach((form, formIndex) => {
    form.tasks?.forEach((task, taskIndex) => {
      const taskName = resolveTaskName(task);
      if (!taskName) {
        return;
      }

      tasks.push({
        id:
          task.id ??
          task.task_key ??
          task.deadline_key ??
          `${form.form_number ?? form.form_code ?? formIndex}-task-${taskIndex}`,
        transactionName,
        taskName,
        dueDate: resolveTaskDueDate(task) ?? null,
        status: "pending",
      });
    });
  });

  rawTasks.forEach((task, taskIndex) => {
    const taskName = resolveTaskName(task);
    if (!taskName) {
      return;
    }

    tasks.push({
      id: task.id ?? task.task_key ?? task.deadline_key ?? `task-${taskIndex}`,
      transactionName,
      taskName,
      dueDate: resolveTaskDueDate(task) ?? null,
      status: "pending",
    });
  });

  return tasks;
}

/**
 * Maps normalized extraction output into TransactionResultDrawer initial state.
 * Home screen only — not used by legacy PSA/Listing modals.
 */
export function mapExtractedDataToDrawerState(
  extractedData: ExtractedData | null,
): TransactionResultState {
  if (!extractedData) {
    return createEmptyTransactionResultState();
  }

  const data = extractedData.data ?? {};
  const dealSummary = extractedData.dealSummary;
  const { city: cityFromState, state: stateFromCityState } = parseCityState(
    dealSummary?.cityState ??
      getString(data, "cityState", "city_state"),
  );

  const propertyAddress =
    dealSummary?.propertyAddress ??
    getString(data, "address", "propertyAddress", "property_address");

  const purchasePrice = formatPriceDisplay(
    dealSummary?.purchasePrice ??
      getPriceValue(data, "amount", "sale_price", "listingPrice", "listing_price"),
  );

  const earnestMoney = formatPriceDisplay(
    dealSummary?.earnestMoney ??
      getPriceValue(data, "earnestMoney", "earnest_money"),
  );

  const psaType = resolveDrawerPsaType(data, dealSummary?.psaType);

  const closingDate = parseOptionalDate(
    dealSummary?.closingDate ?? getUnknownValue(data, "closeDate", "close_date"),
  );

  const mutualAcceptance = parseOptionalDate(
    dealSummary?.mutualAcceptance ??
      getUnknownValue(data, "pendDate", "pend_date"),
  );

  const buyers = extractBuyers(data).map((buyer, index) =>
    mapPartyToPersonInfo(buyer, "buyer", index),
  );

  const buyerAgent = mapBrokerAgent({
    name: getString(data, "buyerBrokerName", "buyer_broker_name") || null,
    email: getString(data, "buyerBrokerEmail", "buyer_broker_email") || null,
    phone: getString(data, "buyerBrokerPhone", "buyer_broker_phone") || null,
  });

  const sellerAgent = mapBrokerAgent({
    name:
      getString(
        data,
        "sellerBrokerName",
        "seller_broker_name",
        "listingBrokerName",
        "listing_broker_name",
      ) || null,
    email:
      getString(
        data,
        "sellerBrokerEmail",
        "seller_broker_email",
        "listingBrokerEmail",
        "listing_broker_email",
      ) || null,
    phone:
      getString(
        data,
        "sellerBrokerPhone",
        "seller_broker_phone",
        "listingBrokerPhone",
        "listing_broker_phone",
      ) || null,
  });

  const transactionName = propertyAddress
    ? `${propertyAddress} - New`
    : extractedData.filename;

  const emptyState = createEmptyTransactionResultState();

  return {
    transactionSummary: {
      propertyAddress,
      purchasePrice,
      psaType,
      earnestMoney,
      closingDate,
      mutualAcceptance,
    },
    clientInformation: {
      buyers,
      buyerAgent,
      sellerAgent,
    },
    propertyInformation: {
      city: getString(data, "city") || cityFromState,
      state: getString(data, "state") || stateFromCityState,
      country: getString(data, "country"),
      parcelNumber: getString(data, "parcelNumber", "parcel_number"),
      titleCompany:
        dealSummary?.titleCompany ??
        getString(data, "titleCo", "title_co", "titleCompany", "title_company"),
      closingAgent:
        dealSummary?.closingOfficer ??
        getString(
          data,
          "escrowOfficer",
          "closingOfficer",
          "escrow_officer",
          "closing_officer",
          "closingAgent",
          "closing_agent",
        ),
      escrowEmail: getString(
        data,
        "escrowAgentEmail",
        "escrow_agent_email",
        "escrowEmail",
        "escrow_email",
      ),
      lender: getString(data, "lender"),
      itemsThatStay: parseItemsThatStay(
        getUnknownValue(data, "itemsThatStay", "items_that_stay"),
      ),
    },
    formsAndTasks: {
      tasks: mapFormsToTasks(data, transactionName),
      selectedChecklistId: null,
    },
    reviewStatus: emptyState.reviewStatus,
  };
}
