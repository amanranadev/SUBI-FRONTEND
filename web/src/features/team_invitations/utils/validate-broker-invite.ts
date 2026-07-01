import type { InviteAgentRow } from "../types"
import { INVITATION_VALIDATION_MESSAGES } from "../schemas/invite-agent-schema"
import { validateInviteAgentRow } from "../schemas/invite-agent-schema"

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export type ValidateBrokerInviteResult =
  | { valid: true; emailsToInvite: string[] }
  | { valid: false; message: string }

/**
 * Validates broker invite form: at least one row with valid email,
 * no self-invite, no duplicate emails in the list.
 */
export function validateBrokerInvite(
  agents: InviteAgentRow[],
  currentUserEmail: string,
): ValidateBrokerInviteResult {
  const emailsToInvite: string[] = []
  const seen = new Set<string>()

  for (const row of agents) {
    const email = row.email?.trim()
    if (!email) continue

    const rowValidation = validateInviteAgentRow(row)
    if (!rowValidation.success) {
      return { valid: false, message: rowValidation.message }
    }

    const normalized = normalizeEmail(email)
    if (normalized === normalizeEmail(currentUserEmail)) {
      return { valid: false, message: INVITATION_VALIDATION_MESSAGES.SELF_INVITE }
    }
    if (seen.has(normalized)) {
      continue
    }
    seen.add(normalized)
    emailsToInvite.push(normalized)
  }

  if (emailsToInvite.length === 0) {
    return { valid: false, message: INVITATION_VALIDATION_MESSAGES.AT_LEAST_ONE_EMAIL }
  }

  return { valid: true, emailsToInvite }
}
