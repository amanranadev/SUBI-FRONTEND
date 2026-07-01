import type { User } from "@/lib/auth/types";
import type { TeamMemberRole, Team } from "@/features/team/types";

type ResolveCurrentUserTeamRoleInput = {
  team: Team | undefined;
  user: User | null;
};

export function resolveCurrentUserTeamRole({
  team,
  user,
}: ResolveCurrentUserTeamRoleInput): TeamMemberRole | null {
  if (!team || !user) return null;

  const currentUserId = String(user.id ?? "");
  const currentUserEmail = user.email?.trim().toLowerCase();

  const currentMember = team.members.find((member) => {
    const isCurrentUserById = String(member.id) === currentUserId;
    const isCurrentUserByEmail =
      Boolean(currentUserEmail) &&
      member.email.trim().toLowerCase() === currentUserEmail;

    return isCurrentUserById || isCurrentUserByEmail;
  });

  return currentMember?.role ?? team.role ?? null;
}
