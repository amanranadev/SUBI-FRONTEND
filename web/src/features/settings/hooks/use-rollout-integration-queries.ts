"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getThirdPartyIntegrationsToken,
  isSupportedThirdPartyIntegrationApp,
  listThirdPartyIntegrationsCredentials,
} from "@/features/settings/api/profile-third-party-integrations-service";
import { THIRD_PARTY_CREDENTIALS_QUERY_KEY } from "@/features/settings/hooks/use-rollout-credential-lifecycle";

export const THIRD_PARTY_TOKEN_QUERY_KEY = [
  "settings",
  "third-party-integrations",
  "token",
] as const;

const THIRD_PARTY_CREDENTIALS_REFRESH_MS = 10_000;

/**
 * Shared queries for Rollout integration data.
 * Used by both the full settings card and the compact connect box
 * to avoid duplicating query configuration.
 */
export function useRolloutIntegrationQueries() {
  const tokenQuery = useQuery({
    queryKey: THIRD_PARTY_TOKEN_QUERY_KEY,
    queryFn: getThirdPartyIntegrationsToken,
    staleTime: 14 * 60_000,
    gcTime: 20 * 60_000,
  });

  const credentialsQuery = useQuery({
    queryKey: THIRD_PARTY_CREDENTIALS_QUERY_KEY,
    queryFn: listThirdPartyIntegrationsCredentials,
    staleTime: 20_000,
    refetchInterval: THIRD_PARTY_CREDENTIALS_REFRESH_MS,
    refetchIntervalInBackground: true,
  });

  const supportedCredentials = useMemo(
    () =>
      (credentialsQuery.data ?? []).filter((credential) =>
        isSupportedThirdPartyIntegrationApp(credential.appKey),
      ),
    [credentialsQuery.data],
  );

  return { tokenQuery, credentialsQuery, supportedCredentials };
}
