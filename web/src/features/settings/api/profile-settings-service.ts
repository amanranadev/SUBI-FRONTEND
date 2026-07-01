import { z } from "zod"
import { apiClient } from "@/lib/api/client"
import type { ProfileSettingsUser, ProfileSettingsValues } from "@/features/settings/types"
import {
  combineManagingBrokerForUser,
  splitManagingBrokerFromUser,
} from "@/features/settings/lib/managing-broker-user-fields"
import { toPhoneDigits } from "@/shared/ui/masked-input"

const nullableStringToEmpty = z.string().nullish().transform((value) => value ?? "")

function isBlankField(value: unknown): boolean {
  return value === undefined || value === null || value === ""
}

/** Maps snake_case / nested `user` payloads from Rails into the shape we parse. */
function normalizeRailsUserPayload(data: unknown): unknown {
  if (!data || typeof data !== "object" || data === null) return data
  let record = data as Record<string, unknown>
  if (
    record.data &&
    typeof record.data === "object" &&
    record.data !== null &&
    !Array.isArray(record.data)
  ) {
    record = { ...record, ...(record.data as Record<string, unknown>) }
  }
  if (
    record.attributes &&
    typeof record.attributes === "object" &&
    record.attributes !== null &&
    !Array.isArray(record.attributes)
  ) {
    record = { ...record, ...(record.attributes as Record<string, unknown>) }
  }
  const merged =
    record.user && typeof record.user === "object" && record.user !== null
      ? { ...record, ...(record.user as Record<string, unknown>) }
      : record

  const next = { ...merged } as Record<string, unknown>

  if (typeof merged.user_type === "string" && isBlankField(next.userType)) {
    next.userType = merged.user_type
  }

  const copySnake = (snake: string, camel: string) => {
    if (!isBlankField(next[camel])) return
    const v = merged[snake]
    if (v == null || v === "") return
    next[camel] = typeof v === "string" ? v : String(v)
  }

  copySnake("license_number", "licenseNumber")
  copySnake("license", "licenseNumber")
  copySnake("brokerage_name", "brokerageName")
  copySnake("managing_broker", "managingBroker")
  copySnake("phone_number", "phoneNumber")
  copySnake("first_name", "name")
  copySnake("last_name", "lastName")
  if (isBlankField(next.name) && !isBlankField(merged.firstName)) {
    next.name = String(merged.firstName).trim()
  }

  if (
    typeof merged.onboarding_completed === "boolean" &&
    next.onboardingCompleted === undefined
  ) {
    next.onboardingCompleted = merged.onboarding_completed
  }

  if (typeof merged.website === "string" && isBlankField(next.website)) {
    next.website = merged.website
  }

  return next
}

const profileSettingsUserSchema = z.object({
  id: z.coerce.string(),
  email: z.string().email(),
  name: nullableStringToEmpty,
  lastName: nullableStringToEmpty,
  nickname: nullableStringToEmpty,
  picture: nullableStringToEmpty,
  avatar: nullableStringToEmpty,
  userType: nullableStringToEmpty,
  subscription: nullableStringToEmpty,
  onboardingCompleted: z.boolean().optional().default(false),
  licenseNumber: nullableStringToEmpty,
  brokerageName: nullableStringToEmpty,
  managingBroker: nullableStringToEmpty,
  phoneNumber: nullableStringToEmpty,
  website: nullableStringToEmpty,
})

function normalizeWebsite(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ""
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`
}

function splitNameFromAgentName(agentName: string): {
  firstName: string
  lastName: string
} {
  const normalized = agentName.trim().replace(/\s+/g, " ")
  if (!normalized) {
    return {
      firstName: "",
      lastName: "",
    }
  }

  const [firstName = "", ...lastNameParts] = normalized.split(" ")
  return {
    firstName,
    lastName: lastNameParts.join(" "),
  }
}

function toProfileFormData(values: ProfileSettingsValues, avatarFile?: File | null) {
  const formData = new FormData()

  formData.append("user[firstName]", values.firstName)
  formData.append("user[lastName]", values.lastName)
  formData.append("user[nickname]", values.nickname)
  formData.append("user[email]", values.email)
  formData.append("user[license_number]", values.licenseNumber)
  formData.append("user[brokerage_name]", values.brokerageName)
  formData.append(
    "user[managing_broker]",
    combineManagingBrokerForUser(values.managingBrokerName, values.managingBrokerPhone),
  )
  formData.append("user[website]", normalizeWebsite(values.website))
  formData.append("user[phone_number]", toPhoneDigits(values.phoneNumber))

  if (avatarFile) {
    formData.append("user[picture]", avatarFile)
  }

  return formData
}

export async function getProfileSettingsUser(userId: string): Promise<ProfileSettingsUser> {
  const response = await apiClient.get(`/users/${userId}`)
  return profileSettingsUserSchema.parse(normalizeRailsUserPayload(response.data))
}

/**
 * Complete-profile saves license/brokerage to `onboarding_profiles`; Settings reads
 * `user[license_number]` first. Without this sync, an old user row wins over fresh onboarding.
 */
export type AgentTcUserProfileSyncValues = {
  agentName: string
  email: string
  phone: string
  website: string
  licenseNumber: string
  brokerageName: string
  managingBrokerName: string
  managingBrokerPhone: string
}

export async function syncAgentTcFieldsToUserProfile(input: {
  userId: string
  /** When false (TC-only), brokerage / managing broker inputs are hidden — keep existing user values. */
  includesAgentProfessionalFields: boolean
  values: AgentTcUserProfileSyncValues
}): Promise<ProfileSettingsUser> {
  const current = await getProfileSettingsUser(input.userId)

  const currentBroker = splitManagingBrokerFromUser(current.managingBroker)
  const parsedAgentName = splitNameFromAgentName(input.values.agentName)
  const shouldSyncName = parsedAgentName.firstName.length > 0

  const merged: ProfileSettingsValues = {
    firstName: shouldSyncName ? parsedAgentName.firstName : current.name.trim(),
    lastName: shouldSyncName ? parsedAgentName.lastName : current.lastName.trim(),
    nickname: current.nickname.trim(),
    email: (input.values.email.trim() || current.email).trim(),
    phoneNumber: input.values.phone.trim() || current.phoneNumber,
    licenseNumber: input.values.licenseNumber.trim(),
    brokerageName: input.includesAgentProfessionalFields
      ? input.values.brokerageName.trim()
      : current.brokerageName.trim(),
    managingBrokerName: input.includesAgentProfessionalFields
      ? input.values.managingBrokerName.trim()
      : currentBroker.name,
    managingBrokerPhone: input.includesAgentProfessionalFields
      ? input.values.managingBrokerPhone.trim()
      : currentBroker.phone,
    website: input.values.website.trim()
      ? normalizeWebsite(input.values.website)
      : current.website.trim(),
  }

  return updateProfileSettingsUser({
    userId: input.userId,
    values: merged,
    avatarFile: null,
  })
}

export async function updateProfileSettingsUser(input: {
  userId: string
  values: ProfileSettingsValues
  avatarFile?: File | null
}): Promise<ProfileSettingsUser> {
  const formData = toProfileFormData(input.values, input.avatarFile)

  const response = await apiClient.put(`/users/${input.userId}`, formData)

  return profileSettingsUserSchema.parse(normalizeRailsUserPayload(response.data))
}

export async function updateProfileSettingsAvatar(input: {
  userId: string
  avatarFile: File
}): Promise<ProfileSettingsUser> {
  const formData = new FormData()
  // Keep old-frontend compatibility for users update image uploads.
  formData.append("user[picture]", input.avatarFile)

  const response = await apiClient.put(`/users/${input.userId}`, formData)

  return profileSettingsUserSchema.parse(normalizeRailsUserPayload(response.data))
}
