import * as Sentry from "@sentry/nextjs"
import type { AxiosError } from "axios"
import type { User } from "@/lib/auth/types"

type Primitive = string | number | boolean | null | undefined
type BreadcrumbData = Record<string, Primitive>

type BreadcrumbCategory =
  | "api"
  | "auth"
  | "cable"
  | "chat"
  | "upload"
  | "billing"
  | "oauth"
  | "ui"

type ApiErrorContext = {
  operation?: string
  method?: string
  path?: string
  status?: number | "network-error"
}

type AuthErrorContext = {
  event: string
  level?: Sentry.SeverityLevel
}

type CableErrorContext = {
  event: string
  channel?: string
  code?: number
}

const REDACTED = "[REDACTED]"
const SENSITIVE_KEY_PATTERN =
  /(password|passcode|token|authorization|cookie|secret|api[-_]?key|session|credit|card|cvv|ssn)/i
const RESPONSE_SANITIZE_DEPTH = 4

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
}

function sanitiseResponseData(value: unknown, depth = 0): unknown {
  if (depth > RESPONSE_SANITIZE_DEPTH) return "[Truncated]"
  if (value == null) return value

  if (Array.isArray(value)) {
    return value.map((item) => sanitiseResponseData(item, depth + 1))
  }

  if (!isRecord(value)) return value

  const clone: Record<string, unknown> = {}
  for (const [key, nestedValue] of Object.entries(value)) {
    clone[key] = SENSITIVE_KEY_PATTERN.test(key)
      ? REDACTED
      : sanitiseResponseData(nestedValue, depth + 1)
  }
  return clone
}

function normaliseError(error: unknown): Error {
  if (error instanceof Error) return error
  if (typeof error === "string") return new Error(error)
  return new Error("Unknown error")
}

function getStatusCode(error: unknown): number | undefined {
  return (error as AxiosError)?.response?.status
}

function shouldSkipApiCapture(status: number | undefined): boolean {
  // 401 -> handled by session expiry flow (breadcrumb added in client.ts)
  // 400 -> bad request, surfaced to user via form/toast; not a server error
  // 404 -> resource not found, handled by product UI
  // 422 -> validation failure, surfaced to user
  // 429 -> rate limiting, client handles with retry; not actionable in Sentry
  return (
    status === 400 ||
    status === 401 ||
    status === 404 ||
    status === 422 ||
    status === 429
  )
}

export function normalisePath(path: string): string {
  return path
    .replace(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
      ":uuid",
    )
    .replace(/\/\d+(?=\/|$)/g, "/:id")
}

function stripQuery(url: string): string {
  return url.split("?")[0]
}

export function addBreadcrumb(
  category: BreadcrumbCategory,
  message: string,
  data?: BreadcrumbData,
): void {
  Sentry.addBreadcrumb({ category, message, level: "info", data })
}

export function setSentryUser(profile: User): void {
  Sentry.setUser({
    id: profile.id ? String(profile.id) : undefined,
    email: profile.email || undefined,
    username: profile.nickname || profile.name || undefined,
  })
}

export function clearSentryUser(): void {
  Sentry.setUser(null)
}

export function captureApiError(
  error: unknown,
  context: ApiErrorContext = {},
): void {
  const axiosError = error as AxiosError
  const statusCode = getStatusCode(axiosError)
  const status = context.status ?? statusCode ?? "network-error"

  if (shouldSkipApiCapture(typeof status === "number" ? status : undefined)) {
    return
  }

  Sentry.withScope((scope) => {
    scope.setTag("api.operation", context.operation || "unknown")
    scope.setTag("api.status", String(status))
    if (context.method) scope.setTag("api.method", context.method)

    if (context.path) {
      scope.setTag("api.route", normalisePath(context.path))
      scope.setExtra("api.path", context.path)
    }

    if (axiosError?.code) scope.setExtra("api.error_code", axiosError.code)
    if (axiosError?.config?.url) {
      scope.setExtra("api.url", stripQuery(axiosError.config.url))
    }

    if (axiosError?.response?.data) {
      scope.setContext("api.response", {
        data: sanitiseResponseData(axiosError.response.data),
      })
    }

    Sentry.captureException(normaliseError(error))
  })
}

export function captureAuthError(
  error: unknown,
  context: AuthErrorContext,
): void {
  Sentry.withScope((scope) => {
    scope.setTag("auth.event", context.event)
    scope.setLevel(context.level ?? "warning")
    Sentry.captureException(normaliseError(error))
  })
}

export function captureCableError(
  error: unknown,
  context: CableErrorContext,
): void {
  Sentry.withScope((scope) => {
    scope.setTag("cable.event", context.event)
    scope.setTag("cable.channel", context.channel ?? "unknown")
    if (typeof context.code === "number") {
      // WebSocket close codes are better for per-event diagnostics than
      // indexed tag filtering.
      scope.setExtra("cable.code", context.code)
    }
    Sentry.captureException(normaliseError(error))
  })
}
