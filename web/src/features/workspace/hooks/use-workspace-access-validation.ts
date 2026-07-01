"use client";

import { useMemo } from "react";
import { useCurrentSubscriptionAccess } from "@/features/settings/hooks/use-current-subscription-access";
import {
  isStripePremiumAccessActive,
  isMultiSeatPlanName,
  normalizeSubscriptionPlanName,
} from "@/features/settings/api/profile-billing-service";
import type { User } from "@/lib/auth/types";

type UseWorkspaceAccessValidationInput = {
  user: User | null | undefined;
  selectedTeamId?: string | null;
  queryKey: readonly string[];
  enabled?: boolean;
  staleTime?: number;
};

function resolveAccessTeamId(
  selectedTeamId: string | null | undefined,
  userTeamId: string | null | undefined,
  teamIds: string[],
): string | null {
  if (selectedTeamId && teamIds.includes(selectedTeamId)) return selectedTeamId;
  if (teamIds.length > 1) return teamIds[1] ?? null;
  return userTeamId ?? teamIds[0] ?? null;
}

export function useWorkspaceAccessValidation({
  user,
  selectedTeamId,
  queryKey,
  enabled = true,
  staleTime = 20_000,
}: UseWorkspaceAccessValidationInput) {
  const availableTeamIds = useMemo(
    () => (user?.teams ?? []).map((team) => team.id),
    [user?.teams],
  );
  const primaryTeamId = availableTeamIds[0] ?? null;
  const accessTeamId = resolveAccessTeamId(
    selectedTeamId,
    user?.teamId,
    availableTeamIds,
  );
  const hasInvitedTeam = availableTeamIds.length > 1;
  const isInvitedTeamContext = Boolean(
    hasInvitedTeam &&
      accessTeamId &&
      primaryTeamId &&
      accessTeamId !== primaryTeamId,
  );
  const canResolveTeamContext =
    availableTeamIds.length === 0 || Boolean(accessTeamId);
  const shouldCheckSubscription = Boolean(
    user?.id && !user?.isSuperadmin && enabled && canResolveTeamContext,
  );

  const { subscriptionQuery, data, hasStripeAccess, hasSubscriptionAccess, shouldLockWorkspace } =
    useCurrentSubscriptionAccess({
      queryKey,
      teamId: accessTeamId,
      enabled: shouldCheckSubscription,
      staleTime,
    });

  const currentPlanName = normalizeSubscriptionPlanName(data?.currentPlan?.name);
  const hasMultiSeatCurrentPlan = isMultiSeatPlanName(currentPlanName);
  const stripePlanName = normalizeSubscriptionPlanName(
    data?.stripeSubscription?.planName,
  );
  const hasActiveMultiSeatStripeSubscription =
    isStripePremiumAccessActive(data?.stripeSubscription?.status, stripePlanName) &&
    isMultiSeatPlanName(stripePlanName);
  const hasActivePaidTeamSubscription =
    hasMultiSeatCurrentPlan || hasActiveMultiSeatStripeSubscription;

  return {
    accessTeamId,
    primaryTeamId,
    hasInvitedTeam,
    isInvitedTeamContext,
    canResolveTeamContext,
    subscriptionQuery,
    subscriptionData: data,
    hasStripeAccess,
    hasSubscriptionAccess,
    hasActivePaidTeamSubscription,
    shouldLockWorkspace,
    shouldShowBillingSettings: !isInvitedTeamContext,
    shouldShowSubscriptionUi: !isInvitedTeamContext,
  };
}
