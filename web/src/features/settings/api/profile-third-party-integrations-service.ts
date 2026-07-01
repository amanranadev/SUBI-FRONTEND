import { z } from "zod";
import { apiClient } from "@/lib/api/client";

export const THIRD_PARTY_INTEGRATION_APP = {
  DOTLOOP: "dotloop",
  DOTLOOP_LEGACY: "dotloop-legacy",
  SKYSLOPE: "skyslope",
} as const;

export type ThirdPartyIntegrationApp =
  (typeof THIRD_PARTY_INTEGRATION_APP)[keyof typeof THIRD_PARTY_INTEGRATION_APP];

const rolloutTokenResponseSchema = z.object({
  token: z.string().min(1),
});

const rolloutCredentialSchema = z.object({
  id: z.coerce.string(),
  credentialId: z.string(),
  appKey: z.string(),
  connectedAt: z.string().nullable().optional(),
  syncStatus: z.string().optional().default("pending"),
  syncedAt: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

const rolloutCredentialApiSchema = z.object({
  id: z.coerce.string(),
  credential_id: z.string(),
  app_key: z.string(),
  connected_at: z.string().nullable().optional(),
  sync_status: z.string().optional().default("pending"),
  synced_at: z.string().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

const rolloutCredentialsResponseSchema = z.object({
  credentials: z.array(rolloutCredentialApiSchema).default([]),
});

const createCredentialResponseSchema = z.object({
  id: z.coerce.string(),
  credential_id: z.string(),
  app_key: z.string(),
  sync_status: z.string().optional(),
  synced_at: z.string().nullable().optional(),
});

const syncStatusResponseSchema = z.object({
  id: z.coerce.string(),
  app_key: z.string(),
  sync_status: z.string(),
  synced_at: z.string().nullable().optional(),
});

const verifyCredentialResponseSchema = z.object({
  id: z.coerce.string(),
  credential_id: z.string(),
  app_key: z.string(),
  connected: z.boolean(),
  sync_status: z.string(),
  synced_at: z.string().nullable().optional(),
  profile: z
    .object({
      label: z.string().nullable().optional(),
      avatar: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
});

export type ThirdPartyCredential = z.infer<typeof rolloutCredentialSchema>;
export type SyncStatusResponse = z.infer<typeof syncStatusResponseSchema>;
export type VerifyCredentialResponse = z.infer<
  typeof verifyCredentialResponseSchema
>;

export function normalizeThirdPartyIntegrationAppKey(appKey: string): string {
  return appKey === THIRD_PARTY_INTEGRATION_APP.DOTLOOP_LEGACY
    ? THIRD_PARTY_INTEGRATION_APP.DOTLOOP
    : appKey;
}

export function getThirdPartyIntegrationLabel(appKey: string): string {
  const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(appKey);

  if (normalizedAppKey === THIRD_PARTY_INTEGRATION_APP.DOTLOOP) {
    return "Dotloop";
  }

  if (normalizedAppKey === THIRD_PARTY_INTEGRATION_APP.SKYSLOPE) {
    return "SkySlope";
  }

  return normalizedAppKey;
}

export function isSupportedThirdPartyIntegrationApp(appKey: string): boolean {
  const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(appKey);
  return (
    normalizedAppKey === THIRD_PARTY_INTEGRATION_APP.DOTLOOP ||
    normalizedAppKey === THIRD_PARTY_INTEGRATION_APP.SKYSLOPE
  );
}

export async function getThirdPartyIntegrationsToken(): Promise<string> {
  const response = await apiClient.get("/rollout/token");
  const parsed = rolloutTokenResponseSchema.parse(response.data);
  return parsed.token;
}

export async function listThirdPartyIntegrationsCredentials(): Promise<
  ThirdPartyCredential[]
> {
  const response = await apiClient.get("/rollout/credentials");
  const parsed = rolloutCredentialsResponseSchema.parse(response.data);

  return parsed.credentials.map((credential) =>
    rolloutCredentialSchema.parse({
      id: credential.id,
      credentialId: credential.credential_id,
      appKey: normalizeThirdPartyIntegrationAppKey(credential.app_key),
      connectedAt: credential.connected_at ?? null,
      syncStatus: credential.sync_status ?? "pending",
      syncedAt: credential.synced_at ?? null,
      metadata: credential.metadata ?? {},
    }),
  );
}

export async function createThirdPartyCredential(input: {
  credentialId: string;
  appKey: string;
}): Promise<{
  id: string;
  credentialId: string;
  appKey: string;
  syncStatus: string;
  syncedAt: string | null;
}> {
  const response = await apiClient.post("/rollout/credentials", {
    credential_id: input.credentialId,
    app_key: normalizeThirdPartyIntegrationAppKey(input.appKey),
  });

  const parsed = createCredentialResponseSchema.parse(response.data);
  return {
    id: parsed.id,
    credentialId: parsed.credential_id,
    appKey: normalizeThirdPartyIntegrationAppKey(parsed.app_key),
    syncStatus: parsed.sync_status ?? "pending",
    syncedAt: parsed.synced_at ?? null,
  };
}

export async function removeThirdPartyCredential(
  credentialId: string,
): Promise<void> {
  await apiClient.delete(`/rollout/credentials/${credentialId}`);
}

export async function fetchCredentialSyncStatus(
  credentialId: string,
): Promise<SyncStatusResponse> {
  const response = await apiClient.get(
    `/rollout/credentials/${credentialId}/sync_status`,
  );
  const parsed = syncStatusResponseSchema.parse(response.data);

  return {
    ...parsed,
    app_key: normalizeThirdPartyIntegrationAppKey(parsed.app_key),
  };
}

export async function verifyCredentialConnection(
  credentialId: string,
): Promise<VerifyCredentialResponse> {
  const response = await apiClient.post(
    `/rollout/credentials/${credentialId}/verify`,
  );
  const parsed = verifyCredentialResponseSchema.parse(response.data);

  return {
    ...parsed,
    app_key: normalizeThirdPartyIntegrationAppKey(parsed.app_key),
  };
}
