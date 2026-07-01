"use client";

import { useCallback, useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AtSign, Bell, Mail, PhoneCall, type LucideIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  bulkUpdateNotificationPreferences,
  initializeNotificationPreferencesDefaults,
  listNotificationPreferences,
  NOTIFICATION_FREQUENCY,
} from "@/features/settings/api/profile-notification-preferences-service";
import { invalidateProfileCompletionQueries } from "@/features/settings/hooks/use-profile-completion";
import { useToast } from "@/shared/hooks/use-toast";
import { Card, Form, Switch, Txt } from "@/shared/ui";

const NOTIFICATION_PREFERENCES_QUERY_KEY = [
  "settings",
  "notification-preferences",
] as const;

const notificationPreferenceSchema = z.object({
  id: z.string().min(1),
  notificationType: z.string().min(1),
  emailEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  inAppEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  frequency: z.enum([
    NOTIFICATION_FREQUENCY.REAL_TIME,
    NOTIFICATION_FREQUENCY.DAILY_DIGEST,
    NOTIFICATION_FREQUENCY.WEEKLY_DIGEST,
  ]),
});

const notificationPreferencesFormSchema = z.object({
  emailNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(false),
  smsAlerts: z.boolean().default(false),
  mentionAlerts: z.boolean().default(false),
});

type NotificationPreferencesFormValues = z.infer<
  typeof notificationPreferencesFormSchema
>;

type NotificationPreferenceItem = z.infer<typeof notificationPreferenceSchema>;

type CommunicationOption = {
  key: keyof NotificationPreferencesFormValues;
  title: string;
  description: string;
  icon: LucideIcon;
  methodKey: "emailEnabled" | "smsEnabled" | "inAppEnabled" | "pushEnabled";
};

const communicationOptions: CommunicationOption[] = [
  {
    key: "emailNotifications",
    title: "Email Notifications",
    description: "Receive daily summaries and critical date alerts via email.",
    icon: Mail,
    methodKey: "emailEnabled",
  },
  {
    key: "pushNotifications",
    title: "Push Notifications",
    description: "Real-time updates on your mobile workstation.",
    icon: Bell,
    methodKey: "pushEnabled",
  },
  {
    key: "smsAlerts",
    title: "SMS Alerts",
    description: "Urgent status changes sent directly to your phone.",
    icon: PhoneCall,
    methodKey: "smsEnabled",
  },
  {
    key: "mentionAlerts",
    title: "Mention Alerts",
    description: "Get notified when a TC or Broker mentions you in a file.",
    icon: AtSign,
    methodKey: "inAppEnabled",
  },
];

type SettingsNotificationPreferencesCardProps = {
  onSaved?: () => void;
};

export function SettingsNotificationPreferencesCard({
  onSaved,
}: SettingsNotificationPreferencesCardProps = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const hasInitializedDefaultsRef = useRef(false);
  const preferencesRef = useRef<NotificationPreferenceItem[]>([]);

  const preferencesQuery = useQuery({
    queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY,
    queryFn: listNotificationPreferences,
    staleTime: 20_000,
  });

  const form = useForm<NotificationPreferencesFormValues>({
    resolver: zodResolver(notificationPreferencesFormSchema),
    defaultValues: {
      emailNotifications: false,
      pushNotifications: false,
      smsAlerts: false,
      mentionAlerts: false,
    },
  });

  const initializeDefaultsMutation = useMutation({
    mutationFn: initializeNotificationPreferencesDefaults,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY,
      });
      await invalidateProfileCompletionQueries(queryClient);
      onSaved?.();
    },
    onError: (error) => {
      toast({
        title: "Could not load notification preferences",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: bulkUpdateNotificationPreferences,
    onSuccess: async () => {
      toast({
        title: "Preferences updated",
        description: "Your notification settings were saved.",
      });
      await queryClient.invalidateQueries({
        queryKey: NOTIFICATION_PREFERENCES_QUERY_KEY,
      });
      await invalidateProfileCompletionQueries(queryClient);
      onSaved?.();
    },
    onError: (error) => {
      toast({
        title: "Could not update preferences",
        description:
          error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    const preferences = preferencesQuery.data ?? [];
    preferencesRef.current = preferences.map((preference) => ({
      id: preference.id,
      notificationType: preference.notificationType,
      emailEnabled: preference.emailEnabled,
      smsEnabled: preference.smsEnabled,
      inAppEnabled: preference.inAppEnabled,
      pushEnabled: preference.pushEnabled,
      frequency: preference.frequency,
    }));

    form.reset({
      emailNotifications: preferences.some(
        (preference) => preference.emailEnabled,
      ),
      pushNotifications: preferences.some(
        (preference) => preference.pushEnabled,
      ),
      smsAlerts: preferences.some((preference) => preference.smsEnabled),
      mentionAlerts: preferences.some((preference) => preference.inAppEnabled),
    });
  }, [form, preferencesQuery.data]);

  useEffect(() => {
    if (preferencesQuery.isLoading) return;
    if (preferencesQuery.isError) return;
    if ((preferencesQuery.data ?? []).length > 0) return;
    if (hasInitializedDefaultsRef.current) return;

    hasInitializedDefaultsRef.current = true;
    initializeDefaultsMutation.mutate();
  }, [
    initializeDefaultsMutation,
    preferencesQuery.data,
    preferencesQuery.isError,
    preferencesQuery.isLoading,
  ]);

  const persistPreferences = useCallback(
    async (preferences: NotificationPreferenceItem[]) => {
      await bulkUpdateMutation.mutateAsync({
        preferences: preferences.map((preference) => ({
          notificationType: preference.notificationType,
          emailEnabled: preference.emailEnabled,
          smsEnabled: preference.smsEnabled,
          inAppEnabled: preference.inAppEnabled,
          pushEnabled: preference.pushEnabled,
          frequency: preference.frequency,
        })),
      });
    },
    [bulkUpdateMutation],
  );

  const handleMethodToggle = useCallback(
    (
      formField: keyof NotificationPreferencesFormValues,
      methodKey: CommunicationOption["methodKey"],
      checked: boolean,
    ) => {
      const currentPreferences = preferencesRef.current;
      if (currentPreferences.length === 0) return;

      const updatedPreferences = currentPreferences.map((preference) => ({
        ...preference,
        [methodKey]: checked,
      }));

      preferencesRef.current = updatedPreferences;
      form.setValue(formField, checked, {
        shouldDirty: false,
        shouldTouch: true,
      });
      void persistPreferences(updatedPreferences);
    },
    [form, persistPreferences],
  );

  const isLoading =
    preferencesQuery.isLoading ||
    (initializeDefaultsMutation.isPending &&
      (preferencesQuery.data ?? []).length === 0);

  return (
    <Card className="rounded-[2.25rem] border border-black/5 bg-white p-6 md:p-8 heavy-shadow">
      <div className="space-y-1">
        <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
          Communication Preferences
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          Choose how SUBI keeps you informed about your transactions.
        </Txt>
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-[1.5rem] border border-black/10 bg-black/[0.02] p-4">
          <Txt as="p" size="sm" tone="muted">
            Loading notification preferences...
          </Txt>
        </div>
      ) : preferencesQuery.isError ? (
        <div className="mt-5 rounded-[1.5rem] border border-rose-200 bg-rose-50 p-4">
          <Txt as="p" size="sm" className="text-rose-700">
            We could not load your notification preferences.
          </Txt>
        </div>
      ) : preferencesRef.current.length === 0 ? (
        <div className="mt-5 rounded-[1.5rem] border border-black/10 bg-black/[0.02] p-4">
          <Txt as="p" size="sm" tone="muted">
            No notification preferences available yet.
          </Txt>
        </div>
      ) : (
        <Form {...form}>
          <div className="mt-5 space-y-4">
            {communicationOptions.map((option) => {
              const Icon = option.icon;
              const checked = form.watch(option.key);

              return (
                <div
                  key={option.key}
                  className="flex items-center justify-between gap-4 rounded-[1.5rem] border border-black/5 bg-background px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-xl border border-black/10 bg-white">
                      <Icon
                        className="size-5 text-muted-foreground"
                        strokeWidth={2.1}
                      />
                    </div>
                    <div>
                      <Txt
                        as="h3"
                        size="lg"
                        weight="bold"
                        className="tracking-tight"
                      >
                        {option.title}
                      </Txt>
                      <Txt as="p" size="sm" className="text-muted-foreground">
                        {option.description}
                      </Txt>
                    </div>
                  </div>

                  <Switch
                    checked={checked}
                    onCheckedChange={(isChecked) => {
                      handleMethodToggle(
                        option.key,
                        option.methodKey,
                        isChecked,
                      );
                    }}
                    disabled={bulkUpdateMutation.isPending}
                    variant="soft"
                  />
                </div>
              );
            })}
          </div>
        </Form>
      )}
    </Card>
  );
}
