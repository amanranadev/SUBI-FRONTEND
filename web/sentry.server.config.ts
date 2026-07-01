import * as Sentry from "@sentry/nextjs"
// NOTE: This file lives at the repo root (not inside src/).
// The import path below is intentionally "./src/lib/..." - do not change
// it to an alias (@/lib/...) as path aliases are not resolved in root-level
// files that run before Next.js webpack processing.
import { redactSentryEvent } from "./src/lib/sentry/before-send"

const environment =
  process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development"
const isProduction = environment === "production"

Sentry.init({
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,
  tracesSampleRate: isProduction ? 0.1 : 0,
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications.",
    "Network request failed",
    "AbortError",
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],
  beforeSend(event) {
    return redactSentryEvent(event)
  },
})
