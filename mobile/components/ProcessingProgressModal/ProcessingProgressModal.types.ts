import type { StepperItem } from "@/components/Stepper";

export interface ProcessingProgressModalProps {
  title?: string;
  description?: string;
  progress: number;
  steps: StepperItem[];
  activeStep: number;
  onStopProcessing?: () => void;
  loading?: boolean;
  testID?: string;
}
