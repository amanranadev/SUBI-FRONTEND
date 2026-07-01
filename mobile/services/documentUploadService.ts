import {
  FILE_ENDPOINTS,
  PROCESSOR_VERSION,
  TRANSACTION_CATEGORY,
  UPLOAD_TIMEOUT_MS,
} from "@/constants/documentProcessing";
import apiClient from "@/services/api";
import { documentService } from "@/services/documentService";
import { ApiError } from "@/types/auth";
import type {
  FileUploadResponse,
  UploadParams,
  UploadResult,
} from "@/types/documentProcessing";

function resolveProcessorVersion(
  transactionCategory: UploadParams["transactionCategory"],
): string | undefined {
  if (transactionCategory === TRANSACTION_CATEGORY.PSA) {
    return PROCESSOR_VERSION.THIRD_PARTY;
  }
  return undefined;
}

function parseUploadResponse(
  responseData: FileUploadResponse,
  file: Pick<UploadParams, "name" | "type" | "size">,
): UploadResult {
  const fileData = responseData.file ?? responseData;
  const fileId = String(
    (fileData as { id?: string | number }).id ?? responseData.fileId ?? "",
  );
  const filename =
    (fileData as { filename?: string }).filename ??
    responseData.filename ??
    file.name;
  const userUploadId = (fileData as { user_upload_id?: string }).user_upload_id;

  if (!fileId) {
    throw new Error("Invalid response from server: missing file ID");
  }

  return {
    fileId,
    filename,
    size: file.size ?? (fileData as { size?: number }).size ?? 0,
    type: file.type ?? (fileData as { type?: string }).type ?? "application/pdf",
    userUploadId,
  };
}

export async function uploadDocument(params: UploadParams): Promise<UploadResult> {
  documentService.validateFile(params);

  const uploadUrl = `${FILE_ENDPOINTS.upload}?filename=${encodeURIComponent(
    params.name || "document.pdf",
  )}`;

  const formData = new FormData();
  formData.append("file", {
    uri: params.uri,
    type: params.type || "application/pdf",
    name: params.name || "document.pdf",
  } as unknown as Blob);
  formData.append("transaction_category", params.transactionCategory);

  const processorVersion = resolveProcessorVersion(params.transactionCategory);
  if (processorVersion) {
    formData.append("processor_version", processorVersion);
  }

  try {
    const response = await apiClient.post<FileUploadResponse>(uploadUrl, formData, {
      timeout: UPLOAD_TIMEOUT_MS,
      signal: params.signal,
      onUploadProgress: (progressEvent) => {
        if (params.onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          params.onProgress(progress);
        }
      },
    });

    return parseUploadResponse(response.data, params);
  } catch (error: unknown) {
    const axiosError = error as {
      code?: string;
      message?: string;
      status?: number;
      response?: { status?: number; data?: { errors?: unknown } };
    };

    if (
      axiosError.code === "ERR_CANCELED" ||
      axiosError.message?.includes("canceled")
    ) {
      throw {
        message: "Upload cancelled",
        code: "ABORTED",
        status: 0,
      } as ApiError;
    }

    if (
      axiosError.code === "ECONNABORTED" ||
      axiosError.message?.includes("timeout")
    ) {
      throw {
        message: "Upload timeout after 5 minutes",
        code: "TIMEOUT",
        status: 0,
      } as ApiError;
    }

    if (axiosError.status || axiosError.code) {
      throw axiosError as ApiError;
    }

    throw {
      message: axiosError.message || "Upload failed",
      code: axiosError.code || "UPLOAD_FAILED",
      status: axiosError.response?.status || 0,
      errors: axiosError.response?.data?.errors,
    } as ApiError;
  }
}
