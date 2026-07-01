"use client"

import { Skeleton } from "@/shared/ui/skeleton"
import { cn } from "@/lib/utils"

type ViewMode = "grid" | "list"

type TransactionsListSkeletonProps = {
  viewMode: ViewMode
}

export function TransactionsListSkeleton({
  viewMode,
}: TransactionsListSkeletonProps) {
  const count = viewMode === "grid" ? 6 : 5
  return (
    <div
      className={cn(
        viewMode === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
          : "space-y-6",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "rounded-[2rem] border border-white/80 dark:border-white/10",
            viewMode === "grid" ? "h-56 rounded-[3rem]" : "h-24 rounded-[2rem]",
          )}
        />
      ))}
    </div>
  )
}
