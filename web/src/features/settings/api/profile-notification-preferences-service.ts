import { z } from "zod"
import { apiClient } from "@/lib/api/client"

export const NOTIFICATION_FREQUENCY = {
  REAL_TIME: "real_time",
  DAILY_DIGEST: "daily_digest",
  WEEKLY_DIGEST: "weekly_digest",
} as const

export const NOTIFICATION_METHOD = {
  EMAIL: "email_enabled",
  SMS: "sms_enabled",
  IN_APP: "in_app_enabled",
  PUSH: "push_enabled",
} as const

export const NOTIFICATION_TYPE = {
  TRANSACTION_STATUS_UPDATES: "transaction_status_updates",
  TASK_DEADLINE_REMINDERS: "task_deadline_reminders",
  PERFORMANCE_INSIGHTS: "performance_insights",
  ACCOUNT_NOTIFICATIONS: "account_notifications",
} as const

const notificationPreferenceSchema = z.object({
  id: z.coerce.string(),
  notificationType: z.string(),
  title: z.string(),
  description: z.string(),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  frequency: z.enum([
    NOTIFICATION_FREQUENCY.REAL_TIME,
    NOTIFICATION_FREQUENCY.DAILY_DIGEST,
    NOTIFICATION_FREQUENCY.WEEKLY_DIGEST,
  ]),
  frequencyDisplay: z.string().optional().nullable(),
  frequencyDescription: z.string().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
})

const notificationPreferenceApiSchema = z.object({
  id: z.coerce.string(),
  notification_type: z.string(),
  title: z.string(),
  description: z.string(),
  email_enabled: z.boolean().optional().default(false),
  sms_enabled: z.boolean().optional().default(false),
  in_app_enabled: z.boolean().optional().default(false),
  push_enabled: z.boolean().optional().default(false),
  frequency: z
    .enum([
      NOTIFICATION_FREQUENCY.REAL_TIME,
      NOTIFICATION_FREQUENCY.DAILY_DIGEST,
      NOTIFICATION_FREQUENCY.WEEKLY_DIGEST,
    ])
    .optional()
    .default(NOTIFICATION_FREQUENCY.REAL_TIME),
  frequency_display: z.string().optional().nullable(),
  frequency_description: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
})

const listPreferencesPayloadSchema = z.union([
  z.array(notificationPreferenceApiSchema),
  z.object({
    preferences: z.array(notificationPreferenceApiSchema).optional().default([]),
    data: z.array(notificationPreferenceApiSchema).optional(),
  }),
])

const initializeDefaultsPayloadSchema = z.object({
  preferences: z.array(notificationPreferenceApiSchema).optional().default([]),
})

const bulkUpdatePayloadSchema = z.object({
  preferences: z.array(notificationPreferenceApiSchema).optional().default([]),
})

function toNotificationPreference(
  item: z.infer<typeof notificationPreferenceApiSchema>,
) {
  return notificationPreferenceSchema.parse({
    id: item.id,
    notificationType: item.notification_type,
    title: item.title,
    description: item.description,
    emailEnabled: item.email_enabled,
    smsEnabled: item.sms_enabled,
    inAppEnabled: item.in_app_enabled,
    pushEnabled: item.push_enabled,
    frequency: item.frequency,
    frequencyDisplay: item.frequency_display ?? null,
    frequencyDescription: item.frequency_description ?? null,
    createdAt: item.created_at ?? null,
    updatedAt: item.updated_at ?? null,
  })
}

export type NotificationPreference = z.infer<typeof notificationPreferenceSchema>
export type NotificationFrequency =
  (typeof NOTIFICATION_FREQUENCY)[keyof typeof NOTIFICATION_FREQUENCY]

export type NotificationPreferenceBulkUpdateInput = {
  preferences: Array<{
    notificationType: string
    emailEnabled?: boolean
    smsEnabled?: boolean
    inAppEnabled?: boolean
    pushEnabled?: boolean
    frequency?: NotificationFrequency
  }>
}

export async function listNotificationPreferences(): Promise<NotificationPreference[]> {
  const response = await apiClient.get("/user_notification_preferences")
  const parsed = listPreferencesPayloadSchema.parse(response.data)

  const items = Array.isArray(parsed)
    ? parsed
    : parsed.preferences.length > 0
      ? parsed.preferences
      : parsed.data ?? []

  return items.map(toNotificationPreference)
}

export async function initializeNotificationPreferencesDefaults(): Promise<
  NotificationPreference[]
> {
  const response = await apiClient.post(
    "/user_notification_preferences/initialize_defaults",
    {},
  )
  const parsed = initializeDefaultsPayloadSchema.parse(response.data)
  return parsed.preferences.map(toNotificationPreference)
}

export async function bulkUpdateNotificationPreferences(
  input: NotificationPreferenceBulkUpdateInput,
): Promise<NotificationPreference[]> {
  const response = await apiClient.put("/user_notification_preferences/bulk_update", {
    preferences: input.preferences.map((preference) => ({
      notification_type: preference.notificationType,
      email_enabled: preference.emailEnabled,
      sms_enabled: preference.smsEnabled,
      in_app_enabled: preference.inAppEnabled,
      push_enabled: preference.pushEnabled,
      frequency: preference.frequency,
    })),
  })

  const parsed = bulkUpdatePayloadSchema.parse(response.data)
  return parsed.preferences.map(toNotificationPreference)
}
