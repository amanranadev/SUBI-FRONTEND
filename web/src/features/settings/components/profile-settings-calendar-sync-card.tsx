"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  CalendarCheck2,
  Link2Off,
  RefreshCw,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { GOOGLE_CALENDAR_EVENTS_QUERY_KEY } from "@/features/calendar/api/google-calendar-events-service";
import { GOOGLE_CALENDAR_CONNECTION_STATUS_QUERY_KEY } from "@/features/calendar/hooks/use-is-google-calendar-connected";
import {
  CALENDAR_SYNC_PROVIDER,
  listAppleCalendarAccountsForSync,
  listGoogleCalendarAccounts,
  listMicrosoftCalendarAccounts,
  removeCalendarSync,
  selectCalendarForSync,
  type ProviderCalendarAccount,
} from "@/features/settings/api/profile-calendar-sync-service";
import { invalidateProfileCompletionQueries } from "@/features/settings/hooks/use-profile-completion";
import { authStorage } from "@/lib/auth/storage";
import { env } from "@/lib/env";
import { useToast } from "@/shared/hooks/use-toast";
import { Button, Card, Form, FormSelectField, Txt } from "@/shared/ui";

type ProfileSettingsCalendarSyncCardProps = {
  userId: string | null;
  /** Called after sync calendar is saved successfully (e.g. complete-profile step collapse). */
  onSaved?: () => void;
};

const GOOGLE_CALENDARS_QUERY_KEY = ["settings", "google-calendars"] as const;
const MICROSOFT_CALENDARS_QUERY_KEY = [
  "settings",
  "microsoft-calendars",
] as const;
const APPLE_CALENDARS_QUERY_KEY = ["settings", "apple-calendars"] as const;

const selectCalendarSchema = z.object({
  calendarId: z.string().min(1, "Select a calendar."),
  calendarName: z.string().min(1, "Calendar name is required."),
});

type SelectCalendarValues = z.infer<typeof selectCalendarSchema>;

function providerLabel(provider: ProviderCalendarAccount["provider"]) {
  if (provider === CALENDAR_SYNC_PROVIDER.GOOGLE) return "Google";
  if (provider === CALENDAR_SYNC_PROVIDER.MICROSOFT) return "Microsoft";
  return "Apple";
}

function SyncedCalendarSummary({
  accounts,
  //isRemoving,
  // onRemoveSync,
}: {
  accounts: ProviderCalendarAccount[];
  isRemoving: boolean;
  onRemoveSync: (account: ProviderCalendarAccount) => void;
}) {
  const syncedAccounts = accounts.filter(
    (account) => account.selectedCalendarId && account.selectedCalendarName,
  );

  return (
    <div className="space-y-3">
      <Txt as="p" size="sm" weight="bold">
        Synced calendars
      </Txt>
      {syncedAccounts.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <Txt as="p" size="sm" tone="muted">
            No calendar is synced yet.
          </Txt>
        </div>
      ) : (
        syncedAccounts.map((account) => (
          <div
            key={`synced-${account.provider}-${account.accountId}`}
            className="rounded-2xl border border-emerald-500/30 bg-emerald-50/70 p-4 flex items-center justify-between gap-3"
          >
            <div>
              <Txt as="p" size="sm" weight="bold">
                {providerLabel(account.provider)} - {account.displayName}
              </Txt>
              <Txt as="p" size="sm" className="text-emerald-800">
                Synced with: {account.selectedCalendarName}
              </Txt>
            </div>
            {/* TODO: Uncomment this when we have a way to remove sync 
            <Button
              type="button"
              variant="ghost-destructive"
              size="sm"
              disabled={isRemoving}
              onClick={() => onRemoveSync(account)}
            >
              <Link2Off className="size-4" />
              Remove sync
            </Button>
            */}
          </div>
        ))
      )}
    </div>
  );
}

function CalendarSyncAccountItem({
  account,
  isSaving,
  onSave,
  onConsentReconnect,
}: {
  account: ProviderCalendarAccount;
  isSaving: boolean;
  onSave: (input: {
    provider: ProviderCalendarAccount["provider"];
    accountId: string;
    calendarId: string;
    calendarName: string;
  }) => Promise<void>;
  onConsentReconnect: (
    provider: ProviderCalendarAccount["provider"],
    loginHint?: string,
  ) => void;
}) {
  const form = useForm<SelectCalendarValues>({
    resolver: zodResolver(selectCalendarSchema),
    defaultValues: {
      calendarId: account.selectedCalendarId ?? "",
      calendarName: account.selectedCalendarName ?? "",
    },
  });

  const options = account.calendars.map((calendar) => ({
    value: calendar.id,
    label: calendar.name,
  }));

  const onSubmit = form.handleSubmit(async (values) => {
    await onSave({
      provider: account.provider,
      accountId: account.accountId,
      calendarId: values.calendarId,
      calendarName: values.calendarName,
    });
  });

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-4 space-y-4">
      <div className="space-y-1">
        <Txt as="p" size="sm" weight="bold">
          {providerLabel(account.provider)}
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          {account.displayName}
        </Txt>
        {account.identifier ? (
          <Txt as="p" size="xs" tone="muted" className="opacity-80">
            {account.identifier}
          </Txt>
        ) : null}
      </div>

      {account.needsConsent ? (
        <div className="rounded-xl border border-amber-400/40 bg-amber-100/40 p-3 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 mt-0.5 text-amber-700" />
            <Txt as="p" size="xs" className="text-amber-900">
              This account needs permission refresh before syncing calendars.
            </Txt>
          </div>
          {account.provider === CALENDAR_SYNC_PROVIDER.APPLE ? (
            <Txt as="p" size="xs" className="text-amber-900">
              For Apple, reconnect in Connected accounts.
            </Txt>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                onConsentReconnect(
                  account.provider,
                  account.identifier || undefined,
                )
              }
            >
              <RefreshCw className="size-4" />
              Refresh permissions
            </Button>
          )}
        </div>
      ) : null}

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          <FormSelectField
            control={form.control}
            name="calendarId"
            label="Sync calendar"
            placeholder={
              options.length ? "Select a calendar" : "No calendars available"
            }
            options={options}
            onValueChange={(value) => {
              const selected = options.find((option) => option.value === value);
              form.setValue("calendarName", selected?.label ?? "", {
                shouldValidate: true,
              });
            }}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={
                isSaving || account.needsConsent || options.length === 0
              }
            >
              <CalendarCheck2 className="size-4" />
              Save sync calendar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export function ProfileSettingsCalendarSyncCard({
  userId,
  onSaved,
}: ProfileSettingsCalendarSyncCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const googleQuery = useQuery({
    queryKey: [...GOOGLE_CALENDARS_QUERY_KEY, userId],
    queryFn: listGoogleCalendarAccounts,
    enabled: Boolean(userId),
    staleTime: 20_000,
  });

  const microsoftQuery = useQuery({
    queryKey: [...MICROSOFT_CALENDARS_QUERY_KEY, userId],
    queryFn: listMicrosoftCalendarAccounts,
    enabled: Boolean(userId),
    staleTime: 20_000,
  });

  const appleQuery = useQuery({
    queryKey: [...APPLE_CALENDARS_QUERY_KEY, userId],
    queryFn: listAppleCalendarAccountsForSync,
    enabled: Boolean(userId),
    staleTime: 20_000,
  });

  const saveSelectionMutation = useMutation({
    mutationFn: (input: {
      provider: ProviderCalendarAccount["provider"];
      accountId: string;
      calendarId: string;
      calendarName: string;
    }) =>
      selectCalendarForSync({
        provider: input.provider,
        accountId: input.accountId,
        calendarId: input.calendarId,
        calendarName: input.calendarName,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...GOOGLE_CALENDARS_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [GOOGLE_CALENDAR_CONNECTION_STATUS_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [...MICROSOFT_CALENDARS_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [...APPLE_CALENDARS_QUERY_KEY, userId],
        }),
        invalidateProfileCompletionQueries(queryClient),
      ]);
      toast({
        title: "Calendar sync updated",
        description: "Your selected sync calendar was saved.",
      });
      onSaved?.();
    },
    onError: (error) => {
      toast({
        title: "Could not save calendar sync",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeSyncMutation = useMutation({
    mutationFn: (account: ProviderCalendarAccount) =>
      removeCalendarSync({
        provider: account.provider,
        accountId: account.accountId,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...GOOGLE_CALENDARS_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [GOOGLE_CALENDAR_EVENTS_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [GOOGLE_CALENDAR_CONNECTION_STATUS_QUERY_KEY],
        }),
        queryClient.invalidateQueries({
          queryKey: [...MICROSOFT_CALENDARS_QUERY_KEY, userId],
        }),
        queryClient.invalidateQueries({
          queryKey: [...APPLE_CALENDARS_QUERY_KEY, userId],
        }),
        invalidateProfileCompletionQueries(queryClient),
      ]);
      toast({
        title: "Sync removed",
        description: "Calendar sync was removed for this account.",
      });
    },
    onError: () => {
      toast({
        title: "Could not remove sync",
        description:
          "This backend still requires a selected calendar when saving sync. " +
          "We need to allow empty calendar values to remove sync without disconnecting the account.",
        variant: "destructive",
      });
    },
  });

  const handleConsentReconnect = (
    provider: ProviderCalendarAccount["provider"],
    loginHint?: string,
  ) => {
    const token = authStorage.getToken();
    if (!token) {
      toast({
        title: "Session unavailable",
        description:
          "Please sign in again before reconnecting calendar permissions.",
        variant: "destructive",
      });
      return;
    }

    if (provider === CALENDAR_SYNC_PROVIDER.APPLE) {
      toast({
        title: "Apple reconnect",
        description: "Reconnect Apple in Connected accounts.",
      });
      return;
    }

    const providerPath =
      provider === CALENDAR_SYNC_PROVIDER.GOOGLE
        ? "google_oauth2"
        : "microsoft_graph";

    const params = new URLSearchParams({
      connect: "true",
      prompt: "consent",
      state: token,
    });

    if (loginHint) {
      params.set("login_hint", loginHint);
    }

    window.location.href = `${env.NEXT_PUBLIC_API_BASE_URL}/api/auth/${providerPath}?${params.toString()}`;
  };

  const accounts = [
    ...(googleQuery.data ?? []),
    ...(microsoftQuery.data ?? []),
    ...(appleQuery.data ?? []),
  ];

  const isLoading =
    googleQuery.isLoading || microsoftQuery.isLoading || appleQuery.isLoading;

  return (
    <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-8">
      <div className="space-y-1">
        <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
          Calendar syncing
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          Choose which calendar receives your synced tasks and events per
          connected account.
        </Txt>
      </div>

      {isLoading ? (
        <Txt as="p" size="sm" tone="muted">
          Loading calendar accounts...
        </Txt>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <Txt as="p" size="sm" tone="muted">
            No connected calendar accounts found. Connect one first in Connected
            accounts.
          </Txt>
        </div>
      ) : (
        <div className="space-y-6">
          <SyncedCalendarSummary
            accounts={accounts}
            isRemoving={removeSyncMutation.isPending}
            onRemoveSync={(account) => removeSyncMutation.mutate(account)}
          />
          <div className="space-y-4">
            {accounts.map((account) => (
              <CalendarSyncAccountItem
                key={`${account.provider}-${account.accountId}`}
                account={account}
                isSaving={saveSelectionMutation.isPending}
                onSave={async (input) =>
                  saveSelectionMutation.mutateAsync(input)
                }
                onConsentReconnect={handleConsentReconnect}
              />
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
