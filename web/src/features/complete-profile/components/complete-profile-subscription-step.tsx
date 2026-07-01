"use client";

import { useMemo, useState } from "react";
import { Building2, Globe, Sparkles, Users } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createSubscriptionCheckoutSession,
  getCurrentSubscription,
  getSubscriptionBillingPortal,
  isStripePremiumAccessActive,
  listSubscriptionPlans,
  SUBSCRIPTION_PLAN,
  PAID_PLANS,
  type SubscriptionPlanName,
} from "@/features/settings/api/profile-billing-service";
import {
  getMonthlyDisplayPrice,
  getAnnualMonthlyDisplayPrice,
  getPlanFeatures,
} from "@/features/settings/utils/billing-display";
import { useToast } from "@/shared/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SubscriptionPlanCard } from "./subscription-plan-card";

type BillingInterval = "monthly" | "annual";

const BILLING_COMPLETE_PROFILE_QUERY_KEY = [
  "complete-profile",
  "billing",
] as const;

type CompleteProfileSubscriptionStepProps = {
  onSaved?: () => void;
};

export function CompleteProfileSubscriptionStep({
  onSaved,
}: CompleteProfileSubscriptionStepProps = {}) {
  const { toast } = useToast();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  const plansQuery = useQuery({
    queryKey: [...BILLING_COMPLETE_PROFILE_QUERY_KEY, "plans"],
    queryFn: listSubscriptionPlans,
    staleTime: 60_000,
  });

  const subscriptionQuery = useQuery({
    queryKey: [...BILLING_COMPLETE_PROFILE_QUERY_KEY, "subscription"],
    queryFn: () => getCurrentSubscription(),
    staleTime: 20_000,
  });

  const startCheckoutMutation = useMutation({
    mutationFn: ({
      planName,
      interval,
    }: {
      planName: SubscriptionPlanName;
      interval: BillingInterval;
    }) => createSubscriptionCheckoutSession(planName, interval),
    onSuccess: (data) => {
      onSaved?.();
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: "Could not start checkout",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const billingPortalMutation = useMutation({
    mutationFn: getSubscriptionBillingPortal,
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: "Could not open billing portal",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const paidPlans = useMemo(
    () =>
      (plansQuery.data?.plans ?? []).filter((plan) =>
        (PAID_PLANS as readonly string[]).includes(plan.name),
      ),
    [plansQuery.data?.plans],
  );

  const stripe = subscriptionQuery.data?.stripeSubscription;
  const hasAccessViaTeam = subscriptionQuery.data?.hasAccessViaTeam ?? false;

  const hasOwnPremiumSubscription = isStripePremiumAccessActive(
    stripe?.status,
    stripe?.planName,
  );

  const shouldUseBillingPortal = hasOwnPremiumSubscription || hasAccessViaTeam;

  const handlePlanCTA = (planName: SubscriptionPlanName) => {
    if (shouldUseBillingPortal) {
      billingPortalMutation.mutate();
      return;
    }
    startCheckoutMutation.mutate({ planName, interval: billingInterval });
  };

  const isMutationPending =
    startCheckoutMutation.isPending || billingPortalMutation.isPending;

  const iconMap: Record<string, typeof Sparkles> = {
    [SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT]: Sparkles,
    [SUBSCRIPTION_PLAN.INDIVIDUAL_TC]: Users,
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_1]: Building2,
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_2]: Building2,
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_3]: Building2,
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4]: Globe,
  };

  const badgeMap: Record<string, string> = {
    [SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT]: "INDIVIDUAL AGENT",
    [SUBSCRIPTION_PLAN.INDIVIDUAL_TC]: "INDIVIDUAL TC",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_1]: "ENTERPRISE TIER 1",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_2]: "ENTERPRISE TIER 2",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_3]: "ENTERPRISE TIER 3",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4]: "ENTERPRISE TIER 4",
  };

  const descriptionMap: Record<string, string> = {
    [SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT]: "Full access to Subi's intelligent transaction engine for solo agents.",
    [SUBSCRIPTION_PLAN.INDIVIDUAL_TC]: "For owners, leads, and TCs managing up to 12 agents.",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_1]: "Growing teams with 2 managers and 15 agent seats.",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_2]: "Mid-size brokerages with 3 managers and 50 agent seats.",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_3]: "Large operations with 4 managers and 100 agent seats.",
    [SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4]: "Bespoke solutions for large-scale operations and custom requirements.",
  };

  return (
    <div className="space-y-6">
      <OnboardingIntervalToggle
        value={billingInterval}
        onChange={setBillingInterval}
      />

      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
        {paidPlans.map((plan) => {
          const isContactSales = plan.name === SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4;
          const isPrimary = plan.name === SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT;

          const monthlyPrice = getMonthlyDisplayPrice(plan);
          const annualMonthlyPrice = getAnnualMonthlyDisplayPrice(plan);
          const features = getPlanFeatures(plan, []);

          const activePrice = billingInterval === "annual" && annualMonthlyPrice
            ? annualMonthlyPrice
            : monthlyPrice;

          const priceDisplay = activePrice
            ? { originalPrice: activePrice, discountedPrice: activePrice }
            : null;

          return (
            <SubscriptionPlanCard
              key={plan.id}
              plan={plan}
              priceDisplay={priceDisplay}
              billingInterval={billingInterval}
              showSavings={billingInterval === "annual" && !!annualMonthlyPrice && !!monthlyPrice}
              originalMonthlyPrice={monthlyPrice}
              features={features}
              badgeText={badgeMap[plan.name] ?? plan.name}
              icon={iconMap[plan.name] ?? Building2}
              ctaLabel={
                isContactSales
                  ? "Contact Sales"
                  : billingPortalMutation.isPending
                    ? "Opening billing portal..."
                    : startCheckoutMutation.isPending
                      ? "Redirecting..."
                      : "Start Trial"
              }
              onAction={() => {
                if (isContactSales) return;
                handlePlanCTA(plan.name as SubscriptionPlanName);
              }}
              isLoading={plansQuery.isLoading || isMutationPending}
              variant={isContactSales ? "muted" : isPrimary ? "primary" : "default"}
              description={descriptionMap[plan.name] ?? ""}
            />
          );
        })}
      </div>
    </div>
  );
}

type OnboardingIntervalToggleProps = {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
};

function OnboardingIntervalToggle({ value, onChange }: OnboardingIntervalToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center rounded-full bg-black/[0.04] p-1 border border-black/5">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={cn(
            "relative rounded-full px-5 py-2 text-sm font-bold tracking-tight transition-all duration-200",
            value === "monthly"
              ? "bg-white text-foreground shadow-xs"
              : "text-foreground/50 hover:text-foreground/70",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange("annual")}
          className={cn(
            "relative rounded-full px-5 py-2 text-sm font-bold tracking-tight transition-all duration-200",
            value === "annual"
              ? "bg-white text-foreground shadow-xs"
              : "text-foreground/50 hover:text-foreground/70",
          )}
        >
          Annual
          <span className="ml-1.5 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            Save 15%
          </span>
        </button>
      </div>
    </div>
  );
}
