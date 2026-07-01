import * as Sentry from "@sentry/nextjs"
import { redactSentryEvent, redactCableToken } from "./lib/sentry/before-send"

const environment =
  process.env.NEXT_PUBLIC_APP_ENV ?? process.env.NODE_ENV ?? "development"
const isProduction = environment === "production"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment,
  tunnel: "/monitoring",
  integrations: [
    ...(isProduction
      ? [
          Sentry.replayIntegration({
            maskAllInputs: true,
            blockAllMedia: false,
          }),
        ]
      : []),
    ...(isProduction ? [Sentry.browserTracingIntegration()] : []),
  ],
  tracesSampleRate: isProduction ? 0.2 : 0,
  replaysSessionSampleRate: isProduction ? 0.1 : 0,
  replaysOnErrorSampleRate: isProduction ? 1.0 : 0,
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications.",
    "Hydration failed because the server rendered HTML didn't match the client.",
    "Network request failed",
    "AbortError",
    "NEXT_NOT_FOUND",
    "NEXT_REDIRECT",
  ],
  beforeSend(event) {
    return redactSentryEvent(event)
  },
  beforeBreadcrumb(breadcrumb) {
    const url = breadcrumb.data?.url
    if (typeof url === "string") {
      breadcrumb.data = { ...breadcrumb.data, url: redactCableToken(url) }
    }
    return breadcrumb
  },
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart

