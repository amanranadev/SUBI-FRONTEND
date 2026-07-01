import apiClient from "./api";

export interface SubscriptionPlan {
  id: string;
  name: string; // e.g., "FREE", "PREMIUM_MONTHLY", "PREMIUM_YEARLY"
  display_name: string;
  price: number | null;
  currency?: string | null;
  interval: "month" | "year" | null;
  interval_count?: number | null;
  stripe_price_id?: string | null;
  features: string[];
}

export interface CheckoutSessionResponse {
  session_id: string;
  url: string;
}

export interface BillingPortalResponse {
  url: string;
}

export const subscriptionService = {
  getPlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await apiClient.get("/subscriptions");
    if (res.data?.subscription_plans) {
      return res.data.subscription_plans as SubscriptionPlan[];
    }
    return [];
  },

  getCurrent: async (): Promise<SubscriptionPlan | null> => {
    // Prefer dedicated endpoint, but fall back to /subscriptions shape if needed
    const res = await apiClient.get("/subscriptions/current");
    if (res.data?.current_plan)
      return res.data.current_plan as SubscriptionPlan;
    if (res.data?.current) return res.data.current as SubscriptionPlan;
    return null;
  },

  createCheckoutSession: async (
    planName: string
  ): Promise<CheckoutSessionResponse> => {
    const res = await apiClient.post("/subscriptions/create_checkout_session", {
      plan_name: planName,
    });
    return res.data;
  },

  cancelSubscription: async (): Promise<{ success: boolean } | any> => {
    const res = await apiClient.post("/subscriptions/cancel", {});
    return res.data ?? { success: true };
  },

  getBillingPortalUrl: async (): Promise<BillingPortalResponse> => {
    const res = await apiClient.get("/subscriptions/billing_portal");
    return res.data;
  },
};
