"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  type ReactNode,
} from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { AUTH_SESSION_STATUS } from "@/lib/auth/constants"
import { AUTH_ROUTES } from "@/lib/auth/routes"
import { authService } from "@/lib/auth/service"
import { authStorage } from "@/lib/auth/storage"
import type { AuthResponse, AuthSession, User } from "@/lib/auth/types"
import { captureAuthError, clearSentryUser, setSentryUser } from "@/lib/sentry"

const sessionQueryKey = ["auth", "session"] as const

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isSessionExpired: boolean
  signup: (input: { email: string; password: string; returnTo?: string | null }) => Promise<void>
  login: (input: { email: string; password: string; returnTo?: string | null }) => Promise<void>
  completeOAuthLogin: (token: string, returnTo?: string | null) => Promise<void>
  refreshSession: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function normalizeRedirect(user: User, returnTo?: string | null) {
  if (returnTo && returnTo.startsWith("/")) return returnTo
  if (user.isSuperadmin) return "/admin/users"
  return AUTH_ROUTES.HOME
}

async function bootstrapSession(): Promise<AuthSession> {
  const token = authStorage.getToken()
  if (!token) return { status: AUTH_SESSION_STATUS.ANONYMOUS, token: null, user: null }

  try {
    const user = await authService.getProfile()
    return { status: AUTH_SESSION_STATUS.AUTHENTICATED, token, user }
  } catch (error) {
    captureAuthError(error, { event: "profile-bootstrap", level: "error" })
    return { status: AUTH_SESSION_STATUS.EXPIRED, token: null, user: null }
  }
}

function resolveTeamId(user: User) {
  if (user.teams.length > 1) {
    return user.teams[1]?.id || null
  }
  return user.teamId || user.teams[0]?.id || null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const queryClient = useQueryClient()

  const sessionQuery = useQuery({
    queryKey: sessionQueryKey,
    queryFn: bootstrapSession,
    staleTime: 10_000,
    retry: false,
  })

  const persistAuth = useCallback(
    (auth: AuthResponse, returnTo?: string | null) => {
      authStorage.setToken(auth.token)
      const teamId = resolveTeamId(auth.user)
      if (teamId) authStorage.setTeamId(teamId)
      const user = teamId ? { ...auth.user, teamId } : auth.user
      setSentryUser(user)

      queryClient.setQueryData<AuthSession>(sessionQueryKey, {
        status: AUTH_SESSION_STATUS.AUTHENTICATED,
        token: auth.token,
        user,
      })

      router.replace(normalizeRedirect(auth.user, returnTo))
    },
    [queryClient, router]
  )

  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.login({ email, password }),
    onError: (error) => {
      captureAuthError(error, { event: "login", level: "error" })
    },
  })

  const signupMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authService.signup({ email, password }),
    onError: (error) => {
      captureAuthError(error, { event: "signup", level: "error" })
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      clearSentryUser()
    },
  })

  const value: AuthContextValue = {
    user: sessionQuery.data?.user ?? null,
    isAuthenticated: sessionQuery.data?.status === AUTH_SESSION_STATUS.AUTHENTICATED,
    isSessionExpired: sessionQuery.data?.status === AUTH_SESSION_STATUS.EXPIRED,
    isLoading:
      sessionQuery.isLoading ||
      loginMutation.isPending ||
      signupMutation.isPending ||
      logoutMutation.isPending,
    signup: async ({ email, password, returnTo }) => {
      const response = await signupMutation.mutateAsync({ email, password })
      persistAuth(response, returnTo)
    },
    login: async ({ email, password, returnTo }) => {
      const response = await loginMutation.mutateAsync({ email, password })
      persistAuth(response, returnTo)
    },
    completeOAuthLogin: async (token, returnTo) => {
      authStorage.setToken(token)
      try {
        const oauthProfile = await authService.getProfile()
        setSentryUser(oauthProfile)
        persistAuth({ token, user: oauthProfile }, returnTo)
      } catch (error) {
        captureAuthError(error, { event: "oauth-login", level: "error" })
        throw error
      }
    },
    refreshSession: async () => {
      await queryClient.invalidateQueries({ queryKey: sessionQueryKey })
    },
    logout: async () => {
      try {
        await logoutMutation.mutateAsync()
      } catch {
        // Ignore API errors and always clear local session client-side.
      } finally {
        clearSentryUser()
        authStorage.clear()
        queryClient.setQueryData<AuthSession>(sessionQueryKey, {
          status: AUTH_SESSION_STATUS.ANONYMOUS,
          token: null,
          user: null,
        })
        router.replace(AUTH_ROUTES.LOGIN)
      }
    },
  }

  useEffect(() => {
    const handleUnauthorized = () => {
      const existingSession = queryClient.getQueryData<AuthSession>(sessionQueryKey)
      if (
        existingSession?.status === AUTH_SESSION_STATUS.ANONYMOUS ||
        existingSession?.status === AUTH_SESSION_STATUS.EXPIRED
      ) {
        return
      }
      clearSentryUser()
      queryClient.setQueryData<AuthSession>(sessionQueryKey, {
        status: AUTH_SESSION_STATUS.EXPIRED,
        token: null,
        user: null,
      })
      router.replace(`${AUTH_ROUTES.LOGIN}?reason=expired`)
    }

    window.addEventListener("subi:auth:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("subi:auth:unauthorized", handleUnauthorized)
  }, [queryClient, router])

  useEffect(() => {
    const profile = sessionQuery.data?.user
    if (profile) {
      setSentryUser(profile)
    }
  }, [sessionQuery.data?.user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
