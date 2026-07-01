"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import {
  getOnboardingProfiles,
  saveOnboardingProfiles,
  updateUserType,
} from "@/features/complete-profile/api/complete-profile-service";
import {
  COMPLETE_PROFILE_USER_TYPE,
  parseCompleteProfileUserTypeFromApi,
  type CompleteProfileUserType,
} from "@/features/complete-profile/constants";
import {
  getCurrentSubscription,
  isMultiSeatPlanName,
  normalizeSubscriptionPlanName,
} from "@/features/settings/api/profile-billing-service";
import {
  getProfileSettingsUser,
  syncAgentTcFieldsToUserProfile,
  updateProfileSettingsAvatar,
} from "@/features/settings/api/profile-settings-service";
import { invalidateProfileCompletionQueries } from "@/features/settings/hooks/use-profile-completion";
import { useToast } from "@/shared/hooks/use-toast";
import { toPhoneDigits } from "@/shared/ui/masked-input";

const AGENT_TC_QUERY_KEY = ["complete-profile", "agent-tc"] as const;
const MAX_FIELD_LENGTH = 100;
const maxLengthMessage = `Must be ${MAX_FIELD_LENGTH} characters or fewer.`;
const cappedTextField = z.string().max(MAX_FIELD_LENGTH, maxLengthMessage);

export const agentTcFormSchema = z.object({
  phone: z
    .string()
    .min(1, "Phone number is required.")
    .refine((value) => toPhoneDigits(value).length === 10, {
      message: "Phone number must have 10 digits.",
    }),
  email: z
    .string()
    .max(MAX_FIELD_LENGTH, maxLengthMessage)
    .email("Please enter a valid email address.")
    .refine((value) => !/\s/.test(value), {
      message: "Email cannot contain spaces.",
    }),
  nickname: cappedTextField,
  website: cappedTextField,
  license: z
    .string()
    .min(1, "License number is required.")
    .max(MAX_FIELD_LENGTH, maxLengthMessage),
  socials: cappedTextField,
  agentName: cappedTextField,
  brokerageName: cappedTextField,
  nameOfTeam: cappedTextField,
  managingBrokerName: cappedTextField,
  managingBrokerPhone: z
    .string()
    .refine((value) => !value || toPhoneDigits(value).length === 10, {
      message: "Managing broker phone must have 10 digits.",
    }),
  companyName: cappedTextField,
  nameOfIndividual: cappedTextField,
  whatCountiesServe: cappedTextField,
});

export type AgentTcFormValues = z.infer<typeof agentTcFormSchema>;

interface UseAgentTcFormProps {
  userId: string | null;
  onSaved?: () => void;
}

export function useAgentTcForm({ userId, onSaved }: UseAgentTcFormProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<CompleteProfileUserType>(
    COMPLETE_PROFILE_USER_TYPE.BOTH,
  );

  const profilesQuery = useQuery({
    queryKey: [...AGENT_TC_QUERY_KEY, userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return null;
      const [profiles, profileUser] = await Promise.all([
        getOnboardingProfiles(),
        getProfileSettingsUser(userId),
      ]);
      return { profiles, profileUser };
    },
    staleTime: 10_000,
  });

  const subscriptionQuery = useQuery({
    queryKey: ["complete-profile", "billing", "subscription"],
    queryFn: () => getCurrentSubscription(),
    staleTime: 20_000,
  });

  const defaultValues = useMemo<AgentTcFormValues>(() => {
    const data = profilesQuery.data;
    const agent = data?.profiles.data?.agent;
    const tc = data?.profiles.data?.transaction_coordinator;
    const profileUser = data?.profileUser;
    const fullName =
      [profileUser?.name ?? "", profileUser?.lastName ?? ""]
        .filter(Boolean)
        .join(" ")
        .trim() ||
      profileUser?.name ||
      "";

    return {
      phone: agent?.phone ?? tc?.phone ?? profileUser?.phoneNumber ?? "",
      email: agent?.email ?? tc?.email ?? profileUser?.email ?? "",
      nickname: profileUser?.nickname ?? "",
      website: agent?.website ?? tc?.website ?? profileUser?.website ?? "",
      license:
        agent?.license ?? tc?.license ?? profileUser?.licenseNumber ?? "",
      socials: agent?.socials ?? tc?.socials ?? "",
      agentName: agent?.agent_name ?? fullName,
      brokerageName: agent?.brokerage_name ?? "",
      nameOfTeam: agent?.name_of_team ?? "",
      managingBrokerName: agent?.managing_broker_name ?? "",
      managingBrokerPhone: agent?.managing_broker_phone ?? "",
      companyName: tc?.company_name ?? "",
      nameOfIndividual: tc?.name_of_individual ?? fullName,
      whatCountiesServe: tc?.what_counties_serve ?? "",
    };
  }, [profilesQuery.data]);

  const form = useForm<AgentTcFormValues>({
    resolver: zodResolver(agentTcFormSchema),
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    if (!profilesQuery.data) return;
    form.reset(defaultValues);
    setSelectedType(
      parseCompleteProfileUserTypeFromApi(
        profilesQuery.data.profileUser.userType ||
          profilesQuery.data.profiles.user_type,
      ),
    );
  }, [defaultValues, form, profilesQuery.data]);

  const saveMutation = useMutation({
    mutationFn: async (values: AgentTcFormValues) => {
      if (!userId) throw new Error("Missing user id");

      const isAgent =
        selectedType === COMPLETE_PROFILE_USER_TYPE.AGENT ||
        selectedType === COMPLETE_PROFILE_USER_TYPE.BOTH;
      const isTc =
        selectedType === COMPLETE_PROFILE_USER_TYPE.TRANSACTION_COORDINATOR ||
        selectedType === COMPLETE_PROFILE_USER_TYPE.BOTH;

      if (isAgent && !values.agentName.trim()) {
        form.setError("agentName", { message: "Agent name is required." });
        throw new Error("Agent validation failed");
      }
      if (isTc && !values.companyName.trim()) {
        form.setError("companyName", { message: "Company name is required." });
        throw new Error("TC validation failed");
      }
      if (isTc && !values.nameOfIndividual.trim()) {
        form.setError("nameOfIndividual", {
          message: "Name of individual is required.",
        });
        throw new Error("TC validation failed");
      }

      await updateUserType({
        userId,
        userType: selectedType,
        onboardingCompleted: Boolean(
          profilesQuery.data?.profileUser.onboardingCompleted,
        ),
        nickname: values.nickname,
      });

      await saveOnboardingProfiles({
        userType: selectedType,
        values,
      });

      if (avatarFile) {
        await updateProfileSettingsAvatar({
          userId,
          avatarFile,
        });
      }

      await syncAgentTcFieldsToUserProfile({
        userId,
        includesAgentProfessionalFields: isAgent,
        values: {
          agentName: values.agentName,
          email: values.email,
          phone: values.phone,
          website: values.website,
          licenseNumber: values.license,
          brokerageName: values.brokerageName,
          managingBrokerName: values.managingBrokerName,
          managingBrokerPhone: values.managingBrokerPhone,
        },
      });
    },
    onSuccess: async () => {
      toast({
        title: "Profile details saved",
        description:
          "Agent/TC data was updated with the same flow as onboarding.",
      });
      setAvatarFile(null);
      await profilesQuery.refetch();
      await queryClient.invalidateQueries({
        queryKey: ["settings", "profile", userId],
      });
      await invalidateProfileCompletionQueries(queryClient);
      onSaved?.();
    },
    onError: () => {
      toast({
        title: "Unable to save",
        description: "Please review required fields and try again.",
        variant: "destructive",
      });
    },
  });

  const isAgent =
    selectedType === COMPLETE_PROFILE_USER_TYPE.AGENT ||
    selectedType === COMPLETE_PROFILE_USER_TYPE.BOTH;
  const isTc =
    selectedType === COMPLETE_PROFILE_USER_TYPE.TRANSACTION_COORDINATOR ||
    selectedType === COMPLETE_PROFILE_USER_TYPE.BOTH;

  const normalizedStripePlanName = normalizeSubscriptionPlanName(
    subscriptionQuery.data?.stripeSubscription?.planName,
  );
  const normalizedCurrentPlanName = normalizeSubscriptionPlanName(
    subscriptionQuery.data?.currentPlan?.name,
  );
  const isMultiUserSubscription =
    Boolean(subscriptionQuery.data?.hasAccessViaTeam) ||
    isMultiSeatPlanName(normalizedStripePlanName) ||
    isMultiSeatPlanName(normalizedCurrentPlanName);
  const shouldShowAgentWorkspaceFields = isAgent && isMultiUserSubscription;

  const profileUser = profilesQuery.data?.profileUser;
  const currentAvatar =
    profileUser?.avatar ||
    profileUser?.picture ||
    "";

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(avatarFile);
    setAvatarPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [avatarFile]);

  const submitForm = form.handleSubmit((values) =>
    saveMutation.mutate(values),
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    if (event.nativeEvent.isComposing) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-agent-tc-nested-interactive-root]")) return;
    if (target.tagName === "TEXTAREA" || target.tagName === "SELECT") return;
    if (target.tagName !== "INPUT") return;
    event.preventDefault();
    void submitForm();
  };

  return {
    form,
    state: {
      selectedType,
      isAgent,
      isTc,
      isPending: saveMutation.isPending,
      isLoading: profilesQuery.isLoading,
      avatarPreviewUrl,
      currentAvatar,
      profileUser,
      shouldShowAgentWorkspaceFields,
    },
    actions: {
      submitForm,
      setAvatarFile,
      setSelectedType,
      handleKeyDown,
    },
  };
}
