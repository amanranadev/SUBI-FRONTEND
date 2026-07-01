import type { StepperItem } from "../../../components/Stepper";

export const PROCESSING_WORKFLOW_STEPS: StepperItem[] = [
  {
    id: "upload",
    label: "Upload",
    icon: "check-circle",
  },
  {
    id: "text-extraction",
    label: "Text Extraction",
    icon: "document",
  },
  {
    id: "ai-analysis",
    label: "AI Analysis",
    icon: "ai-analysis",
  },
];

export const DEFAULT_PROCESSING_TITLE = "Processing Your Document";

export const DEFAULT_PROCESSING_DESCRIPTION =
  "Checking cache and starting analysis...";

export const LONG_PROCESSING_DESCRIPTION =
  "Checking cache, validating document structure, and starting multi-stage analysis across all detected sections of your uploaded file.";

export function deriveActiveStepFromProgress(
  progress: number,
  stepCount: number,
): number {
  const clamped = Math.min(Math.max(progress, 0), 100);

  if (stepCount <= 0) {
    return 0;
  }

  if (clamped >= 100) {
    return stepCount;
  }

  const segmentSize = 100 / stepCount;
  return Math.min(Math.floor(clamped / segmentSize), stepCount - 1);
}
