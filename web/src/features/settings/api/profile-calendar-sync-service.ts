import { z } from "zod"
import { apiClient } from "@/lib/api/client"

export const CALENDAR_SYNC_PROVIDER = {
  GOOGLE: "google",
  MICROSOFT: "microsoft",
  APPLE: "apple",
} as const

type CalendarSyncProvider = (typeof CALENDAR_SYNC_PROVIDER)[keyof typeof CALENDAR_SYNC_PROVIDER]

const calendarOptionSchema = z.object({
  id: z.coerce.string(),
  name: z.string(),
})

const providerCalendarAccountSchema = z.object({
  provider: z.enum([
    CALENDAR_SYNC_PROVIDER.GOOGLE,
    CALENDAR_SYNC_PROVIDER.MICROSOFT,
    CALENDAR_SYNC_PROVIDER.APPLE,
  ]),
  accountId: z.coerce.string(),
  displayName: z.string(),
  identifier: z.string().optional().default(""),
  needsConsent: z.boolean().optional().default(false),
  selectedCalendarId: z.string().optional().nullable(),
  selectedCalendarName: z.string().optional().nullable(),
  calendars: z.array(calendarOptionSchema).optional().default([]),
})

const googleMicrosoftCalendarSchema = z.object({
  id: z.string(),
  summary: z.string().optional(),
  name: z.string().optional(),
})

const googleMicrosoftAccountSchema = z.object({
  id: z.coerce.string(),
  email: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  needs_consent: z.boolean().optional(),
  selected_calendar_id: z.string().optional().nullable(),
  selected_calendar_name: z.string().optional().nullable(),
  calendars: z.array(googleMicrosoftCalendarSchema).optional().default([]),
})

const googleMicrosoftResponseSchema = z.object({
  accounts: z.array(googleMicrosoftAccountSchema).optional().default([]),
})

const appleCalendarSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
})

const appleAccountSchema = z.object({
  id: z.coerce.string(),
  username: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  needs_consent: z.boolean().optional(),
  selected_calendar_id: z.string().optional().nullable(),
  selected_calendar_name: z.string().optional().nullable(),
  calendars: z.array(appleCalendarSchema).optional().default([]),
})

const appleResponseSchema = z.object({
  accounts: z.array(appleAccountSchema).optional().default([]),
})

export type ProviderCalendarAccount = z.infer<typeof providerCalendarAccountSchema>

function mapGoogleOrMicrosoftAccounts(
  provider: typeof CALENDAR_SYNC_PROVIDER.GOOGLE | typeof CALENDAR_SYNC_PROVIDER.MICROSOFT,
  payload: unknown,
): ProviderCalendarAccount[] {
  const parsed = googleMicrosoftResponseSchema.parse(payload)

  return parsed.accounts.map((account) =>
    providerCalendarAccountSchema.parse({
      provider,
      accountId: account.id,
      displayName: account.name || account.email || "Connected account",
      identifier: account.email || "",
      needsConsent: account.needs_consent ?? false,
      selectedCalendarId: account.selected_calendar_id ?? null,
      selectedCalendarName: account.selected_calendar_name ?? null,
      calendars: account.calendars.map((calendar) => ({
        id: calendar.id,
        name: calendar.summary || calendar.name || "Untitled calendar",
      })),
    }),
  )
}

function mapAppleAccounts(payload: unknown): ProviderCalendarAccount[] {
  const parsed = appleResponseSchema.parse(payload)

  return parsed.accounts.map((account) =>
    providerCalendarAccountSchema.parse({
      provider: CALENDAR_SYNC_PROVIDER.APPLE,
      accountId: account.id,
      displayName: account.name || account.username || "Apple calendar account",
      identifier: account.username || "",
      needsConsent: account.needs_consent ?? false,
      selectedCalendarId: account.selected_calendar_id ?? null,
      selectedCalendarName: account.selected_calendar_name ?? null,
      calendars: account.calendars.map((calendar) => ({
        id: calendar.id,
        name: calendar.name || "Untitled calendar",
      })),
    }),
  )
}

async function getProviderCalendars(path: string) {
  try {
    return await apiClient.get(path)
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "response" in error &&
      typeof error.response === "object" &&
      error.response &&
      "status" in error.response &&
      error.response.status === 400
    ) {
      return { data: { accounts: [] } }
    }
    throw error
  }
}

export async function listGoogleCalendarAccounts(): Promise<ProviderCalendarAccount[]> {
  const response = await getProviderCalendars("/google_calendars")
  return mapGoogleOrMicrosoftAccounts(CALENDAR_SYNC_PROVIDER.GOOGLE, response.data)
}

export async function listMicrosoftCalendarAccounts(): Promise<ProviderCalendarAccount[]> {
  const response = await getProviderCalendars("/microsoft_calendars")
  return mapGoogleOrMicrosoftAccounts(CALENDAR_SYNC_PROVIDER.MICROSOFT, response.data)
}

export async function listAppleCalendarAccountsForSync(): Promise<ProviderCalendarAccount[]> {
  const response = await getProviderCalendars("/apple_calendars")
  return mapAppleAccounts(response.data)
}

export async function selectCalendarForSync(input: {
  provider: CalendarSyncProvider
  accountId: string
  calendarId: string
  calendarName: string
}): Promise<void> {
  const endpoint =
    input.provider === CALENDAR_SYNC_PROVIDER.GOOGLE
      ? "/google_calendars/select"
      : input.provider === CALENDAR_SYNC_PROVIDER.MICROSOFT
        ? "/microsoft_calendars/select"
        : "/apple_calendars/select"

  await apiClient.put(endpoint, {
    account_id: input.accountId,
    calendar_id: input.calendarId,
    calendar_name: input.calendarName,
  })
}

export async function removeCalendarSync(input: {
  provider: CalendarSyncProvider
  accountId: string
}): Promise<void> {
  const endpoint =
    input.provider === CALENDAR_SYNC_PROVIDER.GOOGLE
      ? "/google_calendars/select"
      : input.provider === CALENDAR_SYNC_PROVIDER.MICROSOFT
        ? "/microsoft_calendars/select"
        : "/apple_calendars/select"

  await apiClient.put(endpoint, {
    account_id: input.accountId,
    calendar_id: "",
    calendar_name: "",
  })
}
