import * as Sentry from "@sentry/nextjs"
// NOTE: This file lives at the repo root (not inside src/).
// The import path below is intentionally "./src/lib/..." - do not change
// it to an alias (@/lib/...) as path aliases are not resolved in root-level
// files that run before Next.js webpack processing.
import { redactSentryEvent } from "./src/lib/sentry/before-send"

const environment =
  process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development"

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,
  tracesSampleRate: 0,
  ignoreErrors: [
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
    "AbortError",
  ],
  beforeSend(event) {
    return redactSentryEvent(event)
  },
})
