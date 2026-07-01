export const TEAM_ENDPOINTS = {
  list: "/teams",
  get: (id: string) => `/teams/${id}`,
  update: (id: string) => `/teams/${id}`,
  updateMemberRole: (teamId: string, userId: string) =>
    `/teams/${teamId}/members/${userId}/role`,
  removeMember: (teamId: string, userId: string) =>
    `/teams/${teamId}/members/${userId}`,
} as const
