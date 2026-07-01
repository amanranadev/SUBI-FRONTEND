import type { StepperItem } from "../../../components/Stepper";

export const WORKFLOW_STEPS: StepperItem[] = [
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

export const LONG_LABEL_STEPS: StepperItem[] = [
  {
    id: "upload",
    label: "Upload Purchase Agreement Document",
    icon: "check-circle",
  },
  {
    id: "text-extraction",
    label: "Extract Text From Uploaded Document",
    icon: "document",
  },
  {
    id: "ai-analysis",
    label: "Run AI Analysis On Extracted Content",
    icon: "ai-analysis",
  },
];
