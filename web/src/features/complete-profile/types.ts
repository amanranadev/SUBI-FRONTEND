import { PROFILE_COMPLETION_STEPS } from "@/features/settings/api/profile-completion-service";

export type ProfileCompletionStepId =
  (typeof PROFILE_COMPLETION_STEPS)[keyof typeof PROFILE_COMPLETION_STEPS];

export type CompleteProfileStepData = {
  id: ProfileCompletionStepId;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  isOptional?: boolean;
  isCompleted: boolean;
};
