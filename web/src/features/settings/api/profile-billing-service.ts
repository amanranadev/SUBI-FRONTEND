import { z } from "zod";
import { apiClient } from "@/lib/api/client";
import { addBreadcrumb, captureApiError } from "@/lib/sentry";

export const SUBSCRIPTION_PLAN = {
  FREE: "FREE",
  INDIVIDUAL_AGENT: "INDIVIDUAL_AGENT",
  INDIVIDUAL_TC: "INDIVIDUAL_TC",
  ENTERPRISE_TIER_1: "ENTERPRISE_TIER_1",
  ENTERPRISE_TIER_2: "ENTERPRISE_TIER_2",
  ENTERPRISE_TIER_3: "ENTERPRISE_TIER_3",
  ENTERPRISE_TIER_4: "ENTERPRISE_TIER_4",
  // Legacy aliases
  AGENT: "INDIVIDUAL_AGENT",
  TEAM_TC: "INDIVIDUAL_TC",
} as const;

export const PAID_PLANS = [
  SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT,
  SUBSCRIPTION_PLAN.INDIVIDUAL_TC,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_1,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_2,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_3,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4,
] as const;

export const SELF_SERVE_PLANS = [
  SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT,
  SUBSCRIPTION_PLAN.INDIVIDUAL_TC,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_1,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_2,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_3,
] as const;

export const MULTI_SEAT_PLANS = [
  SUBSCRIPTION_PLAN.INDIVIDUAL_TC,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_1,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_2,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_3,
  SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4,
] as const;

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  INCOMPLETE: "incomplete",
  UNPAID: "unpaid",
} as const;

export type SubscriptionPlanName =
  (typeof SUBSCRIPTION_PLAN)[keyof typeof SUBSCRIPTION_PLAN];
export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

export function normalizeSubscriptionPlanName(name: string | null | undefined): string {
  return (name ?? "").trim().toUpperCase().replace(/[\s-]+/g, "_");
}

export function isPremiumSubscriptionPlanName(name: string | null | undefined): boolean {
  const n = normalizeSubscriptionPlanName(name);
  return (PAID_PLANS as readonly string[]).includes(n);
}

export function isMultiSeatPlanName(name: string | null | undefined): boolean {
  const n = normalizeSubscriptionPlanName(name);
  return (MULTI_SEAT_PLANS as readonly string[]).includes(n);
}

export function isStripePremiumAccessActive(
  status: string | null | undefined,
  planName: string | null | undefined,
): boolean {
  if (status !== SUBSCRIPTION_STATUS.ACTIVE && status !== SUBSCRIPTION_STATUS.TRIALING) {
    return false;
  }
  return isPremiumSubscriptionPlanName(planName);
}

const nullableNumber = z.number().nullable().optional();
const nullableString = z.string().nullable().optional();

const priceDetailSchema = z.object({
  price: nullableNumber,
  currency: nullableString,
  interval: nullableString,
  interval_count: nullableNumber,
  stripe_price_id: nullableString,
}).nullable().optional();

const subscriptionPlanApiSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  display_name: z.string().optional().nullable(),
  manager_seats: nullableNumber,
  agent_seats: nullableNumber,
  monthly_price_cents: nullableNumber,
  annual_monthly_price_cents: nullableNumber,
  self_serve: z.boolean().optional().nullable(),
  contact_sales: z.boolean().optional().nullable(),
  monthly_price: priceDetailSchema,
  annual_price: priceDetailSchema,
  price: nullableNumber,
  currency: nullableString,
  interval: nullableString,
  interval_count: nullableNumber,
  features: z.array(z.string()).optional(),
});

const subscriptionPlanSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
  displayName: z.string().optional().nullable(),
  managerSeats: nullableNumber,
  agentSeats: nullableNumber,
  monthlyPriceCents: nullableNumber,
  annualMonthlyPriceCents: nullableNumber,
  selfServe: z.boolean().optional().nullable(),
  contactSales: z.boolean().optional().nullable(),
  monthlyPrice: z.object({
    price: nullableNumber,
    currency: nullableString,
    interval: nullableString,
    intervalCount: nullableNumber,
    stripePriceId: nullableString,
  }).nullable().optional(),
  annualPrice: z.object({
    price: nullableNumber,
    currency: nullableString,
    interval: nullableString,
    intervalCount: nullableNumber,
    stripePriceId: nullableString,
  }).nullable().optional(),
  price: nullableNumber,
  currency: nullableString,
  interval: nullableString,
  intervalCount: nullableNumber,
  features: z.array(z.string()).default([]),
});

const stripeSubscriptionSchema = z.object({
  id: z.coerce.string(),
  status: z.string().optional().nullable(),
  currentPeriodStart: z.number().optional().nullable(),
  currentPeriodEnd: z.number().optional().nullable(),
  cancelAtPeriodEnd: z.boolean().optional().nullable(),
  planName: z.string().optional().nullable(),
  priceInterval: z.string().optional().nullable(),
  priceIntervalCount: z.number().optional().nullable(),
  priceAmount: z.number().optional().nullable(),
  priceCurrency: z.string().optional().nullable(),
  formattedPrice: z.string().optional().nullable(),
  trialEnd: z.number().optional().nullable(),
  canceledAt: z.number().optional().nullable(),
});

const stripeSubscriptionApiSchema = z.object({
  id: z.coerce.string(),
  status: z.string().optional().nullable(),
  current_period_start: z.number().optional().nullable(),
  current_period_end: z.number().optional().nullable(),
  cancel_at_period_end: z.boolean().optional().nullable(),
  plan_name: z.string().optional().nullable(),
  price_interval: z.string().optional().nullable(),
  price_interval_count: z.number().optional().nullable(),
  price_amount: z.number().optional().nullable(),
  price_currency: z.string().optional().nullable(),
  formatted_price: z.string().optional().nullable(),
  trial_end: z.number().optional().nullable(),
  canceled_at: z.number().optional().nullable(),
});

const currentSubscriptionApiSchema = z.object({
  current_plan: subscriptionPlanApiSchema.nullable().optional(),
  has_access_via_team: z.boolean().optional(),
  should_lock_workspace: z.boolean().optional(),
  trial_ends_at: z.number().nullable().optional(),
  stripe_subscription: stripeSubscriptionApiSchema.nullable().optional(),
});

const subscriptionPlansApiSchema = z.object({
  subscription_plans: z.array(subscriptionPlanApiSchema).default([]),
  current_plan: subscriptionPlanApiSchema.nullable().optional(),
});

const invoiceSchema = z.object({
  id: z.coerce.string(),
  created: z.number().optional().nullable(),
  amountPaid: z.number().optional().default(0),
  currency: z.string().optional().default("USD"),
  status: z.string().optional().default("paid"),
  description: z.string().optional().default("Subi Premium"),
  paymentBrand: z.string().optional().nullable(),
  paymentLast4: z.string().optional().nullable(),
});

const billingHistoryApiSchema = z.object({
  billing_history: z
    .array(
      z.object({
        id: z.coerce.string(),
        created: z.number().optional().nullable(),
        amount_paid: z.number().optional().default(0),
        currency: z.string().optional().default("USD"),
        status: z.string().optional().default("paid"),
        line_items: z
          .array(
            z.object({
              description: z.string().optional().nullable(),
            }),
          )
          .optional(),
        payment_method: z
          .object({
            card: z
              .object({
                brand: z.string().optional().nullable(),
                last4: z.string().optional().nullable(),
              })
              .optional()
              .nullable(),
          })
          .optional()
          .nullable(),
      }),
    )
    .default([]),
});

const checkoutSessionResponseSchema = z.object({
  url: z.string().min(1),
});

export type BillingCurrentSubscription = {
  currentPlan: z.infer<typeof subscriptionPlanSchema> | null;
  hasAccessViaTeam: boolean;
  shouldLockWorkspace: boolean;
  trialEndsAt: number | null;
  stripeSubscription: z.infer<typeof stripeSubscriptionSchema> | null;
};

export type BillingHistoryInvoice = z.infer<typeof invoiceSchema>;
export type BillingSubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;

function mapApiPlan(plan: z.infer<typeof subscriptionPlanApiSchema>): BillingSubscriptionPlan {
  const mapPriceDetail = (d: z.infer<typeof priceDetailSchema>) => {
    if (!d) return null;
    return {
      price: d.price ?? null,
      currency: d.currency ?? null,
      interval: d.interval ?? null,
      intervalCount: d.interval_count ?? null,
      stripePriceId: d.stripe_price_id ?? null,
    };
  };

  return subscriptionPlanSchema.parse({
    id: plan.id,
    name: plan.name,
    displayName: plan.display_name ?? null,
    managerSeats: plan.manager_seats ?? null,
    agentSeats: plan.agent_seats ?? null,
    monthlyPriceCents: plan.monthly_price_cents ?? null,
    annualMonthlyPriceCents: plan.annual_monthly_price_cents ?? null,
    selfServe: plan.self_serve ?? null,
    contactSales: plan.contact_sales ?? null,
    monthlyPrice: mapPriceDetail(plan.monthly_price),
    annualPrice: mapPriceDetail(plan.annual_price),
    price: plan.price ?? null,
    currency: plan.currency ?? null,
    interval: plan.interval ?? null,
    intervalCount: plan.interval_count ?? null,
    features: plan.features ?? [],
  });
}

export async function listSubscriptionPlans(): Promise<{
  plans: BillingSubscriptionPlan[];
  currentPlan: BillingSubscriptionPlan | null;
}> {
  const response = await apiClient.get("/subscriptions");
  const parsed = subscriptionPlansApiSchema.parse(response.data);

  return {
    plans: parsed.subscription_plans.map(mapApiPlan),
    currentPlan: parsed.current_plan ? mapApiPlan(parsed.current_plan) : null,
  };
}

export async function getCurrentSubscription(params?: {
  teamId?: string | null;
}): Promise<BillingCurrentSubscription> {
  const response = await apiClient.get("/subscriptions/current", {
    params: params?.teamId ? { team_id: params.teamId } : undefined,
  });
  const parsed = currentSubscriptionApiSchema.parse(response.data);

  return {
    currentPlan:
      parsed.current_plan
        ? mapApiPlan(parsed.current_plan)
        : null,
    hasAccessViaTeam: Boolean(parsed.has_access_via_team),
    shouldLockWorkspace: Boolean(parsed.should_lock_workspace),
    trialEndsAt: parsed.trial_ends_at ?? null,
    stripeSubscription:
      parsed.stripe_subscription
        ? stripeSubscriptionSchema.parse({
            id: parsed.stripe_subscription.id,
            status: parsed.stripe_subscription.status ?? null,
            currentPeriodStart:
              parsed.stripe_subscription.current_period_start ?? null,
            currentPeriodEnd: parsed.stripe_subscription.current_period_end ?? null,
            cancelAtPeriodEnd:
              parsed.stripe_subscription.cancel_at_period_end ?? null,
            planName: parsed.stripe_subscription.plan_name ?? null,
            priceInterval: parsed.stripe_subscription.price_interval ?? null,
            priceIntervalCount:
              parsed.stripe_subscription.price_interval_count ?? null,
            priceAmount: parsed.stripe_subscription.price_amount ?? null,
            priceCurrency: parsed.stripe_subscription.price_currency ?? null,
            formattedPrice: parsed.stripe_subscription.formatted_price ?? null,
            trialEnd: parsed.stripe_subscription.trial_end ?? null,
            canceledAt: parsed.stripe_subscription.canceled_at ?? null,
          })
        : null,
  };
}

export async function getBillingHistory(): Promise<BillingHistoryInvoice[]> {
  const response = await apiClient.get("/subscriptions/billing_history");
  const parsed = billingHistoryApiSchema.parse(response.data);

  return parsed.billing_history.map((invoice) =>
    invoiceSchema.parse({
      id: invoice.id,
      created: invoice.created ?? null,
      amountPaid: invoice.amount_paid ?? 0,
      currency: invoice.currency ?? "USD",
      status: invoice.status ?? "paid",
      description: invoice.line_items?.[0]?.description ?? "Subi Premium",
      paymentBrand: invoice.payment_method?.card?.brand ?? null,
      paymentLast4: invoice.payment_method?.card?.last4 ?? null,
    }),
  );
}

export async function createSubscriptionCheckoutSession(
  planName: SubscriptionPlanName,
  billingInterval: "monthly" | "annual" = "monthly",
): Promise<{ url: string }> {
  addBreadcrumb("billing", "Checkout session requested", {
    operation: "post:subscriptions/create_checkout_session",
    plan: planName,
    billingInterval,
  });

  try {
    const response = await apiClient.post("/subscriptions/create_checkout_session", {
      plan_name: planName,
      billing_interval: billingInterval,
    });
    return checkoutSessionResponseSchema.parse(response.data);
  } catch (error) {
    captureApiError(error, {
      operation: "post:subscriptions/create_checkout_session",
      method: "POST",
      path: "/subscriptions/create_checkout_session",
    });
    throw error;
  }
}

export async function getSubscriptionBillingPortal(): Promise<{ url: string }> {
  addBreadcrumb("billing", "Billing portal requested", {
    operation: "get:subscriptions/billing_portal",
  });

  try {
    const response = await apiClient.get("/subscriptions/billing_portal");
    return checkoutSessionResponseSchema.parse(response.data);
  } catch (error) {
    captureApiError(error, {
      operation: "get:subscriptions/billing_portal",
      method: "GET",
      path: "/subscriptions/billing_portal",
    });
    throw error;
  }
}
