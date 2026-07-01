"use client";

import type { QueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import {
  checkProfileCompletion,
  type ProfileCompletionCheck,
} from "@/features/settings/api/profile-completion-service";
import { getProfileSettingsUser } from "@/features/settings/api/profile-settings-service";

/** Single cache key so sidebar, complete-profile, and settings stay in sync. */
export const PROFILE_COMPLETION_QUERY_KEY_PREFIX = ["profile-completion"] as const;

export function getProfileCompletionQueryKey(userId: string) {
  return [...PROFILE_COMPLETION_QUERY_KEY_PREFIX, userId] as const;
}

export function invalidateProfileCompletionQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({
    queryKey: [...PROFILE_COMPLETION_QUERY_KEY_PREFIX],
  });
}

type UseProfileCompletionInput = {
  userId: string | null | undefined;
  enabled?: boolean;
  staleTime?: number;
};

export function useProfileCompletion({
  userId,
  enabled = true,
  staleTime = 20_000,
}: UseProfileCompletionInput) {
  return useQuery({
    queryKey: [...PROFILE_COMPLETION_QUERY_KEY_PREFIX, userId ?? ""],
    enabled: Boolean(userId) && enabled,
    staleTime,
    queryFn: async (): Promise<ProfileCompletionCheck> => {
      if (!userId) {
        return {
          isComplete: true,
          missingItems: [],
          completionPercentage: 100,
        };
      }

      const profile = await getProfileSettingsUser(userId);
      return checkProfileCompletion({
        id: profile.id,
        name: profile.name,
        lastName: profile.lastName,
        userType: profile.userType,
      });
    },
  });
}
