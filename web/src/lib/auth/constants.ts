export const AUTH_SESSION_STATUS = {
  LOADING: "loading",
  AUTHENTICATED: "authenticated",
  ANONYMOUS: "anonymous",
  EXPIRED: "expired",
} as const

export type AuthSessionStatus = (typeof AUTH_SESSION_STATUS)[keyof typeof AUTH_SESSION_STATUS]
