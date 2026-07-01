"use client";

import { useCallback, useMemo, useState } from "react";
import { Bell, Briefcase, CreditCard, Globe } from "lucide-react";
import { PROFILE_COMPLETION_STEPS } from "@/features/settings/api/profile-completion-service";
import { useProfileCompletion } from "@/features/settings/hooks/use-profile-completion";
import { SETTINGS_ROUTES } from "@/features/settings/routes";
import { useAuth } from "@/lib/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { useWorkspaceAccessValidation } from "@/features/workspace/hooks/use-workspace-access-validation";
import { ProfileCompletionStepId, CompleteProfileStepData } from "../types";

const COMPLETE_PROFILE_STEPS_DEFINITION = [
  {
    id: PROFILE_COMPLETION_STEPS.AGENT_AND_TC,
    title: "Agent & TC - Preferred partners",
    description: "Select your role and workspace type",
    icon: Briefcase,
    href: SETTINGS_ROUTES.PROFILE,
  },
  {
    id: PROFILE_COMPLETION_STEPS.CALENDAR,
    title: "Calendar & Email Integration",
    description: "Sync with Google or Outlook",
    icon: Globe,
    href: SETTINGS_ROUTES.PROFILE,
  },
  {
    id: PROFILE_COMPLETION_STEPS.NOTIFICATIONS,
    title: "Notifications & Preferences",
    description: "Configure your alert settings",
    icon: Bell,
    href: SETTINGS_ROUTES.NOTIFICATIONS,
  },
  {
    id: PROFILE_COMPLETION_STEPS.SUBSCRIPTION,
    title: "Subscription",
    description: "Manage your workstation plan",
    icon: CreditCard,
    href: SETTINGS_ROUTES.BILLING,
    isOptional: true,
  },
] as const;

const REQUIRED_COMPLETE_PROFILE_STEP_IDS: ProfileCompletionStepId[] = [
  PROFILE_COMPLETION_STEPS.AGENT_AND_TC,
  PROFILE_COMPLETION_STEPS.CALENDAR,
  PROFILE_COMPLETION_STEPS.NOTIFICATIONS,
];

export function useCompleteProfile() {
  const { user } = useAuth();
  const { selectedTeamId } = useWorkspace();
  const [activeStepId, setActiveStepId] = useState<ProfileCompletionStepId | null>(null);

  const {
    shouldShowSubscriptionUi,
    subscriptionQuery,
    hasSubscriptionAccess,
  } = useWorkspaceAccessValidation({
    user,
    selectedTeamId,
    queryKey: ["complete-profile", "access-validation"],
  });

  const completionQuery = useProfileCompletion({
    userId: user?.id,
    staleTime: 20_000,
  });

  const completion = completionQuery.data;
  const missingSteps = completion?.missingItems ?? [];
  const isCompletionReady =
    completionQuery.data !== undefined || completionQuery.isError;
  const isSubscriptionReady =
    !shouldShowSubscriptionUi ||
    subscriptionQuery.data !== undefined ||
    subscriptionQuery.isError;
  const isLoading = !isCompletionReady || !isSubscriptionReady;

  const resolvedSteps = useMemo<CompleteProfileStepData[]>(
    () =>
      COMPLETE_PROFILE_STEPS_DEFINITION.map((step) => ({
        ...step,
        isCompleted:
          step.id === PROFILE_COMPLETION_STEPS.SUBSCRIPTION
            ? hasSubscriptionAccess
            : !missingSteps.includes(step.id),
      })).filter(
        (step) =>
          step.id !== PROFILE_COMPLETION_STEPS.SUBSCRIPTION ||
          shouldShowSubscriptionUi,
      ),
    [hasSubscriptionAccess, missingSteps, shouldShowSubscriptionUi],
  );

  const steps = useMemo<CompleteProfileStepData[]>(
    () =>
      resolvedSteps.map((step) => ({
        ...step,
        isCompleted: isLoading ? false : step.isCompleted,
      })),
    [isLoading, resolvedSteps],
  );

  const requiredRemainingCount = useMemo(
    () =>
      REQUIRED_COMPLETE_PROFILE_STEP_IDS.filter((stepId) =>
        missingSteps.includes(stepId),
      ).length,
    [missingSteps],
  );

  const handleStepSaved = useCallback(
    async (
      stepId: ProfileCompletionStepId,
      options?: { closeOnComplete?: boolean },
    ) => {
      const closeOnComplete = options?.closeOnComplete ?? true;
      const result = await completionQuery.refetch();
      const stillMissing = result.data?.missingItems ?? [];
      if (closeOnComplete && !stillMissing.includes(stepId)) {
        setActiveStepId(null);
      }
    },
    [completionQuery],
  );

  const handleRefresh = useCallback(() => {
    void completionQuery.refetch();
    void subscriptionQuery.refetch();
  }, [completionQuery, subscriptionQuery]);

  const handleToggleStep = useCallback((stepId: ProfileCompletionStepId) => {
    setActiveStepId((prev) => (prev === stepId ? null : stepId));
  }, []);

  return {
    steps,
    activeStepId,
    completionPercentage: isLoading ? 0 : completion?.completionPercentage ?? 0,
    remainingCount: isLoading
      ? REQUIRED_COMPLETE_PROFILE_STEP_IDS.length
      : requiredRemainingCount,
    isComplete: !isLoading && (completion?.isComplete ?? false),
    isFetching: completionQuery.isFetching,
    isLoading,
    userId: user?.id ?? null,
    actions: {
      toggleStep: handleToggleStep,
      refresh: handleRefresh,
      onStepSaved: handleStepSaved,
    },
  };
}
