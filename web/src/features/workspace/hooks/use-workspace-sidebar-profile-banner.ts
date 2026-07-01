import { useProfileCompletion } from "@/features/settings/hooks/use-profile-completion";

type UseWorkspaceSidebarProfileBannerInput = {
  userId: string | null | undefined;
  isSuperadmin: boolean | null | undefined;
};

export function useWorkspaceSidebarProfileBanner({
  userId,
  isSuperadmin,
}: UseWorkspaceSidebarProfileBannerInput) {
  const profileCompletionQuery = useProfileCompletion({
    userId,
    enabled: Boolean(userId && !isSuperadmin),
    staleTime: 30_000,
  });

  return {
    shouldShowCompleteProfileBanner:
      !isSuperadmin &&
      Boolean(userId) &&
      !(profileCompletionQuery.data?.isComplete ?? true),
    completionPercentage: profileCompletionQuery.data?.completionPercentage ?? 0,
  };
}
