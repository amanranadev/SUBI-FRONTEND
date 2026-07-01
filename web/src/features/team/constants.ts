import type { TeamMemberRole } from "./types";

export const USER_ROLE = {
  AGENT: "agent",
  BROKER: "broker",
} as const;

export const TEAM_MEMBER_ROLE = {
  CONTRIBUTOR: "contributor",
  MANAGER: "manager",
  OWNER: "owner",
} as const;

export const TEAM_MEMBER_ROLE_LABELS: Record<TeamMemberRole, string> = {
  contributor: "Contributor",
  manager: "Manager",
  owner: "Owner",
};

export const TEAM_MEMBER_ROLES: TeamMemberRole[] = [
  TEAM_MEMBER_ROLE.CONTRIBUTOR,
  TEAM_MEMBER_ROLE.MANAGER,
  TEAM_MEMBER_ROLE.OWNER,
];
