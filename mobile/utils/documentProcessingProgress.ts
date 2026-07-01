import { PROCESSING_STATE, type ProcessingState } from "@/constants/documentProcessing";
import type { AnalysisStatus } from "@/types/document";
import type { ProcessingProgress } from "@/types/documentProcessing";
import {
  deriveLegacyAnalysisStatus,
  isAnalyzingState,
  isUploadingState,
} from "@/utils/processingStateMachine";

/** Maps orchestrator pipeline percent (0–100) to upload phase percent (0–100). */
export function mapPipelinePercentToUploadProgress(
  progress: ProcessingProgress,
): number {
  if (progress.percent <= 25) {
    return Math.min(100, Math.round((progress.percent / 25) * 100));
  }
  return 100;
}

/** Maps orchestrator pipeline percent (0–100) to analysis phase percent (0–100). */
export function mapPipelinePercentToAnalysisProgress(
  progress: ProcessingProgress,
): number {
  if (progress.percent <= 25) {
    return 0;
  }
  return Math.min(100, Math.round(((progress.percent - 25) / 75) * 100));
}

/**
 * Combined UI progress: upload occupies 0–50%, analysis 50–100%.
 * Shared by DocumentUploader and Home progress surfaces.
 */
export function deriveCombinedProgressPercent(params: {
  state: ProcessingState;
  uploadProgress: number;
  analysisProgress: number;
}): number {
  const { state, uploadProgress, analysisProgress } = params;

  if (state === PROCESSING_STATE.UPLOADING) {
    return Math.min(50, uploadProgress * 0.5);
  }

  if (isAnalyzingState(state)) {
    return Math.min(100, 50 + analysisProgress * 0.5);
  }

  if (state === PROCESSING_STATE.COMPLETED) {
    return 100;
  }

  return 0;
}

export function deriveDefaultProgressMessage(params: {
  state: ProcessingState;
  pipelineMessage?: string;
}): string {
  const { state, pipelineMessage } = params;

  if (state === PROCESSING_STATE.UPLOADING) {
    return "Uploading document...";
  }

  if (state === PROCESSING_STATE.EXTRACTING) {
    return pipelineMessage || "Checking cache and starting analysis...";
  }

  if (state === PROCESSING_STATE.ANALYZING) {
    return (
      pipelineMessage || "Analyzing document and extracting information..."
    );
  }

  return pipelineMessage || "";
}

export function deriveStepperActiveIndex(
  overallProgress: number,
  stepCount: number,
): number {
  const clamped = Math.min(Math.max(overallProgress, 0), 100);

  if (stepCount <= 0) {
    return 0;
  }

  if (clamped >= 100) {
    return stepCount;
  }

  const segmentSize = 100 / stepCount;
  return Math.min(Math.floor(clamped / segmentSize), stepCount - 1);
}

export function buildAnalysisStatusView(params: {
  state: ProcessingState;
  filename: string | null;
  fileId: string | null;
  progress: ProcessingProgress;
  errorMessage?: string;
}): AnalysisStatus | null {
  const legacyStatus = deriveLegacyAnalysisStatus(params.state);
  if (!legacyStatus) {
    return null;
  }

  const uploadPhase = isUploadingState(params.state);

  return {
    status: legacyStatus,
    progress: uploadPhase
      ? mapPipelinePercentToUploadProgress(params.progress)
      : mapPipelinePercentToAnalysisProgress(params.progress),
    error: params.errorMessage,
    message: params.progress.message,
    filename: params.filename ?? params.fileId ?? "",
  };
}

export function deriveUploadAndAnalysisProgress(params: {
  state: ProcessingState;
  progress: ProcessingProgress;
}): { uploadProgress: number; analysisProgress: number } {
  const { state, progress } = params;
  const uploadMapped = mapPipelinePercentToUploadProgress(progress);
  const analysisMapped = mapPipelinePercentToAnalysisProgress(progress);

  if (isUploadingState(state)) {
    return { uploadProgress: uploadMapped, analysisProgress: 0 };
  }

  if (isAnalyzingState(state) || state === PROCESSING_STATE.COMPLETED) {
    return { uploadProgress: 100, analysisProgress: analysisMapped };
  }

  return { uploadProgress: 0, analysisProgress: 0 };
}
