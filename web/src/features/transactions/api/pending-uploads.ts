import { apiClient } from "@/lib/api/client";
import { USER_UPLOAD_ENDPOINTS } from "./endpoints";
import type { PendingUploadsResponse } from "../types";

const DEFAULTS = { perPage: 10 } as const;

export type FetchPendingUploadsParams = {
  page?: number;
  perPage?: number;
};

export async function fetchPendingUploads(
  params?: FetchPendingUploadsParams,
): Promise<PendingUploadsResponse> {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? DEFAULTS.perPage;

  const { data } = await apiClient.get<PendingUploadsResponse>(
    `${USER_UPLOAD_ENDPOINTS.pending}?page=${page}&per_page=${perPage}`,
  );

  return {
    success: data.success ?? true,
    data: data.data ?? [],
    pagination: data.pagination ?? {
      page: 1,
      per_page: perPage,
      total: 0,
      total_pages: 0,
      has_more: false,
    },
  };
}

export async function deletePendingUpload(id: string): Promise<void> {
  await apiClient.delete(USER_UPLOAD_ENDPOINTS.get(id));
}
