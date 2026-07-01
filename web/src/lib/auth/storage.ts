import { AUTH_COOKIE_NAME } from "@/lib/auth/routes"

const TOKEN_COOKIE = AUTH_COOKIE_NAME
const TEAM_COOKIE = "subi_team_id"

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const parts = document.cookie.split(";")
  for (const part of parts) {
    const [key, ...rest] = part.trim().split("=")
    if (key === name) return decodeURIComponent(rest.join("="))
  }
  return null
}

function writeCookie(name: string, value: string, maxAgeInSeconds: number) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeInSeconds}; SameSite=Lax`
}

function clearCookie(name: string) {
  if (typeof document === "undefined") return
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`
}

export const authStorage = {
  getToken() {
    return readCookie(TOKEN_COOKIE)
  },
  setToken(token: string) {
    writeCookie(TOKEN_COOKIE, token, 60 * 60 * 24)
  },
  getTeamId() {
    return readCookie(TEAM_COOKIE)
  },
  setTeamId(teamId: string) {
    writeCookie(TEAM_COOKIE, teamId, 60 * 60 * 24)
  },
  clear() {
    clearCookie(TOKEN_COOKIE)
    clearCookie(TEAM_COOKIE)
  },
}
