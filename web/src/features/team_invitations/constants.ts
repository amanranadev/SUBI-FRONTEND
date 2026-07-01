import { TEAM_MEMBER_ROLE } from "../team/constants";

/**
 * Team invitation role values (backend enum: contributor, manager, owner).
 */
export const TEAM_INVITATION_ROLE = TEAM_MEMBER_ROLE;

export type TeamInvitationRole =
  (typeof TEAM_INVITATION_ROLE)[keyof typeof TEAM_INVITATION_ROLE];

export const TEAM_INVITATION_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

export type TeamInvitationStatus =
  (typeof TEAM_INVITATION_STATUS)[keyof typeof TEAM_INVITATION_STATUS];

/** Default role for broker-invited agents. */
export const TEAM_INVITATION_DEFAULT_ROLE = TEAM_INVITATION_ROLE.CONTRIBUTOR;

/** Max agents that can be invited in one broker onboarding flow. */
export const BROKER_INVITE_MAX_AGENTS = 12;
