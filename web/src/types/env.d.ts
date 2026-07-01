declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_API_BASE_URL?: string
    NEXT_PUBLIC_PSA_API_URL?: string
    NEXT_PUBLIC_SENTRY_DSN?: string
    SENTRY_DSN?: string
    NEXT_PUBLIC_APP_ENV?: "development" | "staging" | "production"
    NEXT_PUBLIC_CADET_EXTENSION_ID?: string
    SENTRY_AUTH_TOKEN?: string
  }
}

export {}
