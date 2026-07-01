import { useMutation, useQuery } from "@tanstack/react-query";
import {
  UpdateUserNotificationPreferencePayload,
  UserNotificationPreference,
  userService,
} from "../services/userService";

export const notificationPreferenceKeys = {
  all: ["user_notification_preferences"] as const,
  lists: () => [...notificationPreferenceKeys.all, "list"] as const,
};

export const useNotificationPreferences = () =>
  useQuery<UserNotificationPreference[]>({
    queryKey: notificationPreferenceKeys.lists(),
    queryFn: userService.getNotificationPreferences,
  });

export const useUpdateNotificationPreference = () =>
  useMutation({
    mutationFn: ({
      preferenceId,
      payload,
    }: {
      preferenceId: string;
      payload: UpdateUserNotificationPreferencePayload;
    }) => userService.updateNotificationPreference(preferenceId, payload),
  });

// Combined hook - mirrors your other hooks' pattern
export const useNotificationPreferenceManagement = () => {
  const prefsQuery = useNotificationPreferences();
  const updateMutation = useUpdateNotificationPreference();

  return {
    // data
    preferences: prefsQuery.data || [],
    isLoading: prefsQuery.isLoading,
    isError: prefsQuery.isError,
    error: prefsQuery.error,
    refetch: prefsQuery.refetch,

    // mutation
    updatePreference: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    isUpdateSuccess: updateMutation.isSuccess,
    isUpdateError: updateMutation.isError,
    updateError: updateMutation.error,
  };
};
