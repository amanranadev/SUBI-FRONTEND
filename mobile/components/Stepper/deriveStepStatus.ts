import type { StepperStatus } from "./tokens";

export function deriveStepStatus(
  index: number,
  activeStep: number,
): StepperStatus {
  if (index < activeStep) {
    return "completed";
  }
  if (index === activeStep) {
    return "active";
  }
  return "upcoming";
}
