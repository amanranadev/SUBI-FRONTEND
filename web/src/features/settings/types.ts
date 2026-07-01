import type { z } from "zod"
import type { profileSettingsSchema } from "@/features/settings/schemas/profile-settings-schema"

export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>

export type ProfileSettingsUser = {
  id: string
  email: string
  name: string
  lastName: string
  nickname: string
  picture: string
  avatar: string
  userType: string
  subscription: string
  onboardingCompleted: boolean
  licenseNumber: string
  brokerageName: string
  managingBroker: string
  phoneNumber: string
  website: string
}
