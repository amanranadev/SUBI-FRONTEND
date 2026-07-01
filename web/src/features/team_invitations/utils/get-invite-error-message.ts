import { isAxiosError } from "axios"

/**
 * Extracts a user-friendly message from a failed createTeamInvitation call.
 * Backend returns 422 with { errors: string[] } or { error: string }.
 */
export function getInviteErrorMessage(unknownError: unknown, email: string): string {
  if (isAxiosError(unknownError)) {
    const data = unknownError.response?.data
    if (data && typeof data === "object") {
      const errors = (data as { errors?: string[] }).errors
      if (Array.isArray(errors) && errors.length > 0) {
        return `${email}: ${errors[0]}`
      }
      const error = (data as { error?: string }).error
      if (typeof error === "string") {
        return `${email}: ${error}`
      }
    }
    const status = unknownError.response?.status
    if (status === 404) return `${email}: Team not found`
    if (status === 403) return `${email}: Not allowed to invite`
  }
  const fallback =
    unknownError instanceof Error ? unknownError.message : "Failed to send invite"
  return `${email}: ${fallback}`
}
