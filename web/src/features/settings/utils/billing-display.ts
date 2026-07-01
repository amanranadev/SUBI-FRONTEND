import { SUBSCRIPTION_STATUS } from "@/features/settings/api/profile-billing-service";
import type {
  BillingHistoryInvoice,
  BillingSubscriptionPlan,
} from "@/features/settings/api/profile-billing-service";

export function formatCurrencyInCents(valueInCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(valueInCents / 100);
}

export function billingPeriodSuffix(interval: string | null | undefined) {
  if (interval === "year") return "/yr";
  if (interval === "month") return "/mo";
  return "/mo";
}

export function getMonthlyDisplayPrice(plan: BillingSubscriptionPlan | null) {
  if (!plan) return null;

  const monthly = plan.monthlyPrice;
  if (monthly?.price && monthly.currency) {
    return formatCurrencyInCents(monthly.price, monthly.currency);
  }

  if (plan.monthlyPriceCents) {
    return formatCurrencyInCents(plan.monthlyPriceCents, "usd");
  }

  if (plan.price && plan.currency) {
    return formatCurrencyInCents(plan.price, plan.currency);
  }

  return null;
}

export function getAnnualMonthlyDisplayPrice(plan: BillingSubscriptionPlan | null) {
  if (!plan) return null;

  if (plan.annualMonthlyPriceCents) {
    return formatCurrencyInCents(plan.annualMonthlyPriceCents, "usd");
  }

  const annual = plan.annualPrice;
  if (annual?.price && annual.currency) {
    return formatCurrencyInCents(annual.price, annual.currency);
  }

  return null;
}

/** @deprecated Use getMonthlyDisplayPrice / getAnnualMonthlyDisplayPrice instead. */
export function getDiscountedDisplayPrice(plan: BillingSubscriptionPlan | null) {
  if (!plan?.price || !plan.currency) return null;
  return {
    originalPrice: formatCurrencyInCents(plan.price, plan.currency),
    discountedPrice: formatCurrencyInCents(Math.round(plan.price / 2), plan.currency),
  };
}

export function getPlanFeatures(
  plan: BillingSubscriptionPlan | null,
  fallbackFeatures: string[],
) {
  if (plan?.features?.length) return plan.features;
  return fallbackFeatures;
}

export function formatDateFromUnix(unixSeconds: number | null | undefined) {
  if (!unixSeconds) return "—";
  return new Date(unixSeconds * 1000).toLocaleDateString();
}

export function formatPlanName(planName: string | null | undefined) {
  if (!planName) return "Free";
  return planName
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getInvoiceCardLabel(invoice: BillingHistoryInvoice) {
  if (!invoice.paymentBrand || !invoice.paymentLast4) return "Card on file";
  return `${invoice.paymentBrand.toUpperCase()} •••• ${invoice.paymentLast4}`;
}

export function isStripeAccessActive(status: string | null | undefined) {
  return (
    status === SUBSCRIPTION_STATUS.ACTIVE ||
    status === SUBSCRIPTION_STATUS.TRIALING
  );
}
