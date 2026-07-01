"use client";

import { useCallback, useEffect, useRef } from "react";

import type { PendingUpload } from "../types";
import { LoadingSpinner, Txt } from "@/shared/ui";
import { DraftCard } from "./draft-card";

type DraftsSectionProps = {
  drafts: PendingUpload[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  isLoadingMore: boolean;
  totalCount?: number;
  onOpen: (draft: PendingUpload) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export function DraftsSection({
  drafts,
  isLoading,
  hasMore,
  onLoadMore,
  isLoadingMore,
  totalCount,
  onOpen,
  onDelete,
  isDeleting,
}: DraftsSectionProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isInitialLoading = isLoading && drafts.length === 0;
  const hasDrafts = drafts.length > 0;

  const tryLoadMore = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    onLoadMore();
  }, [hasMore, isLoadingMore, isLoading, onLoadMore]);

  useEffect(() => {
    if (!scrollRef.current) return;
    if (!hasMore || isLoadingMore || isInitialLoading) return;

    // Auto-load next pages until the list can actually scroll.
    const needsMoreToOverflow =
      scrollRef.current.scrollHeight <= scrollRef.current.clientHeight + 8;
    if (needsMoreToOverflow) {
      onLoadMore();
    }
  }, [drafts.length, hasMore, isLoadingMore, isInitialLoading, onLoadMore]);

  useEffect(() => {
    if (!hasMore || isLoadingMore || isInitialLoading) return;
    if (!scrollRef.current || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          tryLoadMore();
        }
      },
      {
        root: scrollRef.current,
        rootMargin: "0px 0px 200px 0px",
        threshold: 0.1,
      },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isInitialLoading, tryLoadMore]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 80) {
      tryLoadMore();
    }
  }, [tryLoadMore]);

  if (!isInitialLoading && !hasDrafts) {
    return null;
  }

  return (
    <div className="w-full max-w-2xl space-y-4 [@media(max-height:720px)]:h-full [@media(max-height:720px)]:min-h-0 [@media(max-height:720px)]:flex [@media(max-height:720px)]:flex-col [@media(max-height:720px)]:gap-2 [@media(max-height:720px)]:space-y-0">
      {hasDrafts && (
        <div className="flex items-center justify-between">
          <Txt className="text-sm [@media(max-height:720px)]:text-xs font-bold uppercase tracking-widest [@media(max-height:720px)]:tracking-[0.12em] text-muted-foreground/50 px-2 [@media(max-height:720px)]:px-1">
            Pending Drafts
          </Txt>
          {typeof totalCount === "number" && (
            <Txt className="px-2 [@media(max-height:720px)]:px-1 text-[10px] [@media(max-height:720px)]:text-[9px] text-muted-foreground">
              Showing {drafts.length} of {totalCount}
            </Txt>
          )}
        </div>
      )}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="max-h-[32rem] [@media(max-height:720px)]:max-h-none [@media(max-height:720px)]:flex-1 [@media(max-height:720px)]:min-h-0 overflow-y-auto pr-1 space-y-3 [@media(max-height:720px)]:space-y-2 pb-7 [@media(max-height:720px)]:pb-1"
      >
        {isInitialLoading && (
          <div className="h-full min-h-40 flex items-center justify-center gap-3 text-muted-foreground">
            <LoadingSpinner size="md" />
            <span className="text-sm font-medium">Loading drafts...</span>
          </div>
        )}

        {drafts.map((draft) => (
          <DraftCard
            key={draft.id}
            draft={draft}
            onOpen={onOpen}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ))}



        {isLoadingMore && (
          <div className="flex items-center justify-center py-3 text-muted-foreground">
            <LoadingSpinner size="md" className="mr-2" />
            <span className="text-sm">Loading more drafts...</span>
          </div>
        )}

        <div ref={sentinelRef} className="h-1" />
      </div>
    </div>
  );
}
