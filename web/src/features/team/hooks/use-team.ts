"use client"

import { useQuery } from "@tanstack/react-query"
import { getTeam } from "../api/team-service"

const TEAM_QUERY_KEY = ["team"] as const

export function useTeam(teamId: string | null) {
  const query = useQuery({
    queryKey: [...TEAM_QUERY_KEY, teamId],
    queryFn: () => getTeam(teamId!),
    enabled: Boolean(teamId),
    staleTime: 60_000,
  })

  return {
    team: query.data,
    isTeamLoading: query.isLoading,
    teamError: query.error,
    refetchTeam: query.refetch,
  }
}
