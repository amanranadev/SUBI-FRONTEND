"use client";

import { BookUser, Link2Off, RefreshCw, ShieldCheck } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { FaMicrosoft } from "react-icons/fa6";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CONNECTED_ACCOUNT_PROVIDER,
  CONNECTED_ACCOUNTS,
  ConnectedAccountProvider,
  listAppleCalendarAccounts,
  listConnectedAccounts,
  removeConnectedAccount,
  type ConnectedAccount,
} from "@/features/settings/api/profile-connected-accounts-service";
import { invalidateProfileCompletionQueries } from "@/features/settings/hooks/use-profile-completion";
import { importContactsFromProvider } from "@/features/contacts/api";

import { authStorage } from "@/lib/auth/storage";
import { env } from "@/lib/env";
import { useToast } from "@/shared/hooks/use-toast";
import { Button, Card, LoadingSpinner, Txt } from "@/shared/ui";

type ProfileSettingsConnectedAccountsCardProps = {
  userId: string | null;
};

const CONNECTED_ACCOUNTS_QUERY_KEY = [
  "settings",
  "connected-accounts",
] as const;
const APPLE_ACCOUNTS_QUERY_KEY = ["settings", "apple-accounts"] as const;

function getProviderLabel(provider: string) {
  if (provider === CONNECTED_ACCOUNT_PROVIDER.GOOGLE) return "Google";
  if (provider === CONNECTED_ACCOUNT_PROVIDER.MICROSOFT) return "Microsoft";
  return provider.replace(/_/g, " ");
}

function getAccountDisplayName(account: ConnectedAccount) {
  const name = account.authData?.name;
  const nickname = account.authData?.nickname;
  const email = account.authData?.email;

  if (typeof name === "string" && name.trim()) return name;
  if (typeof nickname === "string" && nickname.trim()) return nickname;
  if (typeof email === "string" && email.trim()) return email;
  return "Connected account";
}

function getAccountEmail(account: ConnectedAccount) {
  const email = account.authData?.email;
  return typeof email === "string" && email.trim() ? email : null;
}

export function ProfileSettingsConnectedAccountsCard({
  userId,
}: ProfileSettingsConnectedAccountsCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const connectedAccountsQuery = useQuery({
    queryKey: [...CONNECTED_ACCOUNTS_QUERY_KEY, userId],
    queryFn: () => listConnectedAccounts(userId!),
    enabled: Boolean(userId),
    staleTime: 20_000,
  });

  const appleAccountsQuery = useQuery({
    queryKey: [...APPLE_ACCOUNTS_QUERY_KEY, userId],
    queryFn: () => listAppleCalendarAccounts(),
    enabled: Boolean(userId),
    staleTime: 20_000,
  });

  const disconnectMutation = useMutation({
    mutationFn: (accountId: string) => removeConnectedAccount(accountId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...CONNECTED_ACCOUNTS_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [...APPLE_ACCOUNTS_QUERY_KEY, userId],
        }),
        invalidateProfileCompletionQueries(queryClient),
      ]);
      toast({
        title: "Account disconnected",
        description: "The connected account has been removed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Could not disconnect account",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const syncContactsMutation = useMutation({
    mutationFn: () => importContactsFromProvider("google_oauth2"),
    onSuccess: (count) => {
      toast({
        title: "Contacts synced",
        description:
          count > 0
            ? `Imported ${count} contact${count !== 1 ? "s" : ""} from Google.`
            : "No new contacts to import.",
      });
    },
    onError: () => {
      toast({
        title: "Sync failed",
        description: "Could not import contacts. Please try again.",
        variant: "destructive",
      });
    },
  });

  const startConnectFlow = (provider: ConnectedAccountProvider) => {
    const token = authStorage.getToken();
    if (!token) {
      toast({
        title: "Session unavailable",
        description: "Please sign in again before connecting a new account.",
        variant: "destructive",
      });
      return;
    }

    const state = encodeURIComponent(token);
    const providerPath =
      provider === CONNECTED_ACCOUNTS.GOOGLE
        ? CONNECTED_ACCOUNT_PROVIDER.GOOGLE
        : CONNECTED_ACCOUNT_PROVIDER.MICROSOFT;

    window.location.href = `${env.NEXT_PUBLIC_API_BASE_URL}/api/auth/${providerPath}?connect=true&state=${state}`;
  };

  const accounts = connectedAccountsQuery.data ?? [];
  const appleAccounts = appleAccountsQuery.data ?? [];
  const isBusy = disconnectMutation.isPending;

  const hasGoogleConnected = accounts.some(
    (account) => account.provider === CONNECTED_ACCOUNT_PROVIDER.GOOGLE,
  );
  const hasMicrosoftConnected = accounts.some(
    (account) => account.provider === CONNECTED_ACCOUNT_PROVIDER.MICROSOFT,
  );
  const hasAppleConnected =
    accounts.some(
      (account) =>
        account.provider === CONNECTED_ACCOUNT_PROVIDER.APPLE_CALENDAR,
    ) || appleAccounts.length > 0;

  return (
    <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-8">
      <div className="space-y-1">
        <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
          Connected accounts
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          Link external providers for sign-in and calendar integrations.
        </Txt>
      </div>

      <div className="space-y-3">
        <Txt as="p" size="sm" weight="bold">
          Active connections
        </Txt>
        {connectedAccountsQuery.isLoading || appleAccountsQuery.isLoading ? (
          <Txt as="p" size="sm" tone="muted">
            Loading connected accounts...
          </Txt>
        ) : accounts.length === 0 && appleAccounts.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <Txt as="p" size="sm" tone="muted">
              No connected accounts yet.
            </Txt>
          </div>
        ) : (
          <>
            {accounts.map((account) => (
              <div
                key={account.id}
                className="rounded-2xl border border-black/10 bg-white p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <Txt as="p" size="sm" weight="bold" className="capitalize">
                    {getProviderLabel(account.provider)}
                  </Txt>
                  <Txt as="p" size="sm" tone="muted">
                    {getAccountDisplayName(account)}
                  </Txt>
                  {getAccountEmail(account) ? (
                    <Txt as="p" size="xs" tone="muted" className="opacity-80">
                      {getAccountEmail(account)}
                    </Txt>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => disconnectMutation.mutate(account.id)}
                >
                  <Link2Off className="size-4" />
                  Disconnect
                </Button>
              </div>
            ))}

            {appleAccounts.map((account) => (
              <div
                key={`apple-${account.id}`}
                className="rounded-2xl border border-black/10 bg-white p-4 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <Txt as="p" size="sm" weight="bold" className="capitalize">
                    Apple
                  </Txt>
                  <Txt as="p" size="sm" tone="muted">
                    {account.name ||
                      account.username ||
                      "Apple Calendar account"}
                  </Txt>
                  {account.username ? (
                    <Txt as="p" size="xs" tone="muted" className="opacity-80">
                      {account.username}
                    </Txt>
                  ) : null}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => disconnectMutation.mutate(account.id)}
                >
                  <Link2Off className="size-4" />
                  Disconnect
                </Button>
              </div>
            ))}
          </>
        )}
      </div>

      <div className="space-y-3">
        <Txt as="p" size="sm" weight="bold">
          Connect a new account
        </Txt>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <Button
            type="button"
            variant={hasGoogleConnected ? "default" : "outline"}
            disabled={hasGoogleConnected}
            className={
              hasGoogleConnected
                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                : ""
            }
            onClick={() => startConnectFlow("google")}
          >
            <FcGoogle className="size-4" />
            {hasGoogleConnected ? "Google Connected" : "Connect Google"}
          </Button>
          <Button
            type="button"
            variant={hasMicrosoftConnected ? "default" : "outline"}
            disabled={hasMicrosoftConnected}
            className={
              hasMicrosoftConnected
                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                : ""
            }
            onClick={() => startConnectFlow("microsoft")}
          >
            <FaMicrosoft className="size-4" />
            {hasMicrosoftConnected
              ? "Microsoft Connected"
              : "Connect Microsoft"}
          </Button>
          <Button
            type="button"
            variant={hasAppleConnected ? "default" : "outline"}
            disabled={hasAppleConnected}
            className={
              hasAppleConnected
                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                : ""
            }
            onClick={() =>
              toast({
                title: "Apple connection",
                description: "Apple connection UI will be enabled soon.",
              })
            }
          >
            <FaApple className="size-4" />
            {hasAppleConnected ? "Apple Connected" : "Connect Apple"}
          </Button>
        </div>
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 flex items-start gap-3">
          <ShieldCheck className="size-4 mt-0.5 text-foreground/70" />
          <Txt as="p" size="xs" tone="muted">
            We only request access needed for login and calendar sync features.
          </Txt>
        </div>
      </div>

      {hasGoogleConnected && (
        <div className="space-y-3">
          <Txt as="p" size="sm" weight="bold">
            Contact sync
          </Txt>
          <div className="rounded-2xl border border-black/10 bg-white p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="size-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <BookUser className="size-5 text-primary" />
              </div>
              <div className="space-y-0.5">
                <Txt as="p" size="sm" weight="bold">
                  Google Contacts
                </Txt>
                <Txt as="p" size="xs" tone="muted">
                  Import contacts from your connected Google account
                </Txt>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={syncContactsMutation.isPending}
              onClick={() => syncContactsMutation.mutate()}
              className="!rounded-2xl font-bold gap-2"
            >
              {syncContactsMutation.isPending ? (
                <LoadingSpinner size="md" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              {syncContactsMutation.isPending ? "Syncing..." : "Sync Contacts"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
