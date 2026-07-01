const NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_PSA_API_URL || ""

if (!NEXT_PUBLIC_API_BASE_URL && process.env.NODE_ENV !== "production") {
  // Keep dev boot alive and show a clear hint instead of crashing at import-time.
  // API calls will fail if this stays empty.
  console.warn(
    "[env] Missing NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_PSA_API_URL). " +
      "Set it in web/.env.local and restart `npm run dev`."
  )
}

if (!process.env.NEXT_PUBLIC_CADET_EXTENSION_ID && process.env.NODE_ENV !== "production") {
  console.warn(
    "[env] Missing NEXT_PUBLIC_CADET_EXTENSION_ID. " +
      "Set it in web/.env or web/.env.local (not the Rails backend .env) and restart `npm run dev`."
  )
}

export const env = {
  NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_DEMO_DOCUMENT_PREVIEW_TOKEN:
    process.env.NEXT_PUBLIC_DEMO_DOCUMENT_PREVIEW_TOKEN || "",
  NEXT_PUBLIC_CADET_EXTENSION_ID:
    process.env.NEXT_PUBLIC_CADET_EXTENSION_ID || "",
} as const
