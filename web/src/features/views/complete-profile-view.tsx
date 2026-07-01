"use client";

import Link from "next/link";
import { CompleteProfileHeader } from "@/features/complete-profile/components/complete-profile-header";
import { CompleteProfileProgress } from "@/features/complete-profile/components/complete-profile-progress";
import { CompleteProfileStepItem } from "@/features/complete-profile/components/complete-profile-step-item";
import { useCompleteProfile } from "@/features/complete-profile/hooks/use-complete-profile";
import { WORKSPACE_ROUTES } from "@/features/workspace/routes";
import { Button } from "@/shared/ui";

export function CompleteProfileView() {
  const {
    steps,
    activeStepId,
    completionPercentage,
    remainingCount,
    isComplete,
    isFetching,
    isLoading,
    userId,
    actions,
  } = useCompleteProfile();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto my-auto w-full">
      <CompleteProfileHeader 
        isFetching={isFetching} 
        onRefresh={actions.refresh} 
      />

      <CompleteProfileProgress 
        remainingCount={remainingCount} 
        percentage={completionPercentage} 
        isLoading={isLoading}
      />

      <div className="space-y-4">
        {steps.map((step) => (
          <CompleteProfileStepItem
            key={step.id}
            step={step}
            isActive={!isLoading && activeStepId === step.id}
            isLoading={isLoading}
            onToggle={() => actions.toggleStep(step.id)}
            onSaved={actions.onStepSaved}
            userId={userId}
          />
        ))}
      </div>

      {isComplete ? (
        <div className="flex justify-end">
          <Button asChild>
            <Link href={WORKSPACE_ROUTES.HOME}>Go to dashboard</Link>
          </Button>
        </div>
      ) : null}
    </div>
  );
}
