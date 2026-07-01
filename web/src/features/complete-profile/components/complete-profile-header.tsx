"use client";

import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Txt } from "@/shared/ui";

interface CompleteProfileHeaderProps {
  isFetching: boolean;
  onRefresh: () => void;
}

export function CompleteProfileHeader({
  isFetching,
  onRefresh,
}: CompleteProfileHeaderProps) {
  return (
    <div className="flex items-end justify-between gap-6">
      <div className="space-y-3">
        <Txt as="h1" size="5xl" weight="bold" className="tracking-tighter">
          Almost there ✨
        </Txt>
        <Txt as="p" size="xl" weight="medium" className="opacity-50">
          Complete your setup to unlock the workstation
        </Txt>
      </div>
      <Button
        type="button"
        variant="outline"
        disabled={isFetching}
        onClick={onRefresh}
        className="!rounded-2xl gap-2 font-bold shrink-0 mb-1"
      >
        <RefreshCw className={cn("size-4", isFetching && "animate-spin")} />
        {isFetching ? "Refreshing..." : "Recheck progress"}
      </Button>
    </div>
  );
}
