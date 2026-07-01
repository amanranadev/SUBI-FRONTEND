"use client";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  fetchPendingUploads,
  deletePendingUpload,
} from "../api/pending-uploads";

const PENDING_UPLOADS_KEY = ["pending-uploads"] as const;
const PER_PAGE = 3;

export function usePendingUploads() {
  const queryClient = useQueryClient();

  const infiniteQuery = useInfiniteQuery({
    queryKey: PENDING_UPLOADS_KEY,
    queryFn: ({ pageParam }) =>
      fetchPendingUploads({ page: pageParam, perPage: PER_PAGE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const pagination = lastPage.pagination;

      if (pagination) {
        return pagination.has_more ? pagination.page + 1 : undefined;
      }

      // Fallback when API does not include pagination metadata.
      return lastPage.data.length >= PER_PAGE ? allPages.length + 1 : undefined;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePendingUpload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PENDING_UPLOADS_KEY });
    },
  });

  const drafts = infiniteQuery.data?.pages.flatMap((page) => page.data) ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: PENDING_UPLOADS_KEY });
  };

  const lastPage =
    infiniteQuery.data?.pages[infiniteQuery.data.pages.length - 1] ?? null;

  const hasMoreFromPagination = lastPage?.pagination?.has_more ?? null;
  const totalCount = infiniteQuery.data?.pages[0]?.pagination?.total;
  const hasMoreFromTotal =
    typeof totalCount === "number" ? drafts.length < totalCount : null;
  const hasMoreFromLength = lastPage ? lastPage.data.length >= PER_PAGE : false;
  const hasMore = hasMoreFromPagination ?? hasMoreFromTotal ?? hasMoreFromLength;

  const loadMore = () => {
    if (!hasMore || infiniteQuery.isFetchingNextPage) return;
    void infiniteQuery.fetchNextPage();
  };

  return {
    drafts,
    isLoading: infiniteQuery.isLoading,
    error: infiniteQuery.error,
    hasMore,
    loadMore,
    isLoadingMore: infiniteQuery.isFetchingNextPage,
    totalCount,
    deleteDraft: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    invalidate,
  };
}
