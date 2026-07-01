"use client";

import * as React from "react";
import { CheckCircle2, ShieldAlert, ShieldCheck, Wifi } from "lucide-react";
import { CredentialsManager, RolloutLinkProvider } from "@rollout/link-react";
import "@rollout/link-react/style.css";
import {
  getThirdPartyIntegrationLabel,
  isSupportedThirdPartyIntegrationApp,
  verifyCredentialConnection,
  type ThirdPartyCredential,
  type VerifyCredentialResponse,
} from "@/features/settings/api/profile-third-party-integrations-service";
import { RolloutCredentialSyncBridge } from "@/features/settings/components/rollout-credential-sync-bridge";
import { useRolloutIntegrationQueries } from "@/features/settings/hooks/use-rollout-integration-queries";
import { useRolloutCredentialLifecycle } from "@/features/settings/hooks/use-rollout-credential-lifecycle";
import { useToast } from "@/shared/hooks/use-toast";
import { Button, Card, LoadingSpinner, Txt } from "@/shared/ui";

function getSyncStatusLabel(credential: ThirdPartyCredential) {
  if (credential.syncStatus === "synced") {
    if (credential.syncedAt) {
      const syncedDate = new Date(credential.syncedAt);
      if (!Number.isNaN(syncedDate.getTime())) {
        return `Synced ${syncedDate.toLocaleDateString()}`;
      }
    }
    return "Synced";
  }
  if (credential.syncStatus === "failed") return "Sync failed";

  if (credential.connectedAt) {
    const connectedDate = new Date(credential.connectedAt);
    if (!Number.isNaN(connectedDate.getTime())) {
      return `Connected ${connectedDate.toLocaleDateString()} · Syncing…`;
    }
  }
  return "Syncing…";
}

type VerifyState = {
  status: "idle" | "loading" | "connected" | "disconnected" | "error";
  cooldownUntil: number;
};

function CredentialRow({
  credential,
  isDisconnecting,
  onDisconnect,
}: {
  credential: ThirdPartyCredential;
  isDisconnecting: boolean;
  onDisconnect: () => void;
}) {
  const { toast } = useToast();
  const { credentialsQuery } = useRolloutIntegrationQueries();
  const [verify, setVerify] = React.useState<VerifyState>({
    status: credential.syncStatus === "synced" ? "connected" : "idle",
    cooldownUntil: 0,
  });

  const isCoolingDown = Date.now() < verify.cooldownUntil;

  const handleVerify = React.useCallback(async () => {
    if (verify.status === "loading" || isCoolingDown) return;

    setVerify({ status: "loading", cooldownUntil: 0 });

    try {
      const result: VerifyCredentialResponse =
        await verifyCredentialConnection(credential.id);

      if (result.connected) {
        setVerify({ status: "connected", cooldownUntil: Date.now() + 10_000 });
        toast({
          title: "Connection verified",
          description: `${getThirdPartyIntegrationLabel(credential.appKey)} is active and connected.`,
        });
      } else {
        setVerify({
          status: "disconnected",
          cooldownUntil: Date.now() + 10_000,
        });
        toast({
          title: "Connection lost",
          description: "This credential is no longer active. Please reconnect.",
          variant: "destructive",
        });
      }

      // Refresh credentials list with updated sync_status/synced_at
      void credentialsQuery.refetch();
    } catch {
      setVerify({ status: "error", cooldownUntil: Date.now() + 10_000 });
      toast({
        title: "Unable to verify",
        description: "Could not reach the integration service. Try again later.",
        variant: "destructive",
      });
    }
  }, [credential.id, credential.appKey, verify.status, isCoolingDown, toast, credentialsQuery]);

  // Clear status indicator after cooldown
  React.useEffect(() => {
    if (verify.cooldownUntil <= 0) return;

    const remaining = verify.cooldownUntil - Date.now();
    if (remaining <= 0) return;

    const timer = setTimeout(() => {
      setVerify({ status: "idle", cooldownUntil: 0 });
    }, remaining);

    return () => clearTimeout(timer);
  }, [verify.cooldownUntil]);

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 flex items-center justify-between gap-4">
      <div className="space-y-1 min-w-0">
        <Txt as="p" size="sm" weight="bold">
          {getThirdPartyIntegrationLabel(credential.appKey)}
        </Txt>
        <div className="flex items-center gap-2">
          <Txt as="p" size="xs" tone="muted">
            {getSyncStatusLabel(credential)}
          </Txt>
          {verify.status === "disconnected" && (
            <ShieldAlert className="size-3.5 text-red-500" />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {verify.status === "connected" ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-green-600">
            <CheckCircle2 className="size-3.5" />
            Connected
          </span>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={verify.status === "loading" || isCoolingDown}
            onClick={handleVerify}
            className="!rounded-xl gap-1.5 text-xs font-bold"
          >
            {verify.status === "loading" ? (
              <LoadingSpinner size="sm" />
            ) : (
              <Wifi className="size-3.5" />
            )}
            {verify.status === "loading" ? "Verifying…" : "Verify"}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isDisconnecting}
          onClick={onDisconnect}
        >
          Disconnect
        </Button>
      </div>
    </div>
  );
}

export function ProfileSettingsThirdPartyIntegrationsCard() {
  const { toast } = useToast();
  const { tokenQuery, credentialsQuery, supportedCredentials } =
    useRolloutIntegrationQueries();

  const {
    createCredentialMutation,
    removeCredentialMutation,
    handleCredentialAdded,
    handleCredentialDeleted,
    handleSyncCredential,
    handleStaleCredentialCleanup,
  } = useRolloutCredentialLifecycle({
    supportedCredentials,
    onConnected: ({ appKey }) => {
      toast({
        title: "Integration connected",
        description: `${getThirdPartyIntegrationLabel(appKey)} was connected. Syncing data…`,
      });
    },
    onConnectError: (error) => {
      toast({
        title: "Could not connect integration",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
    onDisconnected: () => {
      toast({
        title: "Integration disconnected",
        description: "The integration has been removed.",
      });
    },
    onDisconnectError: (error) => {
      toast({
        title: "Could not disconnect integration",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const isLoading = tokenQuery.isLoading || credentialsQuery.isLoading;
  const hasTokenError = tokenQuery.isError || !tokenQuery.data;

  return (
    <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-6">
      <div className="space-y-1">
        <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
          Third-party integrations
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          Connect Dotloop and SkySlope to sync transaction data from SUBI.
        </Txt>
      </div>

      <div className="space-y-3">
        <Txt as="p" size="sm" weight="bold">
          Connected integrations
        </Txt>
        {isLoading ? (
          <Txt as="p" size="sm" tone="muted">
            Loading integrations...
          </Txt>
        ) : supportedCredentials.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <Txt as="p" size="sm" tone="muted">
              No third-party integrations connected yet.
            </Txt>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {supportedCredentials.map((credential) => (
              <CredentialRow
                key={credential.id}
                credential={credential}
                isDisconnecting={removeCredentialMutation.isPending}
                onDisconnect={() =>
                  removeCredentialMutation.mutate(credential.id)
                }
              />
            ))}
          </div>
        )}
      </div>

      {hasTokenError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 space-y-2">
          <Txt as="p" size="sm" weight="bold" className="text-rose-700">
            Could not initialize integrations
          </Txt>
          <Txt as="p" size="xs" className="text-rose-600">
            Please refresh and try again.
          </Txt>
        </div>
      ) : (
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <RolloutLinkProvider key={tokenQuery.data} token={tokenQuery.data}>
            <RolloutCredentialSyncBridge
              enabled
              supportedCredentials={supportedCredentials}
              isSyncPending={createCredentialMutation.isPending}
              onSyncCredential={handleSyncCredential}
              onStaleCredential={handleStaleCredentialCleanup}
            />
            <CredentialsManager
              shouldRenderConnector={(connector) =>
                isSupportedThirdPartyIntegrationApp(connector.appKey)
              }
              onCredentialAdded={handleCredentialAdded}
              onCredentialDeleted={handleCredentialDeleted}
            />
          </RolloutLinkProvider>
        </div>
      )}

      <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 flex items-start gap-3">
        <ShieldCheck className="size-4 mt-0.5 text-foreground/70" />
        <Txt as="p" size="xs" tone="muted">
          Transaction syncing is one-way from SUBI to your connected TMS.
        </Txt>
      </div>
    </Card>
  );
}
