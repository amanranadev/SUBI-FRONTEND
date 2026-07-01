import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getCurrentSubscription,
  isPremiumSubscriptionPlanName,
  isStripePremiumAccessActive,
  type BillingCurrentSubscription,
} from "@/features/settings/api/profile-billing-service";

type UseCurrentSubscriptionAccessInput = {
  queryKey: readonly string[];
  enabled?: boolean;
  teamId?: string | null;
  staleTime?: number;
};

function getWorkspaceLockStateWhenStripeIsLive(
  data: BillingCurrentSubscription,
  hasStripeAccess: boolean,
  hasCurrentPlanPremiumAccess: boolean,
) {
  const trialExpired = !data.trialEndsAt || data.trialEndsAt * 1000 <= Date.now();
  return (
    !data.hasAccessViaTeam &&
    !hasStripeAccess &&
    !hasCurrentPlanPremiumAccess &&
    trialExpired
  );
}

export function useCurrentSubscriptionAccess({
  queryKey,
  enabled = true,
  teamId,
  staleTime = 20_000,
}: UseCurrentSubscriptionAccessInput) {
  const subscriptionQuery = useQuery({
    queryKey: [...queryKey, teamId ?? null],
    queryFn: () => getCurrentSubscription({ teamId }),
    enabled,
    staleTime,
  });

  const data: BillingCurrentSubscription | undefined = subscriptionQuery.data;

  const hasStripeAccess = useMemo(
    () =>
      isStripePremiumAccessActive(
        data?.stripeSubscription?.status,
        data?.stripeSubscription?.planName,
      ),
    [data?.stripeSubscription?.status, data?.stripeSubscription?.planName],
  );

  const hasCurrentPlanPremiumAccess = useMemo(
    () => isPremiumSubscriptionPlanName(data?.currentPlan?.name),
    [data?.currentPlan?.name],
  );

  const hasSubscriptionAccess = useMemo(
    () =>
      Boolean(data?.hasAccessViaTeam) ||
      hasStripeAccess ||
      hasCurrentPlanPremiumAccess,
    [data?.hasAccessViaTeam, hasStripeAccess, hasCurrentPlanPremiumAccess],
  );

  const shouldLockWorkspace = useMemo(() => {
    if (!data) return false;
    return getWorkspaceLockStateWhenStripeIsLive(
      data,
      hasStripeAccess,
      hasCurrentPlanPremiumAccess,
    );
  }, [data, hasStripeAccess, hasCurrentPlanPremiumAccess]);

  return {
    subscriptionQuery,
    data,
    hasStripeAccess,
    hasCurrentPlanPremiumAccess,
    hasSubscriptionAccess,
    shouldLockWorkspace,
  };
}
