"use client";

import { useActiveTeamId } from "@/features/team/hooks/use-active-team-id";

type UseAgentTeamMembershipResult = {
  hasMultipleTeams: boolean;
  isSoloAgentAccount: boolean;
  primaryTeamId: string | null;
  invitedTeamId: string | null;
};

export function useAgentTeamMembership(): UseAgentTeamMembershipResult {
  const { availableTeams, primaryTeamId } = useActiveTeamId();
  const invitedTeamId = availableTeams[1]?.id ?? null;
  const hasMultipleTeams = availableTeams.length > 1;

  return {
    hasMultipleTeams,
    isSoloAgentAccount: !hasMultipleTeams,
    primaryTeamId,
    invitedTeamId,
  };
}
