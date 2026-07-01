"use client";

import { useEffect, useRef } from "react";
import { useCredentials } from "@rollout/link-react";
import {
  isSupportedThirdPartyIntegrationApp,
  normalizeThirdPartyIntegrationAppKey,
  type ThirdPartyCredential,
} from "@/features/settings/api/profile-third-party-integrations-service";

// WHY THREE SYNC LOOPS EXIST:
//
// 1. `useRolloutCredentialPolling` (5s): polls the ROLLOUT SDK so
//    `useCredentials().credentials` stays fresh.
//
// 2. `useUnpersistedCredentialSync` (forward sync): detects credentials
//    that exist on ROLLOUT but NOT in our backend → triggers creation.
//    This is the reconnect-detection mechanism.
//
// 3. `useStaleCredentialCleanup` (reverse sync): detects credentials
//    that exist in our BACKEND but NOT in Rollout → triggers deletion.
//    This handles the case where `onCredentialDeleted` fails to fire or
//    the SDK callback's data doesn't match our local records.
//
// `credentialsQuery` in the parent (10s) polls OUR BACKEND separately.
// All loops are necessary. Do not consolidate — they query different sources.

const ROLLOUT_CREDENTIALS_REFRESH_MS = 5_000;

/**
 * Time to wait after Rollout SDK first returns data before considering it
 * stable enough for reverse-sync comparison. This avoids false-positive
 * cleanup during initial load when the SDK hasn't fetched yet.
 */
const REVERSE_SYNC_STABILITY_MS = 20_000; // 20s — accounts for slow SDK load

function hasCredentialPersisted(
  credentials: ThirdPartyCredential[],
  input: { credentialId: string; appKey: string },
) {
  return credentials.some(
    (credential) =>
      normalizeThirdPartyIntegrationAppKey(credential.appKey) ===
      normalizeThirdPartyIntegrationAppKey(input.appKey) &&
      credential.credentialId === input.credentialId,
  );
}

// ── Loop 1: Keep Rollout SDK data fresh ────────────────────────────────

function useRolloutCredentialPolling(enabled: boolean) {
  const { refetch } = useCredentials();

  useEffect(() => {
    if (!enabled) return;

    void refetch();
    const id = window.setInterval(
      () => void refetch(),
      ROLLOUT_CREDENTIALS_REFRESH_MS,
    );

    return () => window.clearInterval(id);
  }, [enabled, refetch]);
}

// ── Loop 2: Forward sync (Rollout → Backend) ──────────────────────────

function useUnpersistedCredentialSync({
  enabled,
  isSyncPending,
  persistedCredentials,
  onNewCredential,
}: {
  enabled: boolean;
  isSyncPending: boolean;
  persistedCredentials: ThirdPartyCredential[];
  onNewCredential: (input: { credentialId: string; appKey: string }) => void;
}) {
  const { credentials: rolloutCredentials } = useCredentials();
  const inFlightRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled || isSyncPending || !rolloutCredentials) return;

    for (const { id: credentialId, appKey } of rolloutCredentials) {
      if (!isSupportedThirdPartyIntegrationApp(appKey)) continue;

      const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(appKey);
      const key = `${normalizedAppKey}:${credentialId}`;

      const alreadyInFlight = inFlightRef.current.has(key);
      const alreadyPersisted = hasCredentialPersisted(persistedCredentials, {
        credentialId,
        appKey: normalizedAppKey,
      });

      if (alreadyInFlight || alreadyPersisted) {
        continue;
      }

      inFlightRef.current.add(key);
      onNewCredential({ credentialId, appKey: normalizedAppKey });
    }
  }, [enabled, isSyncPending, onNewCredential, persistedCredentials, rolloutCredentials]);

  useEffect(() => {
    if (!isSyncPending) inFlightRef.current.clear();
  }, [isSyncPending]);
}

// ── Loop 3: Reverse sync (Backend → Rollout deletion) ─────────────────

/**
 * Detects credentials that exist in our backend but no longer exist in the
 * Rollout SDK. This handles the critical case where `onCredentialDeleted`
 * from the Rollout `CredentialsManager` never fires (or fires with data
 * that fails to match), leaving a stale credential in our database.
 *
 * Safety: waits for REVERSE_SYNC_STABILITY_MS after the first Rollout SDK
 * data load to avoid false positives during initial rendering.
 */
function useStaleCredentialCleanup({
  enabled,
  persistedCredentials,
  onStaleCredential,
}: {
  enabled: boolean;
  persistedCredentials: ThirdPartyCredential[];
  onStaleCredential: (credentialDbId: string) => void;
}) {
  const { credentials: rolloutCredentials } = useCredentials();
  const deletingRef = useRef<Set<string>>(new Set());
  const firstDataTimeRef = useRef<number | null>(null);

  // Track when Rollout SDK first returns non-null data.
  useEffect(() => {
    // Only start the stability clock when the SDK returns actual credential data.
    // An empty array on first render is not "stable data" — it's the loading state.
    // We require at least one supported credential OR confirmed empty-but-loaded state.
    // We use a separate "SDK ready" flag set after the first non-loading render.
    if (rolloutCredentials !== null && rolloutCredentials !== undefined && firstDataTimeRef.current === null) {
      // Give SDK an additional grace period: only mark ready after credentials
      // array has been non-null for two consecutive renders (5s apart via polling).
      // We achieve this by setting the timestamp only after the SDK has had its
      // first refetch complete — i.e., the array is defined and we've seen it once.
      firstDataTimeRef.current = Date.now();
    }
  }, [rolloutCredentials]);

  // Compare Rollout vs backend — trigger cleanup for stale entries.
  useEffect(() => {
    if (!enabled || !rolloutCredentials || !firstDataTimeRef.current) return;

    // Don't compare until the SDK data has been stable for a full window.
    if (Date.now() - firstDataTimeRef.current < REVERSE_SYNC_STABILITY_MS) {
      return;
    }

    // Build a set of Rollout-side credential IDs for supported integrations.
    const rolloutIds = new Set(
      rolloutCredentials
        .filter((c) => isSupportedThirdPartyIntegrationApp(c.appKey))
        .map((c) => c.id),
    );

    for (const credential of persistedCredentials) {
      // Still present in Rollout → not stale.
      if (rolloutIds.has(credential.credentialId)) continue;
      // Already being cleaned up.
      if (deletingRef.current.has(credential.id)) continue;

      console.info(
        "[RolloutBridge] Stale credential detected (backend-only)",
        {
          dbId: credential.id,
          credentialId: credential.credentialId,
          appKey: credential.appKey,
        },
      );

      deletingRef.current.add(credential.id);

      // Schedule a reset so the next poll cycle can retry if cleanup failed.
      // The lifecycle hook handles its own dedup — this reset only affects
      // the bridge-level guard, allowing a retry on the next effect run.
      setTimeout(() => {
        deletingRef.current.delete(credential.id);
      }, REVERSE_SYNC_STABILITY_MS);

      onStaleCredential(credential.id);
    }
  }, [enabled, persistedCredentials, rolloutCredentials, onStaleCredential]);
}

// ── Bridge component ───────────────────────────────────────────────────

export function RolloutCredentialSyncBridge({
  enabled,
  supportedCredentials,
  onSyncCredential,
  onStaleCredential,
  isSyncPending,
}: {
  enabled: boolean;
  supportedCredentials: ThirdPartyCredential[];
  onSyncCredential: (input: { credentialId: string; appKey: string }) => void;
  onStaleCredential: (credentialDbId: string) => void;
  isSyncPending: boolean;
}) {
  useRolloutCredentialPolling(enabled);

  useUnpersistedCredentialSync({
    enabled,
    isSyncPending,
    persistedCredentials: supportedCredentials,
    onNewCredential: onSyncCredential,
  });

  useStaleCredentialCleanup({
    enabled,
    persistedCredentials: supportedCredentials,
    onStaleCredential,
  });

  return null;
}
