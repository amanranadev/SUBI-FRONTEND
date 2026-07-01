import type * as Sentry from "@sentry/nextjs"

const HEADERS_TO_REDACT = [
  "Authorization",
  "authorization",
  "Cookie",
  "cookie",
  "X-Api-Key",
  "x-api-key",
] as const

export function redactSentryEvent(
  event: Sentry.ErrorEvent,
): Sentry.ErrorEvent {
  if (!event.request) return event

  if (event.request.headers) {
    for (const header of HEADERS_TO_REDACT) {
      delete event.request.headers[header]
    }
  }

  delete event.request.data

  return event
}

export function redactCableToken(value: string): string {
  return value.replace(/([?&]token=)[^&]+/gi, "$1[REDACTED]")
}

