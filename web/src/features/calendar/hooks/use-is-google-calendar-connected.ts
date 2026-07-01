import { useQuery } from "@tanstack/react-query"
import { listGoogleCalendarAccounts } from "@/features/settings/api/profile-calendar-sync-service"

export const GOOGLE_CALENDAR_CONNECTION_STATUS_QUERY_KEY =
  "google-calendar-connection-status" as const

export function useIsGoogleCalendarConnected(): {
  isConnected: boolean
  needsConsent: boolean
  isLoading: boolean
} {
  const { data, isLoading } = useQuery({
    queryKey: [GOOGLE_CALENDAR_CONNECTION_STATUS_QUERY_KEY],
    queryFn: () => listGoogleCalendarAccounts(),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  })

  if (isLoading) {
    return {
      isConnected: false,
      needsConsent: false,
      isLoading: true,
    }
  }

  const accounts = data ?? []
  const connectedAccount = accounts.find(
    (account) => Boolean(account.selectedCalendarId) && !account.needsConsent,
  )

  return {
    isConnected: Boolean(connectedAccount),
    needsConsent: accounts.some((account) => account.needsConsent),
    isLoading: false,
  }
}
