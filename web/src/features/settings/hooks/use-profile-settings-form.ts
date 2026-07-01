"use client"

import { useEffect, useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useProfileCompletion } from "@/features/settings/hooks/use-profile-completion"
import { useForm, useWatch } from "react-hook-form"
import { useAuth } from "@/lib/auth/context"
import { useToast } from "@/shared/hooks/use-toast"
import type { ProfileSettingsValues } from "@/features/settings/types"
import { profileSettingsSchema } from "@/features/settings/schemas/profile-settings-schema"
import { getOnboardingProfiles } from "@/features/complete-profile/api/complete-profile-service"
import {
  getProfileSettingsUser,
  updateProfileSettingsAvatar,
  updateProfileSettingsUser,
} from "@/features/settings/api/profile-settings-service"
import { mergeProfessionalDetailsFromOnboarding } from "@/features/settings/lib/merge-profile-with-onboarding"
import { splitManagingBrokerFromUser } from "@/features/settings/lib/managing-broker-user-fields"

const PROFILE_SETTINGS_QUERY_KEY = ["settings", "profile"] as const

const EMPTY_PROFILE_VALUES: ProfileSettingsValues = {
  firstName: "",
  lastName: "",
  nickname: "",
  email: "",
  phoneNumber: "",
  licenseNumber: "",
  brokerageName: "",
  managingBrokerName: "",
  managingBrokerPhone: "",
  website: "",
}

type ProfileFormSource = {
  name?: string | null
  lastName?: string | null
  nickname?: string | null
  email?: string | null
  phoneNumber?: string | null
  licenseNumber?: string | null
  brokerageName?: string | null
  managingBroker?: string | null
  website?: string | null
}

function getSubmitErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message
  return "Could not update your profile right now. Please try again."
}

function mapUserToFormValues(user?: ProfileFormSource | null): ProfileSettingsValues {
  if (!user) return EMPTY_PROFILE_VALUES

  const managing = splitManagingBrokerFromUser(user.managingBroker ?? "")

  return {
    firstName: user.name ?? "",
    lastName: user.lastName ?? "",
    nickname: user.nickname ?? "",
    email: user.email ?? "",
    phoneNumber: user.phoneNumber ?? "",
    licenseNumber: user.licenseNumber ?? "",
    brokerageName: user.brokerageName ?? "",
    managingBrokerName: managing.name,
    managingBrokerPhone: managing.phone,
    website: user.website ?? "",
  }
}

export function useProfileSettingsForm() {
  const { user, refreshSession } = useAuth()
  const { toast } = useToast()
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")

  const form = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    mode: "onSubmit",
    defaultValues: mapUserToFormValues(user),
  })

  const profileQuery = useQuery({
    queryKey: [...PROFILE_SETTINGS_QUERY_KEY, user?.id],
    queryFn: async () => {
      const profile = await getProfileSettingsUser(user!.id)
      try {
        const onboarding = await getOnboardingProfiles()
        return mergeProfessionalDetailsFromOnboarding(profile, onboarding)
      } catch {
        return profile
      }
    },
    enabled: Boolean(user?.id),
    staleTime: 30_000,
  })

  const profileCompletionQuery = useProfileCompletion({
    userId: user?.id,
    staleTime: 15_000,
  })

  const saveProfileMutation = useMutation({
    mutationFn: (values: ProfileSettingsValues) =>
      updateProfileSettingsUser({
        userId: user!.id,
        values,
        avatarFile,
      }),
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) =>
      updateProfileSettingsAvatar({
        userId: user!.id,
        avatarFile: file,
      }),
  })

  useEffect(() => {
    if (!profileQuery.data) return

    form.reset(mapUserToFormValues(profileQuery.data))
    const initialAvatar = profileQuery.data.avatar || profileQuery.data.picture
    setAvatarPreview(initialAvatar)
  }, [form, profileQuery.data])

  useEffect(() => {
    if (profileQuery.data) return
    if (user?.picture) {
      setAvatarPreview(user.picture)
    }
  }, [profileQuery.data, user?.picture])

  const onSubmit = form.handleSubmit(async (values) => {
    if (!user?.id) {
      toast({
        title: "Session unavailable",
        description: "Sign in again before editing your profile.",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedProfile = await saveProfileMutation.mutateAsync(values)
      form.reset(mapUserToFormValues(updatedProfile))
      setAvatarFile(null)
      setAvatarPreview(updatedProfile.avatar || updatedProfile.picture)
      await refreshSession()
      await profileCompletionQuery.refetch()

      toast({
        title: "Profile updated",
        description: "Your profile information was saved successfully.",
      })
    } catch (error) {
      toast({
        title: "Could not save profile",
        description: getSubmitErrorMessage(error),
        variant: "destructive",
      })
    }
  })

  const firstName = useWatch({ control: form.control, name: "firstName" })
  const lastName = useWatch({ control: form.control, name: "lastName" })
  const primaryEmail = profileQuery.data?.email ?? user?.email ?? ""
  const primaryPhoneNumber = profileQuery.data?.phoneNumber ?? ""

  const fullName = useMemo(() => {
    const safeFirstName = (firstName ?? "").trim()
    const safeLastName = (lastName ?? "").trim()

    return `${safeFirstName} ${safeLastName}`.trim() || "Subi User"
  }, [firstName, lastName])

  const isLoadingProfile = profileQuery.isLoading
  const isSaving = saveProfileMutation.isPending
  const isUploadingAvatar = uploadAvatarMutation.isPending
  const isProfileStatusLoading = profileCompletionQuery.isLoading
  const completionPercentage = profileCompletionQuery.data?.completionPercentage ?? 0
  const isProfileComplete = profileCompletionQuery.data?.isComplete ?? false

  const uploadAvatar = async (file: File) => {
    if (!user?.id) {
      toast({
        title: "Session unavailable",
        description: "Sign in again before editing your profile picture.",
        variant: "destructive",
      })
      throw new Error("Missing authenticated user.")
    }

    try {
      const updatedProfile = await uploadAvatarMutation.mutateAsync(file)
      setAvatarFile(null)
      await refreshSession()
      await profileCompletionQuery.refetch()
      return updatedProfile
    } catch (error) {
      toast({
        title: "Could not upload picture",
        description: getSubmitErrorMessage(error),
        variant: "destructive",
      })
      throw error
    }
  }

  return {
    userId: user?.id ?? null,
    form,
    onSubmit,
    fullName,
    primaryEmail: primaryEmail ?? "",
    primaryPhoneNumber: primaryPhoneNumber ?? "",
    avatarPreview,
    isLoadingProfile,
    isSaving,
    isUploadingAvatar,
    isProfileStatusLoading,
    isProfileComplete,
    completionPercentage,
    uploadAvatar,
    setAvatarFile,
    setAvatarPreview,
  }
}
