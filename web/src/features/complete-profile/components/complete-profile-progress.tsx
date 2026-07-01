"use client";

import { Progress, Txt } from "@/shared/ui";

interface CompleteProfileProgressProps {
  remainingCount: number;
  percentage: number;
  isLoading: boolean;
}

export function CompleteProfileProgress({
  remainingCount,
  percentage,
  isLoading,
}: CompleteProfileProgressProps) {
  return (
    <div className="flex items-center justify-between gap-6 bg-black/[0.02] p-6 rounded-[2rem] border border-black/[0.03]">
      <Txt
        as="span"
        size="sm"
        weight="bold"
        className="tracking-widest uppercase opacity-60"
      >
        {remainingCount} tasks remaining
      </Txt>
      <div className="flex-1 flex items-center gap-5">
        <div className="flex-1">
          <Progress
            striped={false}
            value={percentage}
            className="h-3 bg-black/5"
          />
        </div>
        <Txt
          as="span"
          size="lg"
          weight="bold"
          className="tracking-tight whitespace-nowrap"
        >
          {isLoading ? "Loading..." : `${percentage}% Complete`}
        </Txt>
      </div>
    </div>
  );
}
