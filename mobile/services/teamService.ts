import { Team } from "../types/team";
import apiClient from "./api";

export const teamService = {
  getTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get("/teams");

    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.teams)) {
      return response.data.teams;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    }

    return [];
  },

  getTeam: async (teamId: string): Promise<Team> => {
    const response = await apiClient.get(`/teams/${teamId}`);
    return response.data;
  },
};
