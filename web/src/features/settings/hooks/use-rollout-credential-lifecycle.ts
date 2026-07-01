"use client";

import { useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createThirdPartyCredential,
  normalizeThirdPartyIntegrationAppKey,
  removeThirdPartyCredential,
  type ThirdPartyCredential,
} from "@/features/settings/api/profile-third-party-integrations-service";
import { useIntegrationSyncStatus } from "@/features/settings/hooks/use-integration-sync-status";

export const THIRD_PARTY_CREDENTIALS_QUERY_KEY = [
  "settings",
  "third-party-integrations",
  "credentials",
] as const;

type RolloutSdkCredential = {
  id: string;
  appKey: string;
};

type ConnectSuccessPayload = {
  id: string;
  credentialId: string;
  appKey: string;
  syncStatus: string;
  syncedAt: string | null;
};

export function useRolloutCredentialLifecycle({
  supportedCredentials,
  onConnected,
  onConnectError,
  onDisconnected,
  onDisconnectError,
}: {
  supportedCredentials: ThirdPartyCredential[];
  onConnected?: (input: {
    appKey: string;
    result: ConnectSuccessPayload;
  }) => void;
  onConnectError?: (error: unknown) => void;
  onDisconnected?: () => void;
  onDisconnectError?: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const { startSync } = useIntegrationSyncStatus(supportedCredentials);

  // Dedup guard: prevents duplicate delete calls for the same credential.
  const deletingRef = useRef<Set<string>>(new Set());

  const createCredentialMutation = useMutation({
    mutationFn: createThirdPartyCredential,
    onSuccess: async (result, variables) => {
      await queryClient.invalidateQueries({
        queryKey: THIRD_PARTY_CREDENTIALS_QUERY_KEY,
      });

      onConnected?.({
        appKey: variables.appKey,
        result,
      });

      if (result.syncStatus === "pending") {
        startSync(result.id, result.appKey);
      }
    },
    onError: (error) => {
      onConnectError?.(error);
    },
  });

  const removeCredentialMutation = useMutation({
    mutationFn: removeThirdPartyCredential,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: THIRD_PARTY_CREDENTIALS_QUERY_KEY,
      });

      onDisconnected?.();
    },
    onError: (error) => {
      onDisconnectError?.(error);
    },
  });

  const handleCredentialAdded = useCallback(
    (credential: RolloutSdkCredential) => {
      createCredentialMutation.mutate({
        credentialId: credential.id,
        appKey: normalizeThirdPartyIntegrationAppKey(credential.appKey),
      });
    },
    [createCredentialMutation],
  );

  const handleSyncCredential = useCallback(
    (credential: { credentialId: string; appKey: string }) => {
      createCredentialMutation.mutate({
        credentialId: credential.credentialId,
        appKey: normalizeThirdPartyIntegrationAppKey(credential.appKey),
      });
    },
    [createCredentialMutation],
  );

  const handleCredentialDeleted = useCallback(
    (credential: RolloutSdkCredential) => {
      const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(
        credential.appKey,
      );

      console.info(
        "[RolloutLifecycle] onCredentialDeleted fired",
        { rolloutId: credential.id, appKey: normalizedAppKey },
      );

      // Primary match: credentialId + appKey (exact)
      let matchingCredential = supportedCredentials.find(
        (local) =>
          local.credentialId === credential.id &&
          normalizeThirdPartyIntegrationAppKey(local.appKey) ===
          normalizedAppKey,
      );

      // Fallback match: appKey only — handles cases where the Rollout SDK
      // reports a different credential ID than what our backend stored.
      if (!matchingCredential) {
        matchingCredential = supportedCredentials.find(
          (local) =>
            normalizeThirdPartyIntegrationAppKey(local.appKey) ===
            normalizedAppKey,
        );

        if (matchingCredential) {
          console.warn(
            "[RolloutLifecycle] Used appKey-only fallback for deletion match",
            {
              rolloutId: credential.id,
              matchedDbId: matchingCredential.id,
              matchedCredentialId: matchingCredential.credentialId,
            },
          );
        }
      }

      if (!matchingCredential) {
        console.warn(
          "[RolloutLifecycle] No matching credential found for deletion",
          {
            rolloutId: credential.id,
            appKey: normalizedAppKey,
            supportedCount: supportedCredentials.length,
          },
        );
        return;
      }

      // Dedup: skip if a delete for this DB id is already in-flight.
      if (deletingRef.current.has(matchingCredential.id)) return;
      deletingRef.current.add(matchingCredential.id);

      removeCredentialMutation.mutate(matchingCredential.id, {
        onSettled: () => {
          deletingRef.current.delete(matchingCredential!.id);
        },
      });
    },
    [removeCredentialMutation, supportedCredentials],
  );

  // Silent cleanup for stale credentials detected by the bridge's reverse sync.
  // Does NOT show a toast — the credential was deleted on Rollout's side and the
  // user may not be actively looking at the settings page.
  const handleStaleCredentialCleanup = useCallback(
    (credentialDbId: string) => {
      if (deletingRef.current.has(credentialDbId)) return;
      deletingRef.current.add(credentialDbId);

      console.info(
        "[RolloutLifecycle] Stale credential cleanup triggered",
        { dbId: credentialDbId },
      );

      removeThirdPartyCredential(credentialDbId)
        .then(() =>
          queryClient.invalidateQueries({
            queryKey: THIRD_PARTY_CREDENTIALS_QUERY_KEY,
          }),
        )
        .catch((error: unknown) => {
          console.warn(
            "[RolloutLifecycle] Stale credential cleanup failed — will retry on next cycle",
            { dbId: credentialDbId, error },
          );
        })
        .finally(() => {
          deletingRef.current.delete(credentialDbId);
        });
    },
    [queryClient],
  );

  return {
    createCredentialMutation,
    removeCredentialMutation,
    handleCredentialAdded,
    handleCredentialDeleted,
    handleSyncCredential,
    handleStaleCredentialCleanup,
  };
}
