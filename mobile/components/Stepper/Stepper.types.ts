import type { IconName } from "@/assets/icon-system";

export interface StepperItem {
  id: string;
  label: string;
  icon: IconName;
}

export interface StepperProps {
  steps: StepperItem[];
  activeStep: number;
  testID?: string;
}
