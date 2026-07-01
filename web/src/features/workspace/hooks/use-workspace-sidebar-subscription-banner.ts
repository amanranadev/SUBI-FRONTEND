import { useMemo } from "react";
import {
  SUBSCRIPTION_STATUS,
} from "@/features/settings/api/profile-billing-service";
import { getWorkspaceSidebarTrialDaysRemaining } from "@/features/workspace/utils/workspace-sidebar-trial-days";
import { useWorkspaceAccessValidation } from "@/features/workspace/hooks/use-workspace-access-validation";
import type { User } from "@/lib/auth/types";

type UseWorkspaceSidebarSubscriptionBannerInput = {
  user: User | null | undefined;
  selectedTeamId?: string | null;
  enabled?: boolean;
};

export function useWorkspaceSidebarSubscriptionBanner({
  user,
  selectedTeamId,
  enabled = true,
}: UseWorkspaceSidebarSubscriptionBannerInput) {
  const {
    subscriptionQuery,
    subscriptionData,
    hasSubscriptionAccess,
    shouldLockWorkspace,
    shouldShowSubscriptionUi,
  } = useWorkspaceAccessValidation({
    user,
    selectedTeamId,
    staleTime: 30_000,
    enabled,
    queryKey: ["app-sidebar", "current-subscription"],
  });
  const data = subscriptionData;

  const trialDaysRemaining = useMemo(() => {
    const trialEndsAt = data?.trialEndsAt;
    if (!trialEndsAt) return null;
    return getWorkspaceSidebarTrialDaysRemaining(trialEndsAt);
  }, [data?.trialEndsAt]);

  const shouldShowSubscriptionBanner =
    !user?.isSuperadmin &&
    Boolean(user?.id) &&
    shouldShowSubscriptionUi &&
    subscriptionQuery.isSuccess &&
    !hasSubscriptionAccess;

  const subscriptionBannerMessage = useMemo(() => {
    const stripeStatus = data?.stripeSubscription?.status ?? null;
    const hasStripeSubscriptionRecord = Boolean(
      data?.stripeSubscription?.id,
    );
    const hasTrialStarted = Boolean(data?.trialEndsAt);

    if (trialDaysRemaining !== null && trialDaysRemaining > 0) {
      return `${trialDaysRemaining} day${trialDaysRemaining === 1 ? "" : "s"} left in your free trial`;
    }

    if (stripeStatus === SUBSCRIPTION_STATUS.CANCELED) {
      return "Subscription canceled. Subscribe again to restore access.";
    }

    if (!hasStripeSubscriptionRecord && !hasTrialStarted) {
      return "No subscription yet. Start your subscription.";
    }

    if (shouldLockWorkspace) {
      return "Trial ended. Subscribe to restore access.";
    }

    return "No active subscription. Subscribe to keep access active.";
  }, [
    data?.stripeSubscription?.status,
    data?.stripeSubscription?.id,
    data?.trialEndsAt,
    trialDaysRemaining,
    shouldLockWorkspace,
  ]);

  return {
    shouldLockWorkspace,
    shouldShowSubscriptionBanner,
    subscriptionBannerMessage,
  };
}
