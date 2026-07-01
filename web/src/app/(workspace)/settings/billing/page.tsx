"use client";

import { useEffect, useMemo } from "react";
import { CreditCard } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  type BillingSubscriptionPlan,
  createSubscriptionCheckoutSession,
  getBillingHistory,
  getCurrentSubscription,
  getSubscriptionBillingPortal,
  isStripePremiumAccessActive,
  listSubscriptionPlans,
  SUBSCRIPTION_PLAN,
  SUBSCRIPTION_STATUS,
  PAID_PLANS,
  type SubscriptionPlanName,
} from "@/features/settings/api/profile-billing-service";
import {
  billingPeriodSuffix,
  formatCurrencyInCents,
  formatDateFromUnix,
  formatPlanName,
  getInvoiceCardLabel,
  isStripeAccessActive,
} from "@/features/settings/utils/billing-display";
import { BillingPricingCards } from "@/features/settings/components/billing-pricing-cards";
import { SETTINGS_ROUTES } from "@/features/settings/routes";
import { useWorkspaceAccessValidation } from "@/features/workspace/hooks/use-workspace-access-validation";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/shared/hooks/use-toast";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Txt } from "@/shared/ui/txt";

const BILLING_QUERY_KEY = ["settings", "billing"] as const;

export default function SettingsBillingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedTeamId } = useWorkspace();
  const { toast } = useToast();
  const { shouldShowBillingSettings, accessTeamId } = useWorkspaceAccessValidation({
    user,
    selectedTeamId,
    queryKey: [...BILLING_QUERY_KEY, "access-validation"],
  });

  const plansQuery = useQuery({
    queryKey: [...BILLING_QUERY_KEY, "plans"],
    queryFn: listSubscriptionPlans,
    staleTime: 60_000,
  });

  const subscriptionQuery = useQuery({
    queryKey: [...BILLING_QUERY_KEY, "subscription", accessTeamId ?? null],
    queryFn: () => getCurrentSubscription({ teamId: accessTeamId }),
    staleTime: 20_000,
    enabled: shouldShowBillingSettings,
  });

  const billingHistoryQuery = useQuery({
    queryKey: [...BILLING_QUERY_KEY, "history"],
    queryFn: getBillingHistory,
    staleTime: 20_000,
  });

  useEffect(() => {
    if (shouldShowBillingSettings) return;
    router.replace(SETTINGS_ROUTES.PROFILE);
  }, [router, shouldShowBillingSettings]);

  if (!shouldShowBillingSettings) return null;

  const allPlans = useMemo(
    () => (plansQuery.data?.plans ?? []).filter(
      (plan) => (PAID_PLANS as readonly string[]).includes(plan.name),
    ),
    [plansQuery.data?.plans],
  );

  const latestInvoice = billingHistoryQuery.data?.[0] ?? null;

  const startTrialMutation = useMutation({
    mutationFn: ({
      planName,
      interval,
    }: {
      planName: SubscriptionPlanName;
      interval: "monthly" | "annual";
    }) => createSubscriptionCheckoutSession(planName, interval),
    onSuccess: (data) => {
      window.location.href = data.url;
    },
    onError: (error) => {
      toast({
        title: "Could not start trial",
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

  const currentPlan = subscriptionQuery.data?.currentPlan ?? null;
  const stripeSubscription = subscriptionQuery.data?.stripeSubscription ?? null;
  const hasAccessViaTeam = subscriptionQuery.data?.hasAccessViaTeam ?? false;

  const hasStripePremiumAccess = isStripePremiumAccessActive(
    stripeSubscription?.status,
    stripeSubscription?.planName,
  );

  const shouldUseBillingPortalCTA = hasStripePremiumAccess || hasAccessViaTeam;
  const activeStripePlanName = hasStripePremiumAccess
    ? (stripeSubscription?.planName ?? null)
    : null;
  const hasLockedPremiumPlanSelection = activeStripePlanName !== null;

  const isTrialing =
    stripeSubscription?.status === SUBSCRIPTION_STATUS.TRIALING;
  const hasStripeLifecycleActive = isStripeAccessActive(
    stripeSubscription?.status,
  );
  const hasScheduledCancellation =
    Boolean(stripeSubscription?.cancelAtPeriodEnd) &&
    hasStripeLifecycleActive &&
    hasStripePremiumAccess;
  const hasAccessUntilDate =
    hasScheduledCancellation && stripeSubscription?.currentPeriodEnd
      ? formatDateFromUnix(stripeSubscription.currentPeriodEnd)
      : null;

  const activePlanName =
    hasStripePremiumAccess && stripeSubscription?.planName
      ? stripeSubscription.planName
      : (currentPlan?.name ?? null);

  const activePrice =
    (hasStripePremiumAccess ? stripeSubscription?.formattedPrice : null) ??
    (currentPlan?.price && currentPlan?.currency
      ? formatCurrencyInCents(currentPlan.price, currentPlan.currency)
      : null);

  const nextPaymentLabel = stripeSubscription?.currentPeriodEnd
    ? formatDateFromUnix(stripeSubscription.currentPeriodEnd)
    : "N/A (Trial)";

  const paymentMethodLabel = latestInvoice
    ? getInvoiceCardLabel(latestInvoice)
    : "Not Added";

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <BillingPricingCards
        plans={allPlans}
        activePlanName={activeStripePlanName}
        hasLockedPlanSelection={hasLockedPremiumPlanSelection}
        isLoading={plansQuery.isLoading}
        isMutating={billingPortalMutation.isPending || startTrialMutation.isPending}
        shouldUseBillingPortal={shouldUseBillingPortalCTA}
        onStartCheckout={(planName, interval) =>
          startTrialMutation.mutate({
            planName: planName as SubscriptionPlanName,
            interval,
          })
        }
        onManageSubscription={() => billingPortalMutation.mutate()}
      />

      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <Card className="rounded-[3rem] border border-black/[0.03] bg-black/[0.02] p-10 shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold tracking-tighter uppercase opacity-30">
              Billing Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-6 space-y-6">
            <div className="flex items-center justify-between">
              <Txt as="p" size="sm" className="font-bold opacity-60">
                Current Plan
              </Txt>
              <Txt as="p" size="sm" className="font-bold">
                {formatPlanName(activePlanName)}
              </Txt>
            </div>
            <div className="flex items-center justify-between">
              <Txt as="p" size="sm" className="font-bold opacity-60">
                Next Payment
              </Txt>
              <Txt as="p" size="sm" className="font-bold">
                {nextPaymentLabel}
              </Txt>
            </div>
            <div className="flex items-center justify-between">
              <Txt as="p" size="sm" className="font-bold opacity-60">
                Payment Method
              </Txt>
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 opacity-40" />
                <Txt as="p" size="sm" className="font-bold">
                  {paymentMethodLabel}
                </Txt>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Txt as="p" size="sm" className="font-bold opacity-60">
                Current Price
              </Txt>
              <Txt as="p" size="sm" className="font-bold">
                {activePrice ?? "—"}
              </Txt>
            </div>
            {hasScheduledCancellation && hasAccessUntilDate ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <Txt as="p" size="xs" className="text-amber-700">
                  Access remains active until {hasAccessUntilDate}, then your
                  plan changes to Free.
                </Txt>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-[3rem] border border-black/[0.03] bg-black/[0.02] p-10 shadow-none">
          <CardHeader className="p-0">
            <CardTitle className="text-xl font-bold tracking-tighter uppercase opacity-30">
              Account Support
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 mt-6 space-y-6">
            <Txt as="p" size="sm" className="font-medium opacity-60">
              Need help managing seats or exploring enterprise options? Our team
              can guide setup, billing changes, and migration planning.
            </Txt>
            {stripeSubscription?.status ? (
              <div
                className={`rounded-2xl p-4 ${
                  hasScheduledCancellation
                    ? "border border-amber-200 bg-amber-50"
                    : "border border-black/10 bg-white/80"
                }`}
              >
                <Txt as="p" size="sm">
                  Billing status:{" "}
                  <span className="font-semibold capitalize">
                    {stripeSubscription.status.replace("_", " ")}
                  </span>
                  {isTrialing && stripeSubscription.trialEnd
                    ? ` · Trial ends ${formatDateFromUnix(stripeSubscription.trialEnd)}`
                    : ""}
                </Txt>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="p-0 mt-6">
            <Button
              variant="outline"
              className="w-full h-12 rounded-2xl border-black/10 font-bold hover:bg-black/5"
              onClick={() => billingPortalMutation.mutate()}
              disabled={billingPortalMutation.isPending}
            >
              {billingPortalMutation.isPending
                ? "Opening..."
                : "Contact Support"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-6">
        <div className="space-y-1">
          <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
            Payment history
          </Txt>
          <Txt as="p" size="sm" tone="muted">
            A record of your previous invoices.
          </Txt>
        </div>

        {billingHistoryQuery.isLoading ? (
          <Txt as="p" size="sm" tone="muted">
            Loading payments...
          </Txt>
        ) : billingHistoryQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
            <Txt as="p" size="sm" className="text-rose-700">
              We could not load your payment history.
            </Txt>
          </div>
        ) : (billingHistoryQuery.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <Txt as="p" size="sm" tone="muted">
              No payments yet.
            </Txt>
          </div>
        ) : (
          <div className="rounded-2xl border border-black/10 overflow-hidden bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Card</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(billingHistoryQuery.data ?? []).map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell>{formatDateFromUnix(invoice.created)}</TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell>{getInvoiceCardLabel(invoice)}</TableCell>
                    <TableCell className="capitalize">
                      {invoice.status.replace("_", " ")}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrencyInCents(invoice.amountPaid, invoice.currency)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
