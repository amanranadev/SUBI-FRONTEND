import { cookies } from "next/headers"
import { AUTH_COOKIE_NAME } from "@/lib/auth/routes"
import { env } from "@/lib/env"

const TEAM_COOKIE = "subi_team_id"

type ServerAuthHeaders = {
  Authorization: string
  "Content-Type": string
  "X-Team-Id"?: string
}

async function readAuthFromCookies(): Promise<{
  token: string
  teamId: string | null
} | null> {
  const jar = await cookies()
  const token = jar.get(AUTH_COOKIE_NAME)?.value
  if (!token) return null

  const teamId = jar.get(TEAM_COOKIE)?.value ?? null
  return { token, teamId }
}

function buildHeaders(token: string, teamId: string | null): ServerAuthHeaders {
  const headers: ServerAuthHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
  if (teamId) headers["X-Team-Id"] = teamId
  return headers
}

async function fetchJson(
  path: string,
  headers: ServerAuthHeaders,
): Promise<unknown> {
  const url = `${env.NEXT_PUBLIC_API_BASE_URL}${path}`
  const response = await fetch(url, { headers, cache: "no-store" })
  if (!response.ok) throw new Error(`${response.status}`)
  return response.json()
}

type MinimalUser = { id: string; userType: string }

function unwrapPayload(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== "object") return {}
  const obj = raw as Record<string, unknown>
  if (obj.data && typeof obj.data === "object" && !Array.isArray(obj.data)) {
    return obj.data as Record<string, unknown>
  }
  if (obj.user && typeof obj.user === "object" && !Array.isArray(obj.user)) {
    return obj.user as Record<string, unknown>
  }
  return obj
}

async function fetchProfileUser(
  headers: ServerAuthHeaders,
): Promise<MinimalUser | null> {
  const profileRaw = await fetchJson("/auth/profile", headers)
  const profile = unwrapPayload(profileRaw)
  const id = String(profile.id ?? "")
  if (!id) return null

  const detailsRaw = await fetchJson(`/users/${id}`, headers)
  const details = unwrapPayload(detailsRaw)

  const userType = String(
    details.user_type ?? details.userType ?? profile.user_type ?? profile.userType ?? "",
  )

  return { id, userType }
}

function hasAtLeastOneEnabledMethod(value: unknown): boolean {
  if (!value || typeof value !== "object") return false
  const obj = value as Record<string, unknown>

  const methods = obj.enabled_methods
  if (Array.isArray(methods) && methods.length > 0) return true

  return [
    obj.email_enabled,
    obj.sms_enabled,
    obj.in_app_enabled,
    obj.push_enabled,
    obj.emailEnabled,
    obj.smsEnabled,
    obj.inAppEnabled,
    obj.pushEnabled,
  ].some((flag) => flag === true)
}

async function hasNotifications(headers: ServerAuthHeaders): Promise<boolean> {
  const payload = (await fetchJson(
    "/user_notification_preferences",
    headers,
  )) as
    | { preferences?: unknown[]; data?: unknown[] }
    | unknown[]
    | null
    | undefined

  if (Array.isArray(payload)) return payload.some(hasAtLeastOneEnabledMethod)
  if (Array.isArray(payload?.preferences))
    return payload.preferences.some(hasAtLeastOneEnabledMethod)
  if (Array.isArray(payload?.data))
    return payload.data.some(hasAtLeastOneEnabledMethod)
  return false
}

async function hasAgentOrTCProfile(
  userType: string,
  headers: ServerAuthHeaders,
): Promise<boolean> {
  if (!userType) return false

  const payload = (await fetchJson("/onboarding_profiles", headers)) as
    | {
        data?: { agent?: unknown; transaction_coordinator?: unknown }
      }
    | { agent?: unknown; transaction_coordinator?: unknown }
    | null
    | undefined

  const data =
    payload && "data" in payload && payload.data ? payload.data : payload
  if (!data || typeof data !== "object") return false

  const hasAgent = Boolean((data as { agent?: unknown }).agent)
  const hasTC = Boolean(
    (data as { transaction_coordinator?: unknown }).transaction_coordinator,
  )
  const normalizedType = userType.toLowerCase()
  if (normalizedType === "both") return hasAgent && hasTC
  return hasAgent || hasTC
}

async function hasCalendarIntegration(
  userId: string,
  headers: ServerAuthHeaders,
): Promise<boolean> {
  const [connectedRaw, applesRaw] = await Promise.all([
    fetchJson(`/users/${userId}/connected_accounts`, headers),
    fetchJson("/apple_calendars", headers),
  ])

  const connected = connectedRaw as unknown[] | { data?: unknown[] } | null
  const apples = applesRaw as
    | { accounts?: unknown[]; data?: unknown[] }
    | unknown[]
    | null

  const hasConnected = Array.isArray(connected)
    ? connected.length > 0
    : Array.isArray(connected?.data) && connected.data.length > 0

  const hasApple = Array.isArray(apples)
    ? apples.length > 0
    : Array.isArray((apples as { accounts?: unknown[] })?.accounts)
      ? ((apples as { accounts: unknown[] }).accounts.length > 0)
      : Array.isArray((apples as { data?: unknown[] })?.data) &&
        (apples as { data: unknown[] }).data.length > 0

  return hasConnected || hasApple
}

/**
 * Server-side profile completion check for use in RSC / server pages.
 * Returns `true` when the user's profile is fully set up, `false` otherwise.
 *
 * On any unexpected error (network, auth, malformed response) this defaults
 * to `true` so users are never trapped in the onboarding loop.
 */
export async function isProfileCompleteServer(): Promise<boolean> {
  try {
    const auth = await readAuthFromCookies()
    if (!auth) return false

    const headers = buildHeaders(auth.token, auth.teamId)
    const user = await fetchProfileUser(headers)
    if (!user) return true

    const [agentTc, calendar, notifications] = await Promise.all([
      hasAgentOrTCProfile(user.userType, headers).catch(() => false),
      hasCalendarIntegration(user.id, headers).catch(() => false),
      hasNotifications(headers).catch(() => false),
    ])

    const hasAgentTcStep = Boolean(user.userType) && agentTc
    return hasAgentTcStep && calendar && notifications
  } catch {
    return true
  }
}
