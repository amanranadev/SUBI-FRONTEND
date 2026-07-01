import {
  PROCESSING_STATE,
  type ProcessingState,
} from "@/constants/documentProcessing";

const TERMINAL_STATES: ProcessingState[] = [
  PROCESSING_STATE.COMPLETED,
  PROCESSING_STATE.FAILED,
];

export function isTerminalState(state: ProcessingState): boolean {
  return TERMINAL_STATES.includes(state);
}

export function canTransition(
  from: ProcessingState,
  to: ProcessingState,
): boolean {
  if (from === to) {
    return true;
  }

  if (isTerminalState(from) && to !== PROCESSING_STATE.IDLE) {
    return false;
  }

  const allowed: Record<ProcessingState, ProcessingState[]> = {
    [PROCESSING_STATE.IDLE]: [
      PROCESSING_STATE.UPLOADING,
      PROCESSING_STATE.FAILED,
    ],
    [PROCESSING_STATE.UPLOADING]: [
      PROCESSING_STATE.EXTRACTING,
      PROCESSING_STATE.FAILED,
      PROCESSING_STATE.IDLE,
    ],
    [PROCESSING_STATE.EXTRACTING]: [
      PROCESSING_STATE.ANALYZING,
      PROCESSING_STATE.COMPLETED,
      PROCESSING_STATE.FAILED,
      PROCESSING_STATE.IDLE,
    ],
    [PROCESSING_STATE.ANALYZING]: [
      PROCESSING_STATE.COMPLETED,
      PROCESSING_STATE.FAILED,
      PROCESSING_STATE.IDLE,
    ],
    [PROCESSING_STATE.COMPLETED]: [PROCESSING_STATE.IDLE],
    [PROCESSING_STATE.FAILED]: [
      PROCESSING_STATE.IDLE,
      PROCESSING_STATE.UPLOADING,
      PROCESSING_STATE.EXTRACTING,
      PROCESSING_STATE.ANALYZING,
    ],
  };

  return allowed[from]?.includes(to) ?? false;
}

export function assertTransition(
  from: ProcessingState,
  to: ProcessingState,
): ProcessingState {
  if (!canTransition(from, to)) {
    throw new Error(`Invalid processing transition: ${from} → ${to}`);
  }
  return to;
}

export function isUploadingState(state: ProcessingState): boolean {
  return state === PROCESSING_STATE.UPLOADING;
}

export function isAnalyzingState(state: ProcessingState): boolean {
  return (
    state === PROCESSING_STATE.EXTRACTING ||
    state === PROCESSING_STATE.ANALYZING
  );
}

export function isProcessingActive(state: ProcessingState): boolean {
  return isUploadingState(state) || isAnalyzingState(state);
}

export function deriveLegacyAnalysisStatus(
  state: ProcessingState,
): "pending" | "processing" | "completed" | "failed" | null {
  switch (state) {
    case PROCESSING_STATE.EXTRACTING:
    case PROCESSING_STATE.ANALYZING:
      return "processing";
    case PROCESSING_STATE.COMPLETED:
      return "completed";
    case PROCESSING_STATE.FAILED:
      return "failed";
    case PROCESSING_STATE.UPLOADING:
      return "pending";
    default:
      return null;
  }
}
