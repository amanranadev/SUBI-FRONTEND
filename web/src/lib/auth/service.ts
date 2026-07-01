import { apiClient } from "@/lib/api/client"
import { authResponseSchema, userSchema, type AuthResponse, type User } from "@/lib/auth/types"

function normalizeAuthUserPayload(data: unknown): unknown {
  if (!data || typeof data !== "object") return data
  const payload = data as Record<string, unknown>
  const normalized = { ...payload } as Record<string, unknown>

  if (typeof payload.user_type === "string" && normalized.userType == null) {
    normalized.userType = payload.user_type
  }
  if (typeof payload.team_id === "string" && normalized.teamId == null) {
    normalized.teamId = payload.team_id
  }
  if (typeof payload.has_password === "boolean" && normalized.hasPassword == null) {
    normalized.hasPassword = payload.has_password
  }

  return normalized
}

function resolvePreferredProfileImage(baseUser: User, detailsUser?: Partial<User>): User {
  if (!detailsUser) return baseUser

  const preferredAvatar =
    detailsUser.avatar ??
    detailsUser.picture ??
    baseUser.avatar ??
    baseUser.picture ??
    null

  const preferredPicture =
    detailsUser.picture ??
    detailsUser.avatar ??
    baseUser.picture ??
    baseUser.avatar ??
    null

  return {
    ...baseUser,
    ...detailsUser,
    avatar: preferredAvatar,
    picture: preferredPicture,
  }
}

export const authService = {
  async signup(payload: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/signup", payload)
    return authResponseSchema.parse(response.data)
  },

  async login(payload: { email: string; password: string }): Promise<AuthResponse> {
    const response = await apiClient.post("/auth/login", payload)
    return authResponseSchema.parse(response.data)
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get("/auth/profile")
    const baseUser = userSchema.parse(normalizeAuthUserPayload(response.data))

    try {
      // /auth/profile can return stale/limited image fields. Fetch full user
      // details and prioritize uploaded avatar over provider picture.
      const detailsResponse = await apiClient.get(`/users/${baseUser.id}`)
      const detailsUser = userSchema
        .partial()
        .parse(normalizeAuthUserPayload(detailsResponse.data))
      return resolvePreferredProfileImage(baseUser, detailsUser)
    } catch {
      return baseUser
    }
  },

  async logout(): Promise<void> {
    await apiClient.delete("/auth/logout")
  },

  async requestPasswordReset(payload: { email: string }): Promise<{ message?: string }> {
    const response = await apiClient.post("/auth/password", payload)
    return response.data
  },

  async validateResetToken(token: string): Promise<{ valid: boolean; message?: string }> {
    const response = await apiClient.get("/auth/password/validate", {
      params: { token },
    })
    return response.data
  },

  async resetPassword(payload: {
    password: string
    password_confirmation: string
    token: string
  }): Promise<{ message?: string }> {
    const response = await apiClient.put("/auth/password", payload)
    return response.data
  },
}
