import { apiClient } from "@/lib/api/client"
import type { ProfileSettingsUser } from "@/features/settings/types"

export const PROFILE_COMPLETION_STEPS = {
  AGENT_AND_TC: "AGENT_AND_TC",
  CALENDAR: "CALENDAR",
  NOTIFICATIONS: "NOTIFICATIONS",
  SUBSCRIPTION: "SUBSCRIPTION",
} as const

type ProfileCompletionStep =
  (typeof PROFILE_COMPLETION_STEPS)[keyof typeof PROFILE_COMPLETION_STEPS]

const REQUIRED_PROFILE_COMPLETION_STEPS: ProfileCompletionStep[] = [
  PROFILE_COMPLETION_STEPS.AGENT_AND_TC,
  PROFILE_COMPLETION_STEPS.CALENDAR,
  PROFILE_COMPLETION_STEPS.NOTIFICATIONS,
]

export type ProfileCompletionCheck = {
  isComplete: boolean
  missingItems: ProfileCompletionStep[]
  completionPercentage: number
}

function hasAtLeastOneEnabledMethod(value: unknown): boolean {
  if (!value || typeof value !== "object") return false
  const objectValue = value as {
    enabled_methods?: unknown
    email_enabled?: unknown
    sms_enabled?: unknown
    in_app_enabled?: unknown
    push_enabled?: unknown
    emailEnabled?: unknown
    smsEnabled?: unknown
    inAppEnabled?: unknown
    pushEnabled?: unknown
  }

  const methods = objectValue.enabled_methods
  if (Array.isArray(methods) && methods.length > 0) return true

  const booleanFlags = [
    objectValue.email_enabled,
    objectValue.sms_enabled,
    objectValue.in_app_enabled,
    objectValue.push_enabled,
    objectValue.emailEnabled,
    objectValue.smsEnabled,
    objectValue.inAppEnabled,
    objectValue.pushEnabled,
  ]

  return booleanFlags.some((flag) => flag === true)
}

async function checkUserHasNotifications(): Promise<boolean> {
  try {
    const response = await apiClient.get("/user_notification_preferences")
    const payload = response.data as
      | { preferences?: unknown[]; data?: unknown[] }
      | unknown[]
      | null
      | undefined

    if (Array.isArray(payload)) return payload.some(hasAtLeastOneEnabledMethod)
    if (Array.isArray(payload?.preferences)) {
      return payload.preferences.some(hasAtLeastOneEnabledMethod)
    }
    if (Array.isArray(payload?.data)) return payload.data.some(hasAtLeastOneEnabledMethod)
    return false
  } catch {
    return false
  }
}

async function checkUserHasAgentOrTCProfile(userType: string): Promise<boolean> {
  if (!userType) return false

  try {
    const response = await apiClient.get("/onboarding_profiles")
    const payload = response.data as
      | {
          data?: {
            agent?: unknown
            transaction_coordinator?: unknown
          }
        }
      | { agent?: unknown; transaction_coordinator?: unknown }
      | null
      | undefined

    const data = payload && "data" in payload && payload.data ? payload.data : payload
    if (!data || typeof data !== "object") return false

    const hasAgent = Boolean((data as { agent?: unknown }).agent)
    const hasTC = Boolean((data as { transaction_coordinator?: unknown }).transaction_coordinator)
    const normalizedType = userType.toLowerCase()

    if (normalizedType === "both") return hasAgent && hasTC
    return hasAgent || hasTC
  } catch {
    return false
  }
}

async function checkUserHasCalendarIntegration(userId: string): Promise<boolean> {
  try {
    const [connectedAccountsResponse, appleAccountsResponse] = await Promise.all([
      apiClient.get(`/users/${userId}/connected_accounts`),
      apiClient.get("/apple_calendars"),
    ])

    const connected = connectedAccountsResponse.data as unknown[] | { data?: unknown[] } | null
    const apples = appleAccountsResponse.data as
      | { accounts?: unknown[]; data?: unknown[] }
      | unknown[]
      | null

    const hasConnectedAccounts = Array.isArray(connected)
      ? connected.length > 0
      : Array.isArray(connected?.data)
        ? connected.data.length > 0
        : false

    const hasAppleAccounts = Array.isArray(apples)
      ? apples.length > 0
      : Array.isArray(apples?.accounts)
        ? apples.accounts.length > 0
        : Array.isArray(apples?.data)
          ? apples.data.length > 0
          : false

    return hasConnectedAccounts || hasAppleAccounts
  } catch {
    return false
  }
}

export async function checkProfileCompletion(
  user: Pick<ProfileSettingsUser, "id" | "name" | "lastName" | "userType"> | null,
): Promise<ProfileCompletionCheck> {
  if (!user) {
    return {
      isComplete: false,
      missingItems: [PROFILE_COMPLETION_STEPS.AGENT_AND_TC],
      completionPercentage: 0,
    }
  }

  let completedItems = 0
  const missingItems: ProfileCompletionStep[] = []
  const totalItems = REQUIRED_PROFILE_COMPLETION_STEPS.length

  const hasAgentOrTCProfile = await checkUserHasAgentOrTCProfile(user.userType)
  if (user.userType && hasAgentOrTCProfile) {
    completedItems++
  } else {
    missingItems.push(PROFILE_COMPLETION_STEPS.AGENT_AND_TC)
  }

  const hasCalendarIntegration = await checkUserHasCalendarIntegration(user.id)
  if (hasCalendarIntegration) {
    completedItems++
  } else {
    missingItems.push(PROFILE_COMPLETION_STEPS.CALENDAR)
  }

  const hasNotifications = await checkUserHasNotifications()
  if (hasNotifications) {
    completedItems++
  } else {
    missingItems.push(PROFILE_COMPLETION_STEPS.NOTIFICATIONS)
  }

  const completionPercentage = Math.round((completedItems / totalItems) * 100)

  return {
    isComplete: completionPercentage === 100,
    missingItems,
    completionPercentage,
  }
}
