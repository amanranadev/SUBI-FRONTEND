import { z } from "zod"

const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")

export const inviteAgentRowSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: emailSchema.or(z.literal("")),
  phone: z.string(),
})

export type InviteAgentRowSchema = z.infer<typeof inviteAgentRowSchema>

/** Validates a single row: if email is filled, it must be valid. */
export function validateInviteAgentRow(row: {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
}): { success: true } | { success: false; message: string } {
  if (!row.email?.trim()) {
    return { success: true }
  }
  const result = emailSchema.safeParse(row.email.trim())
  if (!result.success) {
    const msg = result.error.errors[0]?.message ?? "Invalid email"
    return { success: false, message: msg }
  }
  return { success: true }
}

export const INVITATION_VALIDATION_MESSAGES = {
  SELF_INVITE: "You cannot invite yourself.",
  AT_LEAST_ONE_EMAIL: "Add at least one agent with an email address.",
} as const
