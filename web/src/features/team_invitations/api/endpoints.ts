export const TEAM_INVITATION_ENDPOINTS = {
  create: "/team_invitations",
  list: (teamId: string) =>
    `/team_invitations?team_id=${encodeURIComponent(teamId)}`,
  get: (token: string) => `/team_invitations/${token}`,
  accept: (token: string) => `/team_invitations/${token}/accept`,
  reject: (token: string) => `/team_invitations/${token}/reject`,
  resend: (id: string) => `/team_invitations/${id}/resend`,
  cancel: (id: string) => `/team_invitations/${id}/cancel`,
} as const
