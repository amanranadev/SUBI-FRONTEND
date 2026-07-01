"use client";

import { Check, LucideIcon } from "lucide-react";
import { BillingSubscriptionPlan } from "@/features/settings/api/profile-billing-service";
import { cn } from "@/lib/utils";
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

interface SubscriptionPlanCardProps {
  plan: BillingSubscriptionPlan | null;
  priceDisplay?: {
    originalPrice: string;
    discountedPrice: string;
  } | null;
  billingInterval?: "monthly" | "annual";
  showSavings?: boolean;
  originalMonthlyPrice?: string | null;
  features: string[];
  onAction: () => void;
  isLoading: boolean;
  badgeText: string;
  icon?: LucideIcon;
  ctaLabel: string;
  variant?: "default" | "primary" | "muted";
  description: string;
}

export function SubscriptionPlanCard({
  plan,
  priceDisplay,
  billingInterval = "monthly",
  showSavings = false,
  originalMonthlyPrice,
  features,
  onAction,
  isLoading,
  badgeText,
  icon: Icon,
  ctaLabel,
  variant = "default",
  description,
}: SubscriptionPlanCardProps) {
  const isPrimary = variant === "primary";
  const isMuted = variant === "muted";

  const seatsLabel = plan?.managerSeats != null && plan?.agentSeats != null
    ? `${plan.managerSeats} Manager${plan.managerSeats > 1 ? "s" : ""} + ${plan.agentSeats} Agent${plan.agentSeats > 1 ? "s" : ""}`
    : null;

  return (
    <Card
      className={cn(
        "rounded-[2rem] border border-black/10 shadow-default flex h-full flex-col relative overflow-hidden",
        isMuted && "bg-foreground/[0.02]"
      )}
    >
      {Icon && isMuted && (
        <div className="absolute top-4 right-5">
           <Icon className="size-6 opacity-10" strokeWidth={1.5} />
        </div>
      )}

      <CardHeader
        className={cn(
          "space-y-3 p-6 pb-4",
          isPrimary ? "bg-primary/5" : isMuted ? "bg-foreground/[0.02]" : "bg-black/[0.02]"
        )}
      >
        <div className="flex items-center justify-between">
          <Badge
            className={cn(
              "border-0 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full",
              isPrimary ? "bg-primary/10 text-primary" : "bg-black/10 text-foreground/60"
            )}
          >
            {badgeText}
          </Badge>
          {Icon && !isMuted && <Icon className={cn("size-4", isPrimary ? "text-primary" : "text-foreground/40")} />}
        </div>
        <CardTitle className="text-2xl font-bold tracking-tighter">
          {plan?.displayName || plan?.name || "Plan"}
        </CardTitle>
        <CardDescription className="min-h-10 text-sm font-medium opacity-60">
          {description}
        </CardDescription>
        <div className="min-h-5" />
      </CardHeader>

      <CardContent className="p-6 pt-5 space-y-5 flex-1">
        <div className="space-y-1">
          <div className="min-h-11 flex flex-wrap items-end gap-2">
            <Txt as="p" className="text-4xl font-bold tracking-tighter">
              {priceDisplay?.discountedPrice ?? (isMuted ? "Custom" : "—")}
            </Txt>
            {!isMuted && priceDisplay && (
              <Txt as="p" className="text-base font-bold opacity-40">
                /mo
              </Txt>
            )}
          </div>

          {showSavings && originalMonthlyPrice && (
            <Txt as="p" size="xs" className="font-bold opacity-30 line-through tracking-tighter">
              {originalMonthlyPrice}/mo
            </Txt>
          )}

          {!isMuted && (
            <Txt as="p" size="xs" className="font-bold opacity-40 uppercase tracking-widest">
              {billingInterval === "annual" ? "BILLED ANNUALLY" : "BILLED MONTHLY"}
            </Txt>
          )}

          {!isMuted && (
            <Txt as="p" size="xs" className="font-bold opacity-40 uppercase tracking-widest">
              30 DAY FREE TRIAL
            </Txt>
          )}

          {isMuted && (
            <Txt as="p" size="xs" className="font-bold opacity-40 uppercase tracking-widest">
              REACH OUT DIRECTLY FOR PRICING
            </Txt>
          )}
        </div>

        {seatsLabel && (
          <div className="rounded-xl border border-black/5 bg-black/[0.02] px-4 py-2">
            <Txt as="p" size="xs" className="font-bold opacity-70">
              {seatsLabel}
            </Txt>
          </div>
        )}

        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center gap-2.5">
              <Check className="size-4 text-green-500 shrink-0" strokeWidth={3} />
              <Txt as="p" size="sm" className="font-semibold opacity-70">
                {feature}
              </Txt>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 mt-auto">
        <Button
          type="button"
          variant={isMuted ? "outline" : "default"}
          className={cn(
            "w-full rounded-2xl font-bold",
            isMuted && "border-black/10 hover:bg-black/5"
          )}
          onClick={onAction}
          disabled={isLoading}
        >
          {isLoading ? "Redirecting..." : ctaLabel}
        </Button>
      </CardFooter>
    </Card>
  );
}
