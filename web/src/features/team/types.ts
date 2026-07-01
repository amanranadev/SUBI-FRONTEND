import { TEAM_MEMBER_ROLE, USER_ROLE } from "./constants";

export type TeamMemberRole =
  (typeof TEAM_MEMBER_ROLE)[keyof typeof TEAM_MEMBER_ROLE];

export type TeamMember = {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  role: TeamMemberRole;
  createdAt?: string;
  avatar?: string;
};

export type Team = {
  id: string;
  name: string;
  description?: string;
  contactEmail?: string;
  logo?: string;
  role?: TeamMemberRole;
  members: TeamMember[];
};

export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
