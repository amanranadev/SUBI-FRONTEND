"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchCredentialSyncStatus,
  normalizeThirdPartyIntegrationAppKey,
  type ThirdPartyCredential,
} from "@/features/settings/api/profile-third-party-integrations-service";
import { useToast } from "@/shared/hooks/use-toast";

const PLATFORM_LABELS: Record<string, string> = {
  dotloop: "Dotloop",
  skyslope: "SkySlope",
};

function getPlatformLabel(appKey: string) {
  const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(appKey);
  return (
    PLATFORM_LABELS[normalizedAppKey] ??
    normalizedAppKey.charAt(0).toUpperCase() + normalizedAppKey.slice(1)
  );
}

type SyncState = "idle" | "pending" | "synced" | "failed";

const POLL_INTERVAL_MS = 10_000;
const TIMEOUT_MS = 10 * 60_000; // 10 minutes

// ── Helpers ──────────────────────────────────────────────────────────

/** Safely extract an HTTP status code from an unknown error. */
function getHttpStatus(error: unknown): number | undefined {
  if (error && typeof error === "object" && "response" in error) {
    return (error as { response?: { status?: number } }).response?.status;
  }
}

/** Mutable tracking state that persists across renders without causing re-renders. */
interface CredentialTracking {
  previousStatuses: Map<string, string>;
  previousIds: Set<string>;
  initialized: boolean;
  processedKeys: Set<string>;
}

function createInitialTracking(): CredentialTracking {
  return {
    previousStatuses: new Map(),
    previousIds: new Set(),
    initialized: false,
    processedKeys: new Set(),
  };
}

// ── Credential-watcher logic (extracted from the useEffect body) ─────

function processCredentialUpdates(
  credentials: ThirdPartyCredential[],
  tracking: CredentialTracking,
  handlers: {
    startSync: (credentialDbId: string, appKey: string) => void;
    stopActiveSync: (credentialId?: string) => void;
    toast: ReturnType<typeof useToast>["toast"];
    setStatus: (s: SyncState) => void;
  },
): void {
  const nextStatuses = new Map<string, string>();
  const nextIds = new Set<string>();

  for (const credential of credentials) {
    const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(
      credential.appKey,
    );
    const dedupeKey = `${credential.id}:${normalizedAppKey}`;
    nextIds.add(credential.id);
    nextStatuses.set(credential.id, credential.syncStatus);

    // If pending, start polling
    if (credential.syncStatus === "pending") {
      handlers.startSync(credential.id, credential.appKey);
      continue;
    }

    // Skip first render — we don't want to toast for pre-existing credentials
    if (!tracking.initialized) continue;

    const previousStatus = tracking.previousStatuses.get(credential.id);
    const isNewCredential = !tracking.previousIds.has(credential.id);
    const statusChanged =
      previousStatus !== undefined &&
      previousStatus !== credential.syncStatus;

    if (
      (isNewCredential || statusChanged) &&
      !tracking.processedKeys.has(dedupeKey)
    ) {
      tracking.processedKeys.add(dedupeKey);
      handlers.stopActiveSync(credential.id);

      const label = getPlatformLabel(normalizedAppKey);

      if (credential.syncStatus === "synced") {
        handlers.setStatus("synced");
        handlers.toast({
          title: `${label} is ready!`,
          description: "You can now create transactions.",
        });
      } else if (credential.syncStatus === "failed") {
        handlers.setStatus("failed");
        handlers.toast({
          title: `${label} sync failed`,
          description: "Please reconnect and try again.",
          variant: "destructive",
        });
      }
    }
  }

  // Clean up processed keys for credentials that no longer exist
  for (const key of Array.from(tracking.processedKeys)) {
    const credId = key.split(":")[0];
    if (credId && !nextIds.has(credId)) {
      tracking.processedKeys.delete(key);
    }
  }

  tracking.previousStatuses = nextStatuses;
  tracking.previousIds = nextIds;
  tracking.initialized = true;
}

// ── Hook ─────────────────────────────────────────────────────────────

/**
 * Tracks the sync status of a newly-connected integration credential.
 * When `startSync` is called after `onCredentialAdded`, it:
 *  1. Shows a "Syncing…" toast
 *  2. Polls the backend `/rollout/credentials/:id/sync_status` every 10s
 *  3. On "synced" → dismisses pending toast + shows success toast
 *  4. On "failed" or timeout → shows error toast
 *
 * Also watches the `credentials` array for new/transitioned credentials
 * (e.g., a soft-deleted credential restored by a webhook) and shows toasts.
 */
export function useIntegrationSyncStatus(
  credentials: ThirdPartyCredential[] = [],
) {
  const { toast, dismiss } = useToast();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<SyncState>("idle");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingToastIdRef = useRef<string | null>(null);
  const activeCredentialIdRef = useRef<string | null>(null);
  const trackingRef = useRef<CredentialTracking>(createInitialTracking());

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleSyncResult = useCallback(
    (appKey: string, result: "synced" | "failed", credentialId?: string) => {
      const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(appKey);
      const dedupeKey = `${credentialId}:${normalizedAppKey}`;

      if (trackingRef.current.processedKeys.has(dedupeKey)) return;
      trackingRef.current.processedKeys.add(dedupeKey);

      // Dismiss the pending toast
      if (pendingToastIdRef.current) {
        dismiss(pendingToastIdRef.current);
        pendingToastIdRef.current = null;
      }

      // Stop polling
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      activeCredentialIdRef.current = null;

      const label = getPlatformLabel(normalizedAppKey);

      if (result === "synced") {
        setStatus("synced");
        toast({
          title: `${label} is ready!`,
          description: "You can now create transactions.",
        });
      } else {
        setStatus("failed");
        toast({
          title: `${label} sync failed`,
          description: "Please reconnect and try again.",
          variant: "destructive",
        });
      }

      // Refresh credentials list so UI updates
      void queryClient.invalidateQueries({
        queryKey: ["settings", "third-party-integrations", "credentials"],
      });
    },
    [toast, dismiss, queryClient],
  );

  const stopActiveSync = useCallback(
    (credentialId?: string) => {
      if (
        credentialId &&
        activeCredentialIdRef.current &&
        activeCredentialIdRef.current !== credentialId
      ) {
        return;
      }

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }

      if (pendingToastIdRef.current) {
        dismiss(pendingToastIdRef.current);
        pendingToastIdRef.current = null;
      }

      activeCredentialIdRef.current = null;
    },
    [dismiss],
  );

  const pollCredentialStatus = useCallback(
    async ({
      credentialDbId,
      normalizedAppKey,
      label,
      startTime,
    }: {
      credentialDbId: string;
      normalizedAppKey: string;
      label: string;
      startTime: number;
    }) => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        stopActiveSync(credentialDbId);
        setStatus("failed");
        toast({
          title: `${label} sync timed out`,
          description: "Please try reconnecting.",
          variant: "destructive",
        });
        return;
      }

      try {
        const data = await fetchCredentialSyncStatus(credentialDbId);

        if (data.sync_status === "synced" || data.sync_status === "failed") {
          handleSyncResult(
            normalizedAppKey,
            data.sync_status as "synced" | "failed",
            credentialDbId,
          );
        }
      } catch (error: unknown) {
        if (getHttpStatus(error) === 404) {
          stopActiveSync(credentialDbId);
          setStatus("idle");
        }
      }
    },
    [handleSyncResult, stopActiveSync, toast],
  );

  const startSync = useCallback(
    (credentialDbId: string, appKey: string) => {
      const normalizedAppKey = normalizeThirdPartyIntegrationAppKey(appKey);

      if (
        activeCredentialIdRef.current === credentialDbId &&
        pollingRef.current
      ) {
        return;
      }

      // Prevent orphaned intervals when connect flow is triggered multiple times.
      stopActiveSync();

      // Allow fresh connect/reconnect cycles for the same credential to emit toasts again.
      trackingRef.current.processedKeys.delete(
        `${credentialDbId}:${normalizedAppKey}`,
      );

      activeCredentialIdRef.current = credentialDbId;
      setStatus("pending");
      const label = getPlatformLabel(normalizedAppKey);

      // Show loading toast (long-lived until we dismiss it)
      const { id: toastId } = toast({
        title: `Syncing ${label}…`,
        description: "This may take a few minutes.",
      });
      pendingToastIdRef.current = toastId;

      const startTime = Date.now();
      const poll = () =>
        void pollCredentialStatus({
          credentialDbId,
          normalizedAppKey,
          label,
          startTime,
        });

      pollingRef.current = setInterval(poll, POLL_INTERVAL_MS);
      poll(); // Immediate first poll
    },
    [pollCredentialStatus, stopActiveSync, toast],
  );

  // ── Watch credentials array for new/changed credentials ──────────
  // This catches credentials that appear (e.g., restored by webhook) or
  // transition status (e.g., pending → synced) via the 10s refetchInterval.
  useEffect(() => {
    processCredentialUpdates(credentials, trackingRef.current, {
      startSync,
      stopActiveSync,
      toast,
      setStatus,
    });
  }, [credentials, startSync, stopActiveSync, toast]);

  return { syncStatus: status, startSync };
}
