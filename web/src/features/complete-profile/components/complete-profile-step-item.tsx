"use client";

import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { CompleteProfileAgentTcStep } from "@/features/complete-profile/components/complete-profile-agent-tc-step";
import { CompleteProfileSubscriptionStep } from "@/features/complete-profile/components/complete-profile-subscription-step";
import { PROFILE_COMPLETION_STEPS } from "@/features/settings/api/profile-completion-service";
import { ProfileSettingsCalendarSyncCard } from "@/features/settings/components/profile-settings-calendar-sync-card";
import { ProfileSettingsConnectedAccountsCard } from "@/features/settings/components/profile-settings-connected-accounts-card";
import { SettingsNotificationPreferencesCard } from "@/features/settings/components/settings-notification-preferences-card";
import { cn } from "@/lib/utils";
import { Button, Card, Txt } from "@/shared/ui";
import { ProfileCompletionStepId, CompleteProfileStepData } from "../types";

interface CompleteProfileStepItemProps {
  step: CompleteProfileStepData;
  isActive: boolean;
  isLoading?: boolean;
  onToggle: () => void;
  onSaved: (stepId: ProfileCompletionStepId, options?: { closeOnComplete?: boolean }) => void;
  userId: string | null;
}

export function CompleteProfileStepItem({
  step,
  isActive,
  isLoading = false,
  onToggle,
  onSaved,
  userId,
}: CompleteProfileStepItemProps) {
  const isCompleted = !isLoading && step.isCompleted;

  return (
    <div className="space-y-3">
      <button
        type="button"
        className="w-full text-left"
        disabled={isLoading}
        onClick={onToggle}
      >
        <div
          className={cn(
            "group relative flex items-center justify-between p-6 rounded-[2rem] transition-all border heavy-shadow",
            isLoading
              ? "bg-white border-black/5"
              : isCompleted
              ? "bg-green-500/5 border-green-500/20 opacity-80"
              : "bg-white border-black/5 hover:scale-[1.01] active:scale-95",
            isActive && "ring-2 ring-primary/30",
          )}
        >
          <div className="flex items-center gap-5">
            <div
              className={cn(
                "h-14 w-14 rounded-[1.25rem] flex items-center justify-center transition-all",
                isLoading
                  ? "bg-black/[0.03] text-foreground/40"
                  : isCompleted
                  ? "bg-green-500/10 text-green-600"
                  : "bg-black/[0.03] text-foreground/40 group-hover:bg-primary/5 group-hover:text-primary",
              )}
            >
              <step.icon className="size-7" strokeWidth={2.5} />
            </div>
            <div className="space-y-1">
              <Txt
                as="h3"
                size="xl"
                weight="bold"
                className={cn(
                  "tracking-tight",
                  isCompleted && "text-green-700",
                )}
              >
                {step.title}
              </Txt>
              <Txt as="p" size="sm" tone="muted">
                {step.description}
              </Txt>
              {step.isOptional ? (
                <Txt
                  as="p"
                  tone="muted"
                  className="uppercase tracking-wide absolute top-1 right-5 text-[0.525rem] font-bold"
                >
                  Optional
                </Txt>
              ) : null}
            </div>
          </div>

          <div
            className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center border-2 transition-all",
              isLoading
                ? "bg-white border-black/10"
                : isCompleted
                ? "bg-green-600 text-white border-green-600"
                : "bg-white border-black/10 group-hover:border-primary/40",
            )}
          >
            {isLoading ? (
              <ChevronRight className="size-5 opacity-40" />
            ) : isCompleted ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <ChevronRight
                className={cn(
                  "size-5 opacity-40 transition-transform",
                  isActive && "rotate-90",
                )}
              />
            )}
          </div>
        </div>
      </button>

      {isActive ? (
        <Card className="rounded-[2rem] border-0 shadow-default glass-card p-6 md:p-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="flex justify-end">
            <Button variant="outline" asChild>
              <Link href={step.href}>
                Open full page
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>

          {step.id === PROFILE_COMPLETION_STEPS.AGENT_AND_TC ? (
            <CompleteProfileAgentTcStep
              userId={userId}
              onSaved={() => onSaved(PROFILE_COMPLETION_STEPS.AGENT_AND_TC)}
            />
          ) : null}

          {step.id === PROFILE_COMPLETION_STEPS.CALENDAR ? (
            <div className="space-y-6">
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 flex items-start gap-3">
                <CalendarClock className="size-4 mt-0.5 text-foreground/70" />
                <Txt as="p" size="sm" tone="muted">
                  Connect an account, then select the sync calendar for it.
                </Txt>
              </div>
              <ProfileSettingsConnectedAccountsCard userId={userId} />
              <ProfileSettingsCalendarSyncCard
                userId={userId}
                onSaved={() => onSaved(PROFILE_COMPLETION_STEPS.CALENDAR)}
              />
            </div>
          ) : null}

          {step.id === PROFILE_COMPLETION_STEPS.NOTIFICATIONS ? (
            <SettingsNotificationPreferencesCard
              onSaved={() =>
                onSaved(PROFILE_COMPLETION_STEPS.NOTIFICATIONS, {
                  closeOnComplete: false,
                })
              }
            />
          ) : null}

          {step.id === PROFILE_COMPLETION_STEPS.SUBSCRIPTION ? (
            <CompleteProfileSubscriptionStep
              onSaved={() => onSaved(PROFILE_COMPLETION_STEPS.SUBSCRIPTION)}
            />
          ) : null}
        </Card>
      ) : null}
    </div>
  );
}
