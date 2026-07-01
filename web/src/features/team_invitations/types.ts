import type { TeamInvitationRole, TeamInvitationStatus } from "./constants"

/** Payload to create a single team invitation (backend accepts email + role). */
export type CreateTeamInvitationPayload = {
  email: string
  role: TeamInvitationRole
  first_name?: string
  last_name?: string
  phone?: string
}

/** API response for a created team invitation. */
export type ApiTeamInvitation = {
  id: string
  email: string
  role: TeamInvitationRole | string
  status: TeamInvitationStatus | string
  first_name?: string
  last_name?: string
  phone?: string
  created_at: string
  updated_at: string
  team?: { id: string; name?: string; logo?: string; description?: string }
  inviter?: { id: string; name?: string; email?: string }
  user?: { id: string; name?: string; email?: string }
}

/** Form row used by invite UI and persisted on TeamInvitation. */
export type InviteAgentRow = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}
