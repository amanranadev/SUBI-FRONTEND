"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  deleteUserUpload,
  fetchAllUserUploads,
  getUserUploadDownloadTarget,
} from "../api/user-uploads";
import { apiClient } from "@/lib/api/client";
import type { DocumentRecord } from "../types";

const DOCUMENTS_QUERY_KEY = ["documents", "user-uploads"] as const;

export function useDocuments() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);

  const query = useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: fetchAllUserUploads,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserUpload,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DOCUMENTS_QUERY_KEY });
    },
  });

  const handleDeleteDocument = React.useCallback(
    async (id: string) => {
      setDeletingId(id);

      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setDeletingId((current) => (current === id ? null : current));
      }
    },
    [deleteMutation],
  );

  const handleDownloadDocument = React.useCallback(
    async (upload: DocumentRecord) => {
      setDownloadingId(upload.id);
      const previewWindow = window.open("", "_blank");

      if (previewWindow) {
        previewWindow.opener = null;
      }

      try {
        const target = getUserUploadDownloadTarget(upload);

        if (target.mode === "authenticated") {
          const response = await apiClient.get<Blob>(target.url, {
            responseType: "blob",
          });
          const objectUrl = window.URL.createObjectURL(response.data);

          if (previewWindow) {
            previewWindow.location.href = objectUrl;
          } else {
            window.open(objectUrl, "_blank", "noopener,noreferrer");
          }

          // Give the browser viewer time to consume the blob URL before cleanup.
          window.setTimeout(() => {
            window.URL.revokeObjectURL(objectUrl);
          }, 60_000);
        } else {
          if (previewWindow) {
            previewWindow.location.href = target.url;
          } else {
            window.open(target.url, "_blank", "noopener,noreferrer");
          }
        }
      } catch (error) {
        if (previewWindow && !previewWindow.closed) {
          previewWindow.close();
        }
        throw error;
      } finally {
        setDownloadingId((current) => (current === upload.id ? null : current));
      }
    },
    [],
  );

  return {
    documents: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    deleteDocument: handleDeleteDocument,
    downloadDocument: handleDownloadDocument,
    deletingId,
    downloadingId,
    isDeleting: deleteMutation.isPending,
  };
}
