"use client";

import { useState } from "react";
import { Building2, Check, Globe, Sparkles, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  SUBSCRIPTION_PLAN,
  type BillingSubscriptionPlan,
} from "@/features/settings/api/profile-billing-service";
import {
  getMonthlyDisplayPrice,
  getAnnualMonthlyDisplayPrice,
  getPlanFeatures,
} from "@/features/settings/utils/billing-display";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Txt } from "@/shared/ui/txt";
import { cn } from "@/lib/utils";

type BillingInterval = "monthly" | "annual";

type PlanCardConfig = {
  planName: string;
  badge: string;
  label: string;
  description: string;
  icon: LucideIcon;
  variant: "primary" | "default" | "muted";
};

const PLAN_CARD_CONFIGS: PlanCardConfig[] = [
  {
    planName: SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT,
    badge: "INDIVIDUAL AGENT",
    label: "Individual Agent",
    description: "Full access to Subi's intelligent transaction engine for solo agents.",
    icon: Sparkles,
    variant: "primary",
  },
  {
    planName: SUBSCRIPTION_PLAN.INDIVIDUAL_TC,
    badge: "INDIVIDUAL TC",
    label: "Individual TC",
    description: "For owners, leads, and transaction coordinators managing up to 12 agents.",
    icon: Users,
    variant: "default",
  },
  {
    planName: SUBSCRIPTION_PLAN.ENTERPRISE_TIER_1,
    badge: "ENTERPRISE TIER 1",
    label: "Enterprise Tier 1",
    description: "Growing teams with 2 managers and up to 15 agent seats.",
    icon: Building2,
    variant: "default",
  },
  {
    planName: SUBSCRIPTION_PLAN.ENTERPRISE_TIER_2,
    badge: "ENTERPRISE TIER 2",
    label: "Enterprise Tier 2",
    description: "Mid-size brokerages with 3 managers and up to 50 agent seats.",
    icon: Building2,
    variant: "default",
  },
  {
    planName: SUBSCRIPTION_PLAN.ENTERPRISE_TIER_3,
    badge: "ENTERPRISE TIER 3",
    label: "Enterprise Tier 3",
    description: "Large operations with 4 managers and up to 100 agent seats.",
    icon: Building2,
    variant: "default",
  },
  {
    planName: SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4,
    badge: "ENTERPRISE TIER 4",
    label: "Enterprise Tier 4",
    description: "Bespoke solutions for large-scale operations and custom requirements.",
    icon: Globe,
    variant: "muted",
  },
];

type BillingPricingCardsProps = {
  plans: BillingSubscriptionPlan[];
  activePlanName: string | null;
  hasLockedPlanSelection: boolean;
  isLoading: boolean;
  isMutating: boolean;
  shouldUseBillingPortal: boolean;
  onStartCheckout: (planName: string, interval: BillingInterval) => void;
  onManageSubscription: () => void;
};

export function BillingPricingCards({
  plans,
  activePlanName,
  hasLockedPlanSelection,
  isLoading,
  isMutating,
  shouldUseBillingPortal,
  onStartCheckout,
  onManageSubscription,
}: BillingPricingCardsProps) {
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");

  return (
    <div className="space-y-8">
      <BillingIntervalToggle
        value={billingInterval}
        onChange={setBillingInterval}
      />

      <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
        {PLAN_CARD_CONFIGS.map((config) => {
          const plan = plans.find((p) => p.name === config.planName) ?? null;
          const isActive = activePlanName === config.planName;
          const isDisabled = hasLockedPlanSelection && !isActive;
          const isContactSales = config.planName === SUBSCRIPTION_PLAN.ENTERPRISE_TIER_4;

          return (
            <PlanCard
              key={config.planName}
              config={config}
              plan={plan}
              billingInterval={billingInterval}
              isActive={isActive}
              isDisabled={isDisabled}
              isContactSales={isContactSales}
              isLoading={isLoading}
              isMutating={isMutating}
              shouldUseBillingPortal={shouldUseBillingPortal}
              onStartCheckout={onStartCheckout}
              onManageSubscription={onManageSubscription}
            />
          );
        })}
      </div>
    </div>
  );
}

type BillingIntervalToggleProps = {
  value: BillingInterval;
  onChange: (value: BillingInterval) => void;
};

function BillingIntervalToggle({ value, onChange }: BillingIntervalToggleProps) {
  return (
    <div className="flex items-center justify-center">
      <div className="inline-flex items-center rounded-full bg-black/[0.04] p-1.5 border border-black/5">
        <button
          type="button"
          onClick={() => onChange("monthly")}
          className={cn(
            "relative rounded-full px-6 py-2.5 text-sm font-bold tracking-tight transition-all duration-200",
            value === "monthly"
              ? "bg-white text-foreground shadow-sm"
              : "text-foreground/50 hover:text-foreground/70",
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => onChange("annual")}
          className={cn(
            "relative rounded-full px-6 py-2.5 text-sm font-bold tracking-tight transition-all duration-200",
            value === "annual"
              ? "bg-white text-foreground shadow-sm"
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

type PlanCardProps = {
  config: PlanCardConfig;
  plan: BillingSubscriptionPlan | null;
  billingInterval: BillingInterval;
  isActive: boolean;
  isDisabled: boolean;
  isContactSales: boolean;
  isLoading: boolean;
  isMutating: boolean;
  shouldUseBillingPortal: boolean;
  onStartCheckout: (planName: string, interval: BillingInterval) => void;
  onManageSubscription: () => void;
};

function PlanCard({
  config,
  plan,
  billingInterval,
  isActive,
  isDisabled,
  isContactSales,
  isLoading,
  isMutating,
  shouldUseBillingPortal,
  onStartCheckout,
  onManageSubscription,
}: PlanCardProps) {
  const isPrimary = config.variant === "primary";
  const isMuted = config.variant === "muted" || isContactSales;

  const monthlyPrice = getMonthlyDisplayPrice(plan);
  const annualMonthlyPrice = getAnnualMonthlyDisplayPrice(plan);
  const features = getPlanFeatures(plan, []);

  const displayPrice = billingInterval === "annual" && annualMonthlyPrice
    ? annualMonthlyPrice
    : monthlyPrice;

  const showSavings = billingInterval === "annual" && annualMonthlyPrice && monthlyPrice;

  const seatsLabel = plan?.managerSeats != null && plan?.agentSeats != null
    ? `${plan.managerSeats} Manager${plan.managerSeats > 1 ? "s" : ""} + ${plan.agentSeats} Agent${plan.agentSeats > 1 ? "s" : ""}`
    : null;

  const getButtonLabel = () => {
    if (isActive) return "Manage subscription";
    if (isDisabled) return "Unavailable";
    if (isContactSales) return "Contact Sales";
    if (isMutating) return "Redirecting...";
    return "Start Trial";
  };

  const handleClick = () => {
    if (isDisabled || isContactSales) return;
    if (isActive && shouldUseBillingPortal) {
      onManageSubscription();
      return;
    }
    if (shouldUseBillingPortal) {
      onManageSubscription();
      return;
    }
    onStartCheckout(config.planName, billingInterval);
  };

  const Icon = config.icon;

  return (
    <Card
      className={cn(
        "rounded-[3rem] overflow-hidden border-0 heavy-shadow glass-card flex h-full flex-col relative",
        isMuted && "bg-foreground/5",
      )}
    >
      {isMuted && (
        <div className="absolute top-6 right-10">
          <Icon className="size-8 opacity-10" strokeWidth={1.5} />
        </div>
      )}

      <CardHeader
        className={cn(
          "space-y-3 p-8 pb-5",
          isPrimary ? "bg-primary/5" : isMuted ? "bg-foreground/[0.02]" : "bg-black/[0.02]",
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge
              className={cn(
                "border-0 font-bold uppercase tracking-widest text-[10px] px-4 py-1.5 rounded-full",
                isPrimary
                  ? "bg-primary/10 text-primary"
                  : "bg-black/10 text-foreground/60",
              )}
            >
              {config.badge}
            </Badge>
            {isActive && (
              <Badge className="bg-green-100 text-green-700 border border-green-200 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                Active
              </Badge>
            )}
          </div>
          {!isMuted && <Icon className={cn("size-5", isPrimary ? "text-primary" : "text-foreground/40")} />}
        </div>
        <CardTitle className="text-3xl font-bold tracking-tighter">
          {config.label}
        </CardTitle>
        <CardDescription className="h-12 text-base font-medium opacity-60">
          {config.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="p-8 pt-6 space-y-6 flex-1">
        <div className="space-y-2">
          {isContactSales ? (
            <>
              <Txt as="p" className="text-5xl font-bold tracking-tighter">
                Custom
              </Txt>
              <Txt as="p" size="sm" className="font-bold opacity-40 uppercase tracking-widest">
                REACH OUT DIRECTLY FOR PRICING
              </Txt>
            </>
          ) : (
            <>
              <div className="flex items-end gap-2">
                <Txt as="p" className="text-5xl font-bold tracking-tighter">
                  {displayPrice ?? "—"}
                </Txt>
                <Txt as="p" className="text-lg font-bold opacity-40">
                  /mo
                </Txt>
              </div>
              {showSavings && (
                <Txt as="p" size="sm" className="font-bold opacity-30 line-through tracking-tighter">
                  {monthlyPrice}/mo
                </Txt>
              )}
              <Txt as="p" size="sm" className="font-bold opacity-40 uppercase tracking-widest">
                {billingInterval === "annual" ? "BILLED ANNUALLY" : "BILLED MONTHLY"}
              </Txt>
              <Txt as="p" size="sm" className="font-bold opacity-40 uppercase tracking-widest">
                30 DAY FREE TRIAL
              </Txt>
            </>
          )}
        </div>

        {seatsLabel && (
          <div className="rounded-xl border border-black/5 bg-black/[0.02] px-4 py-2.5">
            <Txt as="p" size="sm" className="font-bold opacity-70">
              {seatsLabel}
            </Txt>
          </div>
        )}

        <FeatureList features={features} />
      </CardContent>

      <CardFooter className="p-8 pt-0 mt-auto">
        <Button
          type="button"
          variant={isMuted ? "outline" : "default"}
          className={cn(
            "w-full h-16 !rounded-[2rem] text-lg font-bold",
            isMuted && "border-black/10 hover:bg-black/5",
          )}
          onClick={handleClick}
          disabled={isDisabled || isMutating || isLoading}
        >
          {getButtonLabel()}
        </Button>
      </CardFooter>
    </Card>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <div className="space-y-3">
      {features.map((feature) => (
        <div key={feature} className="flex items-center gap-3">
          <Check className="size-4 text-green-500 shrink-0" strokeWidth={3} />
          <Txt as="p" size="sm" className="font-bold opacity-70 tracking-tight">
            {feature}
          </Txt>
        </div>
      ))}
    </div>
  );
}
