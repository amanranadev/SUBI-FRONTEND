import * as React from "react";
import { TEAM_MEMBER_ROLE } from "@/features/team/constants";
import { resolveCurrentUserTeamRole } from "@/features/team/resolve-current-user-team-role";
import type { Team } from "@/features/team/types";
import type { User } from "@/lib/auth/types";
import type { ChecklistAssignableMember } from "@/features/transactions/components/transaction-detail/checklist-task-extra-actions";

interface UseChecklistRolesProps {
  team: Team | undefined;
  user: User | null;
}

export function useChecklistRoles({ team, user }: UseChecklistRolesProps) {
  const currentUserTeamRole = React.useMemo(
    () => resolveCurrentUserTeamRole({ team, user }),
    [team, user]
  );

  const canAssignChecklistTasks =
    currentUserTeamRole === TEAM_MEMBER_ROLE.OWNER;

  const teamMembers = React.useMemo(() => team?.members ?? [], [team?.members]);

  const getMemberDisplayName = React.useCallback(
    (member: { name?: string; lastName?: string; email?: string }) => {
      const fullName = [member.name, member.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();
      return fullName || member.email || "Unknown user";
    },
    []
  );

  const assigneeById = React.useMemo(
    () =>
      new Map(
        teamMembers.map((member) => [member.id, getMemberDisplayName(member)])
      ),
    [getMemberDisplayName, teamMembers]
  );

  const assignableMembers = React.useMemo<ChecklistAssignableMember[]>(() => {
    if (teamMembers.length > 0) {
      const currentUserId = String(user?.id ?? "");
      const currentUserEmail = user?.email?.trim().toLowerCase();

      return teamMembers
        .filter((member) => {
          const isCurrentUserById = String(member.id) === currentUserId;
          const isCurrentUserByEmail =
            Boolean(currentUserEmail) &&
            member.email.trim().toLowerCase() === currentUserEmail;
          return !isCurrentUserById && !isCurrentUserByEmail;
        })
        .map((member) => ({
          id: member.id,
          label: getMemberDisplayName(member),
        }));
    }

    return [];
  }, [getMemberDisplayName, teamMembers, user?.email, user?.id]);

  return {
    canAssignChecklistTasks,
    assigneeById,
    assignableMembers,
  };
}
