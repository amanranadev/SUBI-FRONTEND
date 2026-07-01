import {
  AI_PROCESSING_STATUS,
  DEFAULT_POLL_INTERVAL_MS,
  DEFAULT_POLL_TIMEOUT_MS,
  MAX_CONSECUTIVE_POLL_FAILURES,
} from "@/constants/documentProcessing";
import {
  assertAnalysisNotFailed,
  fetchFileStatus,
  reportAnalysisProgress,
} from "@/services/documentAnalysisService";
import type { PollOptions, PollResult } from "@/types/documentProcessing";

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new Error("Processing cancelled.");
    (error as Error & { code: string }).code = "ABORTED";
    throw error;
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        const error = new Error("Processing cancelled.");
        (error as Error & { code: string }).code = "ABORTED";
        reject(error);
      },
      { once: true },
    );
  });
}

export async function pollUntilComplete(
  fileId: string,
  options?: PollOptions,
): Promise<PollResult> {
  const interval = options?.intervalMs ?? DEFAULT_POLL_INTERVAL_MS;
  const timeout = options?.timeoutMs ?? DEFAULT_POLL_TIMEOUT_MS;
  const start = Date.now();
  let consecutiveFailures = 0;

  while (true) {
    throwIfAborted(options?.signal);

    if (Date.now() - start > timeout) {
      throw new Error("Document analysis timed out. Please try again.");
    }

    let status;
    try {
      status = await fetchFileStatus(fileId);
      consecutiveFailures = 0;
    } catch (fetchError) {
      throwIfAborted(options?.signal);
      consecutiveFailures += 1;

      if (consecutiveFailures >= MAX_CONSECUTIVE_POLL_FAILURES) {
        throw fetchError;
      }

      await sleep(interval, options?.signal);
      continue;
    }

    assertAnalysisNotFailed(status);

    if (
      status.ai_processing_status === AI_PROCESSING_STATUS.COMPLETED &&
      status.transaction_data
    ) {
      options?.onProgress?.(100, "Analysis complete!");
      return {
        transactionData: status.transaction_data,
        fileId: String(status.id),
        userUploadId: status.user_upload_id,
      };
    }

    const { percent, message } = reportAnalysisProgress(status);
    options?.onProgress?.(percent, message);
    await sleep(interval, options?.signal);
  }
}
