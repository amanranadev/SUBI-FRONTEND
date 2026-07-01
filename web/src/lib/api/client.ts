import axios, { type AxiosError } from "axios"
import { authStorage } from "@/lib/auth/storage"
import { env } from "@/lib/env"
import { addBreadcrumb, captureApiError, normalisePath } from "@/lib/sentry"

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

apiClient.interceptors.request.use((config) => {
  const token = authStorage.getToken()
  const teamId = authStorage.getTeamId()

  if (config.data instanceof FormData && config.headers) {
    // Let the browser define multipart boundary automatically.
    delete config.headers["Content-Type"]
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (teamId) {
    config.headers["X-Team-Id"] = teamId
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (typeof response.data === "string") {
      try {
        response.data = JSON.parse(response.data)
      } catch {
        // Not valid JSON — leave as-is
      }
    }
    return response
  },
  (error: AxiosError) => {
    const status = error.response?.status
    if (status === 401 && typeof window !== "undefined") {
      const requestPath = sanitisePath(error.config?.url)
      if (window.location.pathname.startsWith("/demo")) {
        return Promise.reject(error)
      }
      if (requestPath === "/auth/logout") {
        addBreadcrumb("auth", "Ignored 401 during logout", {
          path: requestPath,
          method: error.config?.method?.toUpperCase(),
        })
        return Promise.reject(error)
      }
      authStorage.clear()
      window.dispatchEvent(new CustomEvent("subi:auth:unauthorized"))
      addBreadcrumb("auth", "Session expired - 401 from API", {
        path: requestPath,
        method: error.config?.method?.toUpperCase(),
      })
      return Promise.reject(error)
    }

    if (status === 429 && typeof window !== "undefined") {
      addBreadcrumb("api", "Rate limited - 429 from API", {
        path: sanitisePath(error.config?.url),
        method: error.config?.method?.toUpperCase(),
      })
      return Promise.reject(error)
    }

    captureApiError(error, {
      operation: deriveOperation(error),
      method: error.config?.method?.toUpperCase(),
      path: sanitisePath(error.config?.url),
      status: status ?? "network-error",
    })

    return Promise.reject(error)
  }
)

function deriveOperation(error: AxiosError) {
  const method = error.config?.method?.toLowerCase() ?? "unknown"
  const rawPath = sanitisePath(error.config?.url)
  // Strip leading/trailing slashes, then normalise IDs for low-cardinality tags.
  const cleanPath = rawPath.replace(/^\/+/, "").replace(/\/+$/, "")
  return `${method}:${normalisePath(cleanPath) || "unknown"}`
}

function sanitisePath(url?: string) {
  if (!url) return "unknown"

  try {
    const parsed = new URL(url, env.NEXT_PUBLIC_API_BASE_URL || "http://localhost")
    return parsed.pathname || "unknown"
  } catch {
    return url.split("?")[0] || "unknown"
  }
}
