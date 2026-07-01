import { formatCurrency, formatDateDisplay } from "@/shared/utils/format";
import type { Transaction } from "@/features/workspace/types";
import { TRANSACTION_STATUS } from "@/features/workspace/status";
import type { TransactionStatus } from "@/features/workspace/status";
import type {
  RepresentingParty,
  TransactionFormParty,
} from "@/features/transactions/types";
import {
  deriveRepresentingPartyFromRows,
  formatPartyRowsToSummary,
} from "@/features/transactions/utils/transaction-party-helpers";
import { PSA_TYPE } from "@/features/transactions/constants";
import { TRANSACTION_TASK_STATUS } from "@/features/transactions/types/transaction-type";
import { formatCadetCommandDisplay } from "@/features/cadet/lib/pinpoint-command";

export type ApiTransactionListItem = {
  id: number;
  amount: number;
  address: string;
  user_id?: number | string | null;
  userId?: number | string | null;
  agent_name?: string | null;
  agentName?: string | null;
  status?: string | null;
  date?: string | null;
  closeDate?: string | null;
  totalTasks?: number;
  totalCompletedTasks?: number;
  buyersandsellers?: ApiBuyersAndSellers;
  buyersAndSellers?: ApiBuyersAndSellers;
  buyerAgent?: ApiAgentContact | null;
  buyer_agent?: ApiAgentContact | null;
  buyerBrokerName?: string | null;
  buyerBrokerEmail?: string | null;
  buyerBrokerPhone?: string | null;
  sellerAgent?: ApiAgentContact | null;
  seller_agent?: ApiAgentContact | null;
  sellerBrokerName?: string | null;
  sellerBrokerEmail?: string | null;
  sellerBrokerPhone?: string | null;
  listingAgent?: ApiAgentContact | null;
  listing_agent?: ApiAgentContact | null;
  listingBrokerName?: string | null;
  listingBrokerEmail?: string | null;
  listingBrokerPhone?: string | null;
  /** Backend index partial may return snake_case */
  buyers_and_sellers?: ApiBuyersAndSellers;
  /** e.g. ["BUYER"] — who the agent represents */
  representing?: string[] | null;
  pendDate?: string | null;
  pend_date?: string | null;
  close_date?: string | null;
  selected_tasks?: ApiTransactionTask[];
  selectedTasks?: ApiTransactionTask[];
  TransactionTasks?: ApiTransactionDetailTask[];
  transactionTasks?: ApiTransactionDetailTask[];
  parcel_number?: string | null;
  parcelNumber?: string | null;
  earnest_money?: number | null;
  earnestMoney?: number | null;
  psa_type?: string | null;
  psaType?: string | null;
  city_state?: string | null;
  cityState?: string | null;
  county?: string | null;
  title_co?: string | null;
  titleCo?: string | null;
  closing_agent?: string | null;
  closingAgent?: string | null;
  escrow_agent_email?: string | null;
  escrowEmail?: string | null;
  escrowAgentEmail?: string | null;
  escrow_officer?: string | null;
  escrowOfficer?: string | null;
  lender?: string | null;
  nwmls_number?: string | null;
  nwmlsNumber?: string | null;
  description?: string | null;
  items_that_stay?: string[] | string | null;
  itemsThatStay?: string[] | string | null;
  cadet_command?: string | null;
  cadetCommand?: string | null;
};

type ApiBuyersAndSellers =
  | {
      buyers?: ApiPartyRow[];
      sellers?: ApiPartyRow[];
    }
  | Array<{
      buyers?: ApiPartyRow[];
      sellers?: ApiPartyRow[];
    }>
  | string
  | null;

type ApiPartyRow = {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  email?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  representing?: boolean;
};

type ApiAgentContact = {
  firstName?: string | null;
  first_name?: string | null;
  lastName?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string | null;
  phone_number?: string | null;
};

type ApiTransactionTask = {
  id?: number | string | null;
  name?: string | null;
  dueDate?: string | null;
  due_date?: string | null;
  transaction_task_type?: string | null;
  transactionTaskType?: string | null;
};

type ApiTransactionDetailTask = {
  id?: number | string | null;
  name?: string | null;
  description?: string | null;
  information?: string | null;
  dueDate?: string | null;
  due_date?: string | null;
  completed?: boolean | null;
  status?: string | number | null;
  type?: string | null;
  transactionTaskType?: string | number | null;
  transaction_task_type?: string | number | null;
  checklistTaskId?: string | null;
  checklist_task_id?: string | null;
  fromChecklist?: boolean | null;
  from_checklist?: boolean | null;
  transactionId?: string | null;
  transaction_id?: string | null;
};

function parseBooleanFlag(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
}

const VALID_API_STATUSES: TransactionStatus[] = [
  TRANSACTION_STATUS.STARTED,
  TRANSACTION_STATUS.PENDING_INSPECTION,
  TRANSACTION_STATUS.PENDING_APPRAISAL,
  TRANSACTION_STATUS.CLEAR_TO_CLOSE,
  TRANSACTION_STATUS.CLOSED,
  TRANSACTION_STATUS.CANCELLED,
  TRANSACTION_STATUS.ARCHIVE,
];

function parseApiStatus(
  apiStatus: string | null | undefined,
): TransactionStatus {
  if (!apiStatus) return TRANSACTION_STATUS.STARTED;
  const normalized = String(apiStatus).toUpperCase();
  return VALID_API_STATUSES.includes(normalized as TransactionStatus)
    ? (normalized as TransactionStatus)
    : TRANSACTION_STATUS.STARTED;
}

function unwrapBuyersAndSellers(
  raw: ApiBuyersAndSellers | undefined,
): { buyers: ApiPartyRow[]; sellers: ApiPartyRow[] } | undefined {
  if (!raw) return undefined;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as ApiBuyersAndSellers;
      return unwrapBuyersAndSellers(parsed);
    } catch {
      return undefined;
    }
  }
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0] as { buyers?: ApiPartyRow[]; sellers?: ApiPartyRow[] };
    return {
      buyers: Array.isArray(first?.buyers) ? first.buyers : [],
      sellers: Array.isArray(first?.sellers) ? first.sellers : [],
    };
  }
  if (typeof raw === "object" && raw !== null) {
    const o = raw as { buyers?: ApiPartyRow[]; sellers?: ApiPartyRow[] };
    if (Array.isArray(o.buyers) || Array.isArray(o.sellers)) {
      return {
        buyers: o.buyers ?? [],
        sellers: o.sellers ?? [],
      };
    }
  }
  return undefined;
}

function mapApiPartyRowToParty(row: ApiPartyRow): TransactionFormParty {
  return {
    firstName: String(row.firstName ?? row.first_name ?? "").trim(),
    lastName: String(row.lastName ?? row.last_name ?? "").trim(),
    email: String(row.email ?? "").trim(),
    phone: String(row.phone ?? row.phone_number ?? "").trim(),
    representing: Boolean(row.representing),
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

function mapApiBrokerContact(
  broker: { name?: string | null; email?: string | null; phone?: string | null },
  fallback?: ApiAgentContact | null,
):
  | {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    }
  | undefined {
  const { firstName, lastName } = splitFullName(broker.name);
  const mapped = {
    firstName,
    lastName,
    email: String(broker.email ?? "").trim(),
    phone: String(broker.phone ?? "").trim(),
  };
  if (Object.values(mapped).some(Boolean)) return mapped;
  if (!fallback) return undefined;
  const fallbackMapped = {
    firstName: String(fallback.firstName ?? fallback.first_name ?? "").trim(),
    lastName: String(fallback.lastName ?? fallback.last_name ?? "").trim(),
    email: String(fallback.email ?? "").trim(),
    phone: String(fallback.phone ?? fallback.phone_number ?? "").trim(),
  };
  return Object.values(fallbackMapped).some(Boolean) ? fallbackMapped : undefined;
}

function splitCityState(raw: string | null | undefined): {
  city: string;
  state: string;
  county: string;
} {
  if (!raw?.trim()) return { city: "", state: "", county: "" };
  const parts = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const city = parts[0] ?? "";
  const state = parts[1] ?? "";
  const county = parts.slice(2).join(", ").trim();
  return { city, state, county };
}

function normalizeApiItemsThatStay(raw: unknown): string[] {
  const visited = new WeakSet<object>();

  const normalizeToken = (value: string): string => {
    const stripped = value
      .trim()
      .replace(/^[\[\]{}"']+/, "")
      .replace(/[\[\]{}"']+$/, "")
      .trim();
    return stripped;
  };

  const extract = (value: unknown, depth = 0): string[] => {
    if (depth > 4 || value == null) return [];

    if (Array.isArray(value)) {
      return value.flatMap((item) => extract(item, depth + 1));
    }

    if (typeof value === "object") {
      if (visited.has(value as object)) return [];
      visited.add(value as object);
      const candidate = value as Record<string, unknown>;
      const nested =
        candidate.itemsThatStay ??
        candidate.items_that_stay ??
        candidate.items ??
        candidate.value;
      if (nested !== undefined) {
        return extract(nested, depth + 1);
      }
      return Object.values(candidate).flatMap((item) =>
        extract(item, depth + 1),
      );
    }

    if (typeof value === "string") {
      const text = value.trim();
      if (!text) return [];

      try {
        const parsed = JSON.parse(text) as unknown;
        if (parsed !== value) {
          const fromParsed = extract(parsed, depth + 1);
          if (fromParsed.length > 0) return fromParsed;
        }
      } catch {
        /* fall through */
      }

      // Support YAML-ish list persisted as text:
      // ---
      // - Fridge
      // - Stove
      if (text.includes("\n- ")) {
        const yamlItems = text
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.startsWith("- "))
          .map((line) => normalizeToken(line.replace(/^- /, "")))
          .filter(Boolean);
        if (yamlItems.length > 0) return yamlItems;
      }

      const pgArrayLike =
        text.startsWith("{") && text.endsWith("}") && text.includes(",");
      const source = pgArrayLike ? text.slice(1, -1) : text;

      return source
        .split(/[;,\n\r]+/)
        .map(normalizeToken)
        .filter(Boolean);
    }

    return [String(value).trim()].filter(Boolean);
  };

  return Array.from(new Set(extract(raw)));
}

function displayPsaType(raw: string | null | undefined): string {
  if (!raw?.trim()) return PSA_TYPE.RESIDENTIAL;
  const t = raw.trim();
  return t
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseRepresentingFromApi(
  raw: string[] | null | undefined,
  buyers: TransactionFormParty[],
  sellers: TransactionFormParty[],
): RepresentingParty | null {
  if (Array.isArray(raw) && raw.length > 0) {
    const upper = raw.map((r) => String(r).toUpperCase());
    if (upper.some((r) => r.includes("BUYER"))) return "buyer";
    if (upper.some((r) => r.includes("SELLER"))) return "seller";
  }
  return deriveRepresentingPartyFromRows(buyers, sellers);
}

function getProgressFromTransactionTasks(
  tasks: ApiTransactionDetailTask[],
  fallbackProgress: number,
): number {
  const countableTasks = tasks.filter((task) => {
    const checklistTaskId = task.checklistTaskId ?? task.checklist_task_id;
    const hasChecklistTaskId =
      checklistTaskId != null && String(checklistTaskId).trim() !== "";
    const isFromChecklist = parseBooleanFlag(
      task.fromChecklist ?? task.from_checklist,
    );

    return !hasChecklistTaskId && !isFromChecklist;
  });

  const skippedTasks = countableTasks.filter((task) => {
    const rawStatus = task.status;
    if (typeof rawStatus === "string") {
      const normalizedStatus = rawStatus.toUpperCase().trim();
      return (
        normalizedStatus === TRANSACTION_TASK_STATUS.SKIPPED ||
        normalizedStatus === "4"
      );
    }
    return rawStatus === 4;
  });
  const activeTasks = countableTasks.filter(
    (task) => !skippedTasks.includes(task),
  );

  if (activeTasks.length === 0) {
    return fallbackProgress;
  }

  const completedTaskCount = activeTasks.filter((task) => {
    if (parseBooleanFlag(task.completed)) return true;
    if (typeof task.status === "string") {
      const normalizedStatus = task.status.toUpperCase().trim();
      return (
        normalizedStatus === TRANSACTION_TASK_STATUS.COMPLETED ||
        normalizedStatus === "3"
      );
    }
    return task.status === 3;
  }).length;

  const progress = Math.round((completedTaskCount / activeTasks.length) * 100);

  return progress;
}

export function mapApiTransactionToTransaction(
  api: ApiTransactionListItem,
): Transaction {
  const status = parseApiStatus(api.status ?? null);
  const rawTransactionTasks =
    api.transactionTasks ?? api.TransactionTasks ?? [];
  const progress = getProgressFromTransactionTasks(rawTransactionTasks, 0);
  const totalTasksFromApi = api.totalTasks ?? 0;
  const hasTasks = rawTransactionTasks.length > 0 || totalTasksFromApi > 0;

  const dateRaw = api.closeDate ?? api.close_date ?? api.date;
  const date = dateRaw ? formatDateDisplay(dateRaw) : "";

  const parties = unwrapBuyersAndSellers(
    api.buyersandsellers ?? api.buyersAndSellers ?? api.buyers_and_sellers,
  );
  const buyerParties = (parties?.buyers ?? []).map(mapApiPartyRowToParty);
  const sellerParties = (parties?.sellers ?? []).map(mapApiPartyRowToParty);
  const representingParty = parseRepresentingFromApi(
    api.representing ?? null,
    buyerParties,
    sellerParties,
  );
  const buyers =
    buyerParties.length > 0
      ? formatPartyRowsToSummary(buyerParties) || undefined
      : undefined;
  const sellers =
    sellerParties.length > 0
      ? formatPartyRowsToSummary(sellerParties) || undefined
      : undefined;
  const buyerAgent = mapApiBrokerContact(
    {
      name: api.buyerBrokerName,
      email: api.buyerBrokerEmail,
      phone: api.buyerBrokerPhone,
    },
    api.buyerAgent ?? api.buyer_agent ?? null,
  );
  const sellerAgent = mapApiBrokerContact(
    {
      name: api.sellerBrokerName ?? api.listingBrokerName,
      email: api.sellerBrokerEmail ?? api.listingBrokerEmail,
      phone: api.sellerBrokerPhone ?? api.listingBrokerPhone,
    },
    api.sellerAgent ??
      api.seller_agent ??
      api.listingAgent ??
      api.listing_agent ??
      null,
  );
  const agentName = api.agentName ?? api.agent_name ?? undefined;
  const pendDateRaw = api.pendDate ?? api.pend_date;
  const mutualAcceptanceDate = pendDateRaw
    ? formatDateDisplay(pendDateRaw)
    : undefined;
  const parcelRaw = api.parcelNumber ?? api.parcel_number;
  const parcelNumber =
    parcelRaw != null && String(parcelRaw).trim() !== ""
      ? String(parcelRaw).trim()
      : undefined;
  const earnestRaw = api.earnestMoney ?? api.earnest_money;
  const earnestMoney =
    earnestRaw != null ? formatCurrency(earnestRaw) : undefined;
  const psaType = displayPsaType(api.psaType ?? api.psa_type ?? null);
  const cityStateRaw = api.cityState ?? api.city_state ?? null;
  const {
    city,
    state,
    county: countyFromCityState,
  } = splitCityState(cityStateRaw ?? undefined);
  const county = api.county?.trim() || countyFromCityState || undefined;
  const titleCompany = (api.titleCo ?? api.title_co)?.trim() || undefined;
  const closingAgent =
    (
      api.closingAgent ??
      api.closing_agent ??
      api.escrowOfficer ??
      api.escrow_officer
    )?.trim() || undefined;
  const escrowEmail =
    (
      api.escrowEmail ??
      api.escrowAgentEmail ??
      api.escrow_agent_email
    )?.trim() || undefined;
  const lender = api.lender?.trim() || undefined;
  const nwmlsNumber =
    (api.nwmlsNumber ?? api.nwmls_number)?.trim() || undefined;
  const description = api.description?.trim() || undefined;
  const itemsThatStay = normalizeApiItemsThatStay(
    api.itemsThatStay ?? api.items_that_stay ?? null,
  );
  const userIdRaw = api.userId ?? api.user_id ?? null;
  const userId = userIdRaw != null ? String(userIdRaw) : undefined;
  const rawSelectedTasks = api.selectedTasks ?? api.selected_tasks ?? [];
  const selectedTasks = rawSelectedTasks
    .filter((task) => Boolean(task?.name))
    .map((task, index) => ({
      id: String(task.id ?? `${api.id}-task-${index}`),
      name: String(task.name ?? ""),
      dueDate: task.dueDate ?? task.due_date ?? null,
      transactionTaskType:
        task.transactionTaskType ?? task.transaction_task_type ?? null,
    }));
  const transactionTasks = rawTransactionTasks
    .filter((task) => Boolean(task?.id))
    .map((task, index) => ({
      id: String(task.id ?? `${api.id}-transaction-task-${index}`),
      name: String(task.name ?? ""),
      description: task.description ?? null,
      information: task.information ?? null,
      dueDate: task.dueDate ?? task.due_date ?? undefined,
      completed: Boolean(task.completed),
      status:
        typeof task.status === "string"
          ? task.status
          : task.status === 3
            ? TRANSACTION_TASK_STATUS.COMPLETED
            : undefined,
      type: (
        task.type ??
        task.transactionTaskType ??
        task.transaction_task_type
      )?.toString(),
      transactionId: task.transactionId ?? task.transaction_id ?? undefined,
    }));

  return {
    id: String(api.id),
    userId,
    address: api.address ?? "",
    price: formatCurrency(api.amount),
    status,
    date,
    progress,
    hasTasks,
    buyers,
    sellers,
    buyerParties: buyerParties.length > 0 ? buyerParties : undefined,
    sellerParties: sellerParties.length > 0 ? sellerParties : undefined,
    buyerAgent,
    sellerAgent,
    representingParty,
    mutualAcceptanceDate,
    parcelNumber,
    earnestMoney,
    psaType,
    city: city || undefined,
    state: state || undefined,
    county,
    titleCompany,
    closingAgent,
    escrowEmail,
    lender,
    nwmlsNumber,
    description,
    itemsThatStay: itemsThatStay.length > 0 ? itemsThatStay : undefined,
    cadetCommand:
      formatCadetCommandDisplay(api.cadetCommand ?? api.cadet_command, api.address) ||
      undefined,
    agentName,
    selectedTasks,
    transactionTasks,
  };
}
