import { apiClient } from "@/lib/api/client";
import { TEAM_INVITATION_ENDPOINTS } from "./endpoints";
import {
  TEAM_INVITATION_DEFAULT_ROLE,
  TEAM_INVITATION_STATUS,
  type TeamInvitationRole,
} from "../constants";
import type { CreateTeamInvitationPayload, ApiTeamInvitation } from "../types";
import { TEAM_INVITATION_SERVICE_MESSAGES } from "./team-invitation-service-messages";

export type CreateTeamInvitationOptions = {
  teamId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: TeamInvitationRole;
};

/**
 * Creates a single team invitation. Backend sends invite email.
 * Requires X-Team-Id or team_id in body; we send team_id for clarity.
 */
export async function createTeamInvitation(
  options: CreateTeamInvitationOptions,
): Promise<ApiTeamInvitation> {
  const {
    teamId,
    email,
    firstName,
    lastName,
    phone,
    role = TEAM_INVITATION_DEFAULT_ROLE,
  } = options;

  if (!teamId?.trim()) {
    throw new Error(TEAM_INVITATION_SERVICE_MESSAGES.ERROR_TEAM_ID_REQUIRED);
  }

  const payload: CreateTeamInvitationPayload = {
    email: email.trim().toLowerCase(),
    role,
    ...(firstName?.trim() ? { first_name: firstName.trim() } : {}),
    ...(lastName?.trim() ? { last_name: lastName.trim() } : {}),
    ...(phone?.trim() ? { phone: phone.trim() } : {}),
  };

  const { data } = await apiClient.post<ApiTeamInvitation>(
    TEAM_INVITATION_ENDPOINTS.create,
    { team_id: teamId, ...payload },
  );

  if (!data?.id) {
    throw new Error(TEAM_INVITATION_SERVICE_MESSAGES.ERROR_INVITE_FAILED);
  }

  return data;
}

/** List pending invitations for a team. */
export async function listTeamInvitations(
  teamId: string,
): Promise<ApiTeamInvitation[]> {
  const { data } = await apiClient.get<ApiTeamInvitation[]>(
    TEAM_INVITATION_ENDPOINTS.list(teamId),
  );
  return Array.isArray(data) ? data : [];
}

/** Cancel a pending invitation. */
export async function cancelTeamInvitation(
  invitationId: string,
): Promise<void> {
  await apiClient.delete(TEAM_INVITATION_ENDPOINTS.cancel(invitationId));
}

/** Resend a pending invitation email. */
export async function resendTeamInvitation(
  invitationId: string,
): Promise<void> {
  await apiClient.post(TEAM_INVITATION_ENDPOINTS.resend(invitationId), {});
}

function extractInvitationFromActionResponse(
  payload: unknown,
): ApiTeamInvitation {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected invitation response.");
  }

  const raw = payload as {
    id?: string;
    team_invitation?: ApiTeamInvitation;
  };

  if (raw.team_invitation?.id) {
    return raw.team_invitation;
  }

  if (raw.id) {
    return raw as ApiTeamInvitation;
  }

  throw new Error("Invitation payload is missing required fields.");
}

/** Fetch invitation details using invitation token. */
export async function getTeamInvitation(
  invitationToken: string,
): Promise<ApiTeamInvitation> {
  const { data } = await apiClient.get<ApiTeamInvitation>(
    TEAM_INVITATION_ENDPOINTS.get(invitationToken),
  );

  if (!data?.id) {
    throw new Error("Invitation not found.");
  }

  return data;
}

/** Accept invitation using invitation token. */
export async function acceptTeamInvitation(
  invitationToken: string,
): Promise<ApiTeamInvitation> {
  const { data } = await apiClient.post(
    TEAM_INVITATION_ENDPOINTS.accept(invitationToken),
    {},
  );

  const invitation = extractInvitationFromActionResponse(data);
  if (invitation.status !== TEAM_INVITATION_STATUS.ACCEPTED) {
    throw new Error("Invitation could not be accepted.");
  }

  return invitation;
}

/** Reject invitation using invitation token. */
export async function rejectTeamInvitation(
  invitationToken: string,
): Promise<ApiTeamInvitation> {
  const { data } = await apiClient.post(
    TEAM_INVITATION_ENDPOINTS.reject(invitationToken),
    {},
  );

  const invitation = extractInvitationFromActionResponse(data);
  if (invitation.status !== TEAM_INVITATION_STATUS.REJECTED) {
    throw new Error("Invitation could not be declined.");
  }

  return invitation;
}
