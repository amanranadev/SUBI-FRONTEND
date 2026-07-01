export const COMPLETE_PROFILE_USER_TYPE = {
  AGENT: "agent",
  TRANSACTION_COORDINATOR: "transaction_coordinator",
  BOTH: "both",
} as const

export type CompleteProfileUserType =
  (typeof COMPLETE_PROFILE_USER_TYPE)[keyof typeof COMPLETE_PROFILE_USER_TYPE]

/** Normalize API strings (case, aliases) for the Agent/TC wizard. */
export function parseCompleteProfileUserTypeFromApi(
  value?: string | null,
): CompleteProfileUserType {
  const raw = (value ?? "").trim().toLowerCase()
  if (raw === COMPLETE_PROFILE_USER_TYPE.AGENT) {
    return COMPLETE_PROFILE_USER_TYPE.AGENT
  }
  if (
    raw === COMPLETE_PROFILE_USER_TYPE.TRANSACTION_COORDINATOR ||
    raw === "tc"
  ) {
    return COMPLETE_PROFILE_USER_TYPE.TRANSACTION_COORDINATOR
  }
  if (raw === COMPLETE_PROFILE_USER_TYPE.BOTH) {
    return COMPLETE_PROFILE_USER_TYPE.BOTH
  }
  return COMPLETE_PROFILE_USER_TYPE.BOTH
}
