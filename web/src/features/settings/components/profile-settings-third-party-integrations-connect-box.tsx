"use client";

import { CredentialsManager, RolloutLinkProvider } from "@rollout/link-react";
import "@rollout/link-react/style.css";
import {
  getThirdPartyIntegrationLabel,
  isSupportedThirdPartyIntegrationApp,
} from "@/features/settings/api/profile-third-party-integrations-service";
import { RolloutCredentialSyncBridge } from "@/features/settings/components/rollout-credential-sync-bridge";
import { useRolloutIntegrationQueries } from "@/features/settings/hooks/use-rollout-integration-queries";
import { useRolloutCredentialLifecycle } from "@/features/settings/hooks/use-rollout-credential-lifecycle";
import { useToast } from "@/shared/hooks/use-toast";
import { Txt } from "@/shared/ui";

export function ProfileSettingsThirdPartyIntegrationsConnectBox() {
  const { toast } = useToast();
  const { tokenQuery, supportedCredentials } =
    useRolloutIntegrationQueries();

  const {
    createCredentialMutation,
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
  });

  const hasTokenError = tokenQuery.isError || !tokenQuery.data;

  return (
    <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 space-y-3">
      <Txt as="p" size="sm" weight="bold">
        Connect to their transaction management tool
      </Txt>
      {hasTokenError ? (
        <Txt as="p" size="xs" tone="muted">
          Could not load integrations right now.
        </Txt>
      ) : (
        <div className="rounded-xl border border-black/10 bg-white p-3">
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
    </div>
  );
}
