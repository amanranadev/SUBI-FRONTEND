import { useMutation, useQuery } from "@tanstack/react-query";
import { UpdateUserPayload, userService } from "../services/userService";

export const userKeys = {
  all: ["user"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  me: () => [...userKeys.details(), "me"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

const useUserProfile = () =>
  useQuery({ queryKey: userKeys.me(), queryFn: userService.getProfile });

const useUserById = (userId: string) =>
  useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => userService.getUserById(userId),
    enabled: !!userId,
  });

const useUpdateUserProfile = (userId: string) =>
  useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      userService.updateUser(userId, payload),
  });

const useUpdateOnboarding = (userId: string) =>
  useMutation({
    mutationFn: (params: {
      onboardingCompleted: boolean;
      startedOnboarding: boolean;
    }) => userService.updateOnboarding(userId, params),
  });

const useUserIcalUrl = (userId: string) =>
  useQuery({
    queryKey: [...userKeys.detail(userId), "ical_url"],
    queryFn: () => userService.getIcalUrl(userId),
    enabled: !!userId,
  });

const useRegenerateIcalToken = (userId: string) =>
  useMutation({
    mutationFn: () => userService.regenerateIcalToken(userId),
  });

// Aligned with useTransactions pattern
const useUpdateUser = () =>
  useMutation({
    mutationFn: ({
      userId,
      updates,
    }: {
      userId: string;
      updates: UpdateUserPayload;
    }) => userService.updateUser(userId, updates),
  });

const useDeleteUser = () =>
  useMutation({
    mutationFn: (userId: string) => userService.deleteUser(userId),
  });

export default function useUser(userId?: string) {
  const meQuery = useUserProfile();
  const userQuery = userId ? useUserById(userId) : undefined;
  const icalQuery = userId ? useUserIcalUrl(userId) : undefined;

  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const updateProfile = userId ? useUpdateUserProfile(userId) : undefined;
  const updateOnboarding = userId ? useUpdateOnboarding(userId) : undefined;
  const regenerateIcalToken = userId
    ? useRegenerateIcalToken(userId)
    : undefined;

  return {
    // data
    me: meQuery.data,
    user: userQuery?.data,
    icalUrl: icalQuery?.data,

    // states
    isLoadingMe: meQuery.isLoading,
    isLoadingUser: userQuery?.isLoading,
    isLoadingIcal: icalQuery?.isLoading,
    isErrorMe: meQuery.isError,
    isErrorUser: userQuery?.isError,
    errorMe: meQuery.error,
    errorUser: userQuery?.error,

    // actions
    refetchMe: meQuery.refetch,
    refetchUser: userQuery?.refetch,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    updateProfile: updateProfile?.mutate,
    updateOnboarding: updateOnboarding?.mutate,
    regenerateIcalToken: regenerateIcalToken?.mutate,

    // mutation states
    isUpdating: updateUser.isPending || !!updateProfile?.isPending,
    isDeleting: deleteUser.isPending,
  };
}
