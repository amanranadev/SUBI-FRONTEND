import type {
  DealSummary,
  ExtractedData,
} from "@/types/document";
import type { RawTransactionData } from "@/types/documentProcessing";

function buildDealSummary(data: Record<string, unknown>): DealSummary | undefined {
  if (data.dealSummary && typeof data.dealSummary === "object") {
    return data.dealSummary as DealSummary;
  }

  const hasRelevantData =
    data.address ||
    data.listingPrice ||
    data.amount ||
    data.closeDate ||
    data.earnestMoney;

  if (!hasRelevantData) {
    return undefined;
  }

  let mutualAcceptanceDate = (data.pendDate || data.pend_date) as
    | string
    | undefined;
  if (data.dateClauses && Array.isArray(data.dateClauses) && data.dateClauses.length > 0) {
    const mutualAcceptanceClause = (data.dateClauses as Record<string, unknown>[]).find(
      (clause) =>
        clause.event === "mutual_acceptance" ||
        clause.event === "mutual acceptance" ||
        clause.triggerEvent === "mutual_acceptance" ||
        String(clause.name ?? "")
          .toLowerCase()
          .includes("mutual acceptance"),
    );
    if (mutualAcceptanceClause?.date || mutualAcceptanceClause?.normalized) {
      mutualAcceptanceDate = String(
        mutualAcceptanceClause.date ?? mutualAcceptanceClause.normalized,
      );
    }
  }

  const closingDateValue = (data.closeDate || data.close_date) as string | undefined;

  let psaType = (data.psaType || data.psa_type) as string | undefined;
  if (!psaType && data.forms && Array.isArray(data.forms)) {
    const hasForm21 = (data.forms as Record<string, unknown>[]).some(
      (form) =>
        form.form_number === "21" ||
        form.form_code === "21" ||
        (typeof form.form_name === "string" &&
          form.form_name.includes("Purchase and Sale")),
    );
    if (hasForm21) {
      psaType = "PSA";
    }
  }

  return {
    propertyAddress: (data.address || data.propertyAddress) as string | undefined,
    cityState: (data.cityState || data.city_state) as string | undefined,
    county: data.county as string | undefined,
    psaType,
    closingDate: closingDateValue,
    titleCompany: (data.titleCo || data.title_co || data.titleCompany) as
      | string
      | undefined,
    purchasePrice: (data.amount || data.listingPrice || data.listing_price) as
      | number
      | string
      | undefined,
    earnestMoney: (data.earnestMoney || data.earnest_money) as
      | number
      | string
      | undefined,
    mutualAcceptance: mutualAcceptanceDate,
    closingOfficer: (data.escrowOfficer ||
      data.closingOfficer ||
      data.escrow_officer ||
      data.closing_officer) as string | undefined,
    closingAgentCompany: (data.closingAgentCompany ||
      data.closingAgent ||
      data.closing_agent_company) as string | undefined,
  };
}

/**
 * Transforms raw API transaction_data into mobile ExtractedData.
 */
export function normalizeExtractedData(
  raw: RawTransactionData,
  filename: string,
): ExtractedData {
  const data = raw as Record<string, unknown>;
  const dealSummary = buildDealSummary(data);

  return {
    filename,
    data: data as Record<string, any>,
    extractedFields: Object.keys(data),
    metadata: data.metadata as ExtractedData["metadata"],
    forms: data.forms as ExtractedData["forms"],
    dealSummary,
  };
}
