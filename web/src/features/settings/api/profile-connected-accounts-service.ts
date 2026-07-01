import { z } from "zod";
import { apiClient } from "@/lib/api/client";

export const CONNECTED_ACCOUNT_PROVIDER = {
  GOOGLE: "google_oauth2",
  MICROSOFT: "microsoft_graph",
  APPLE_CALENDAR: "apple_calendar",
} as const;

export const CONNECTED_ACCOUNTS = {
  GOOGLE: "google",
  MICROSOFT: "microsoft",
  APPLE_CALENDAR: "apple",
} as const;

export type ConnectedAccountProvider =
  (typeof CONNECTED_ACCOUNTS)[keyof typeof CONNECTED_ACCOUNTS];

const connectedAccountSchema = z.object({
  id: z.coerce.string(),
  provider: z.string(),
  uid: z.string().optional().nullable(),
  picture: z.string().optional().nullable(),
  authData: z.record(z.string(), z.unknown()).optional().default({}),
});

const connectedAccountApiSchema = z.object({
  id: z.coerce.string(),
  provider: z.string(),
  uid: z.string().optional().nullable(),
  picture: z.string().optional().nullable(),
  auth_data: z.record(z.string(), z.unknown()).optional(),
});

export type ConnectedAccount = z.infer<typeof connectedAccountSchema>;

const appleCalendarAccountSchema = z.object({
  id: z.coerce.string(),
  username: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  needsConsent: z.boolean().optional().default(false),
});

const appleCalendarAccountApiSchema = z.object({
  id: z.coerce.string(),
  username: z.string().optional().nullable(),
  name: z.string().optional().nullable(),
  needs_consent: z.boolean().optional(),
});

const appleCalendarAccountsApiSchema = z.object({
  accounts: z.array(appleCalendarAccountApiSchema).optional().default([]),
});

export type AppleCalendarAccount = z.infer<typeof appleCalendarAccountSchema>;

export async function listConnectedAccounts(
  userId: string,
): Promise<ConnectedAccount[]> {
  const response = await apiClient.get(`/users/${userId}/connected_accounts`);
  const parsed = z.array(connectedAccountApiSchema).parse(response.data);

  return parsed.map((account) =>
    connectedAccountSchema.parse({
      id: account.id,
      provider: account.provider,
      uid: account.uid,
      picture: account.picture,
      authData: account.auth_data ?? {},
    }),
  );
}

export async function removeConnectedAccount(accountId: string): Promise<void> {
  await apiClient.delete(`/connected_accounts/${accountId}`);
}

export async function listAppleCalendarAccounts(): Promise<
  AppleCalendarAccount[]
> {
  const response = await apiClient.get("/apple_calendars");
  const parsed = appleCalendarAccountsApiSchema.parse(response.data);

  return parsed.accounts.map((account) =>
    appleCalendarAccountSchema.parse({
      id: account.id,
      username: account.username,
      name: account.name,
      needsConsent: account.needs_consent ?? false,
    }),
  );
}
