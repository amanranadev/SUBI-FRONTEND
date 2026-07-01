import type { OnboardingProfilesResponse } from "@/features/complete-profile/api/complete-profile-service"
import type { ProfileSettingsUser } from "@/features/settings/types"

function nonEmpty(...candidates: Array<string | null | undefined>): string {
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  return ""
}

/**
 * Settings → Profile reads `GET /users` first. License/brokerage may also exist on
 * `GET /onboarding_profiles` (agent / TC). We only fill **empty** user fields from
 * onboarding so `user.license_number` stays authoritative after Settings saves.
 * Complete-profile must call `syncAgentTcFieldsToUserProfile` so user row matches onboarding.
 */
export function mergeProfessionalDetailsFromOnboarding(
  user: ProfileSettingsUser,
  onboarding: OnboardingProfilesResponse,
): ProfileSettingsUser {
  const agent = onboarding.data?.agent
  const tc = onboarding.data?.transaction_coordinator

  const managingFromAgent =
    [agent?.managing_broker_name, agent?.managing_broker_phone]
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(" · ") || undefined

  return {
    ...user,
    licenseNumber: nonEmpty(user.licenseNumber, agent?.license, tc?.license),
    brokerageName: nonEmpty(user.brokerageName, agent?.brokerage_name),
    managingBroker: nonEmpty(user.managingBroker, managingFromAgent),
    website: nonEmpty(user.website, agent?.website, tc?.website),
    phoneNumber: nonEmpty(user.phoneNumber, agent?.phone, tc?.phone),
  }
}
