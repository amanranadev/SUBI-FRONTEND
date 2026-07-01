import { apiClient } from "@/lib/api/client";
import { TEAM_ENDPOINTS } from "./endpoints";
import type { Team, TeamMember, TeamMemberRole } from "../types";
import { TEAM_MEMBER_ROLE } from "../constants";

export type ApiTeamMember = {
  id: string;
  email: string;
  name: string;
  lastName?: string;
  role: string;
  createdAt?: string;
  avatar?: string;
};

export type ApiTeam = {
  id: string;
  name: string;
  description?: string;
  contact_email?: string;
  contactEmail?: string;
  logo?: string;
  role?: string;
  members: ApiTeamMember[];
};

export type UpdateTeamPayload = {
  name: string;
  contactEmail?: string;
  description?: string;
  logoFile?: File | null;
};

function mapApiMember(m: ApiTeamMember): TeamMember {
  return {
    id: String(m.id),
    email: m.email ?? "",
    name: m.name ?? "",
    lastName: m.lastName,
    role: (m.role as TeamMemberRole) ?? TEAM_MEMBER_ROLE.CONTRIBUTOR,
    createdAt: m.createdAt,
    avatar: m.avatar,
  };
}

export async function getTeam(teamId: string): Promise<Team> {
  const { data } = await apiClient.get<ApiTeam>(TEAM_ENDPOINTS.get(teamId));
  if (!data?.id) throw new Error("Team not found");
  return {
    id: String(data.id),
    name: data.name ?? "",
    description: data.description,
    contactEmail: data.contactEmail ?? data.contact_email,
    logo: data.logo,
    role: data.role as TeamMemberRole,
    members: (data.members ?? []).map(mapApiMember),
  };
}

export async function updateTeam(
  teamId: string,
  payload: UpdateTeamPayload,
): Promise<Team> {
  const hasLogoFile = Boolean(payload.logoFile);

  if (hasLogoFile) {
    const formData = new FormData();
    formData.append("name", payload.name);
    formData.append("contact_email", payload.contactEmail ?? "");
    formData.append("description", payload.description ?? "");
    formData.append("logo", payload.logoFile as File);

    const { data } = await apiClient.put<ApiTeam>(
      TEAM_ENDPOINTS.update(teamId),
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    if (!data?.id) throw new Error("Failed to update team");

    return {
      id: String(data.id),
      name: data.name ?? "",
      description: data.description,
      contactEmail: data.contactEmail ?? data.contact_email,
      logo: data.logo,
      role: data.role as TeamMemberRole,
      members: (data.members ?? []).map(mapApiMember),
    };
  }

  const { data } = await apiClient.put<ApiTeam>(TEAM_ENDPOINTS.update(teamId), {
    name: payload.name,
    contact_email: payload.contactEmail ?? "",
    description: payload.description ?? "",
  });

  if (!data?.id) throw new Error("Failed to update team");

  return {
    id: String(data.id),
    name: data.name ?? "",
    description: data.description,
    contactEmail: data.contactEmail ?? data.contact_email,
    logo: data.logo,
    role: data.role as TeamMemberRole,
    members: (data.members ?? []).map(mapApiMember),
  };
}

export async function updateMemberRole(
  teamId: string,
  userId: string,
  role: TeamMemberRole,
): Promise<void> {
  await apiClient.put(TEAM_ENDPOINTS.updateMemberRole(teamId, userId), {
    role,
  });
}

export async function removeMember(
  teamId: string,
  userId: string,
): Promise<void> {
  await apiClient.delete(TEAM_ENDPOINTS.removeMember(teamId, userId));
}
