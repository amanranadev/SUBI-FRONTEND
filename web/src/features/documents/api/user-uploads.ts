import { USER_UPLOAD_ENDPOINTS } from "@/features/transactions/api/endpoints";
import { apiClient } from "@/lib/api/client";
import type {
  DocumentRecord,
  UserUploadApiRecord,
  UserUploadsListResponse,
  UserUploadsPagination,
} from "../types";
import { normalizeDocumentUpload } from "../utils";

const DEFAULT_PER_PAGE = 100;
const MAX_PAGES = 25;

type FetchUserUploadsPageParams = {
  page?: number;
  perPage?: number;
};

function buildFallbackPagination(
  page: number,
  perPage: number,
  count: number,
): UserUploadsPagination {
  const totalPages = count < perPage ? page : page + 1;

  return {
    page,
    per_page: perPage,
    total: page === 1 ? count : page * perPage,
    total_pages: totalPages,
    has_more: count >= perPage,
  };
}

function extractUploads(payload: unknown): UserUploadApiRecord[] {
  if (Array.isArray(payload)) {
    return payload as UserUploadApiRecord[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { data?: unknown[] }).data)
  ) {
    return (payload as { data: UserUploadApiRecord[] }).data;
  }

  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { user_uploads?: unknown[] }).user_uploads)
  ) {
    return (payload as { user_uploads: UserUploadApiRecord[] }).user_uploads;
  }

  return [];
}

export async function fetchUserUploadsPage(
  params?: FetchUserUploadsPageParams,
): Promise<UserUploadsListResponse> {
  const page = params?.page ?? 1;
  const perPage = params?.perPage ?? DEFAULT_PER_PAGE;

  const { data } = await apiClient.get(USER_UPLOAD_ENDPOINTS.list, {
    params: {
      page,
      per_page: perPage,
    },
  });

  const uploads = extractUploads(data);
  const payload = (data ?? {}) as {
    success?: boolean;
    pagination?: UserUploadsPagination;
  };

  return {
    success: payload.success ?? true,
    data: uploads,
    pagination:
      payload.pagination ?? buildFallbackPagination(page, perPage, uploads.length),
  };
}

export async function fetchAllUserUploads(): Promise<DocumentRecord[]> {
  const uploads: UserUploadApiRecord[] = [];

  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await fetchUserUploadsPage({ page, perPage: DEFAULT_PER_PAGE });
    uploads.push(...response.data);

    if (!response.pagination.has_more) {
      break;
    }
  }

  const normalized = uploads
    .map(normalizeDocumentUpload)
    .filter((upload) => upload.id);

  const unique = Array.from(
    new Map(normalized.map((upload) => [upload.id, upload])).values(),
  );

  return unique.sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
}

export async function deleteUserUpload(id: string): Promise<void> {
  await apiClient.delete(USER_UPLOAD_ENDPOINTS.get(id));
}

export type UserUploadDownloadTarget = {
  mode: "authenticated" | "direct";
  url: string;
};

function toAbsoluteUrl(pathOrUrl: string, baseUrl: string) {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;

  return `${baseUrl}${normalizedPath}`;
}

export function getUserUploadDownloadTarget(
  upload: DocumentRecord,
): UserUploadDownloadTarget {
  const downloadUrl = upload.file?.downloadUrl ?? upload.file?.url;
  const baseUrl = apiClient.defaults.baseURL?.replace(/\/$/, "") ?? "";

  if (!downloadUrl) {
    throw new Error("This document does not have a download URL.");
  }

  if (!baseUrl) {
    return {
      mode: "direct",
      url: downloadUrl,
    };
  }

  const absoluteUrl = toAbsoluteUrl(downloadUrl, baseUrl);
  const apiOrigin = new URL(baseUrl).origin;
  const downloadOrigin = new URL(absoluteUrl).origin;

  return {
    mode: downloadOrigin === apiOrigin ? "authenticated" : "direct",
    url: absoluteUrl,
  };
}
