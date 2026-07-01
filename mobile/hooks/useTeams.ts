import { useQuery } from "@tanstack/react-query";
import { teamService } from "../services/teamService";

// Query keys
export const teamKeys = {
  all: ["teams"] as const,
  lists: () => [...teamKeys.all, "list"] as const,
  details: () => [...teamKeys.all, "detail"] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// Individual hooks
export const useTeams = () => {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: teamService.getTeams,
  });
};

export const useTeam = (teamId: string) => {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => teamService.getTeam(teamId),
    enabled: !!teamId,
  });
};

// Combined hook - similar to useTaskManagement
export const useTeamManagement = () => {
  const teamsQuery = useTeams();

  return {
    // Query data
    teams: teamsQuery.data || [],
    isLoading: teamsQuery.isLoading,
    isError: teamsQuery.isError,
    error: teamsQuery.error,
    refetch: teamsQuery.refetch,
  };
};
