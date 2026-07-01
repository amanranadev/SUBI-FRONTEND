"use client";

import { BadgeCheck, Briefcase } from "lucide-react";
import { Txt } from "@/shared/ui";
import { cn } from "@/lib/utils";

type ProfileSettingsStatusProps = {
  isLoading: boolean;
  isComplete: boolean;
  completionPercentage: number;
  className?: string;
};

export function ProfileSettingsStatus({
  isLoading,
  isComplete,
  completionPercentage,
  className,
}: ProfileSettingsStatusProps) {
  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Txt as="h3" size="lg" weight="bold">
          Profile Status
        </Txt>
        <Txt
          as="span"
          size="xs"
          weight="bold"
          className={cn(
            "rounded-full px-3 py-1 border uppercase",
            isComplete
              ? "border-green-300 bg-green-50 text-green-600"
              : "border-yellow-300 bg-yellow-50 text-yellow-700",
          )}
        >
          {isLoading
            ? "Loading..."
            : isComplete
              ? "Complete"
              : `${completionPercentage}% Complete`}
        </Txt>
      </div>
      <div className="flex items-center justify-between">
        <Txt
          as="span"
          size="xs"
          weight="bold"
          className="uppercase tracking-widest opacity-30"
        >
          Account Status
        </Txt>
        <Txt
          as="span"
          size="xs"
          weight="bold"
          className="inline-flex items-center gap-1.5 uppercase tracking-widest text-green-600"
        >
          <BadgeCheck className="size-4" />
          {isLoading ? "Loading..." : "Verified"}
        </Txt>
      </div>
      <div className="flex items-center justify-between">
        <Txt
          as="span"
          size="xs"
          weight="bold"
          className="uppercase tracking-widest opacity-30"
        >
          Agent Tier
        </Txt>
        <Txt
          as="span"
          size="xs"
          weight="bold"
          className="inline-flex items-center gap-1.5 uppercase tracking-widest text-primary"
        >
          <Briefcase className="size-4" />
          Enterprise
        </Txt>
      </div>
    </div>
  );
}
