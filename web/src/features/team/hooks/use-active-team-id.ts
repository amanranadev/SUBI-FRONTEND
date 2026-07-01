"use client";

import * as React from "react";
import { useAuth } from "@/lib/auth/context";
import { authStorage } from "@/lib/auth/storage";

export type ActiveTeamOption = {
  id: string;
  name: string;
};

type UseActiveTeamIdResult = {
  selectedTeamId: string | null;
  setSelectedTeamId: (teamId: string | null) => void;
  availableTeams: ActiveTeamOption[];
  primaryTeamId: string | null;
  hasInvitedTeam: boolean;
  isInvitedTeamSelected: boolean;
};

function resolveDefaultTeamId(
  userTeamId: string | null | undefined,
  teams: ActiveTeamOption[],
): string | null {
  if (teams.length > 1) {
    // Temporary product heuristic: prioritize the second team option as invited team.
    // TODO: Replace this with explicit team source metadata from backend.
    return teams[1]?.id ?? null;
  }

  return userTeamId ?? teams[0]?.id ?? null;
}

export function useActiveTeamId(): UseActiveTeamIdResult {
  const { user } = useAuth();

  const availableTeams = React.useMemo<ActiveTeamOption[]>(
    () => (user?.teams ?? []).map((team) => ({ id: team.id, name: team.name })),
    [user?.teams],
  );

  const primaryTeamId = availableTeams[0]?.id ?? null;
  const [selectedTeamId, setSelectedTeamId] = React.useState<string | null>(
    () => resolveDefaultTeamId(user?.teamId, availableTeams),
  );

  React.useEffect(() => {
    const validIds = new Set(availableTeams.map((team) => team.id));
    const hasSelectedTeam = Boolean(
      selectedTeamId && validIds.has(selectedTeamId),
    );
    const preferredTeamId = resolveDefaultTeamId(user?.teamId, availableTeams);

    if (hasSelectedTeam && selectedTeamId === preferredTeamId) return;

    const nextTeamId = preferredTeamId;
    if (nextTeamId !== selectedTeamId) {
      setSelectedTeamId(nextTeamId);
    }
  }, [availableTeams, selectedTeamId, user?.teamId]);

  React.useEffect(() => {
    if (!selectedTeamId) return;
    authStorage.setTeamId(selectedTeamId);
  }, [selectedTeamId, user?.email]);

  const hasInvitedTeam = availableTeams.length > 1;
  const isInvitedTeamSelected = Boolean(
    hasInvitedTeam && selectedTeamId && selectedTeamId !== primaryTeamId,
  );

  return {
    selectedTeamId,
    setSelectedTeamId,
    availableTeams,
    primaryTeamId,
    hasInvitedTeam,
    isInvitedTeamSelected,
  };
}
