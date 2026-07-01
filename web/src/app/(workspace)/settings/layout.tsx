"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SETTINGS_ROUTES } from "@/features/settings/routes";
import { Txt } from "@/shared/ui";
import { ToggleGroup } from "@/shared/ui/toggle-group";
import { PropsWithChildren, Suspense, useEffect, useMemo } from "react";
import { SettingsOAuthErrorHandler } from "@/features/settings/components/settings-oauth-error-handler";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/lib/auth/context";
import { useWorkspaceAccessValidation } from "@/features/workspace/hooks/use-workspace-access-validation";

const SETTINGS_TABS = [
  { value: SETTINGS_ROUTES.PROFILE, label: "Settings" },
  { value: SETTINGS_ROUTES.EMAIL_TEMPLATES, label: "Email templates" },
  { value: SETTINGS_ROUTES.BILLING, label: "Billing" },
  { value: SETTINGS_ROUTES.NOTIFICATIONS, label: "Notifications" },
];

function getActiveTab(pathname: string) {
  if (pathname.startsWith(SETTINGS_ROUTES.NOTIFICATIONS))
    return SETTINGS_ROUTES.NOTIFICATIONS;
  if (pathname.startsWith(SETTINGS_ROUTES.EMAIL_TEMPLATES))
    return SETTINGS_ROUTES.EMAIL_TEMPLATES;
  if (pathname.startsWith(SETTINGS_ROUTES.BILLING))
    return SETTINGS_ROUTES.BILLING;
  return SETTINGS_ROUTES.PROFILE;
}

export default function SettingsLayout({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedTeamId } = useWorkspace();
  const { shouldShowBillingSettings } = useWorkspaceAccessValidation({
    user,
    selectedTeamId,
    queryKey: ["settings", "access-validation"],
    enabled: pathname.startsWith(SETTINGS_ROUTES.ROOT),
  });
  const settingsTabs = useMemo(
    () =>
      SETTINGS_TABS.filter(
        (tab) => tab.value !== SETTINGS_ROUTES.BILLING || shouldShowBillingSettings,
      ),
    [shouldShowBillingSettings],
  );
  const activeTab = getActiveTab(pathname);

  useEffect(() => {
    if (!pathname.startsWith(SETTINGS_ROUTES.BILLING)) return;
    if (shouldShowBillingSettings) return;
    router.replace(SETTINGS_ROUTES.PROFILE);
  }, [pathname, router, shouldShowBillingSettings]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
      <Suspense fallback={null}>
        <SettingsOAuthErrorHandler />
      </Suspense>
      <div className="border-b border-black/[0.03] pb-6 flex items-end justify-between">
        <div className="space-y-1 flex flex-col">
          <Txt size="4xl" weight="bold" transform="none" family="brand">
            Settings
          </Txt>
          <Txt size="lg" weight="medium" tone="muted" className="mt-2">
            Manage your account and workstation configuration
          </Txt>
        </div>
        <ToggleGroup
          items={settingsTabs}
          value={activeTab}
          className="mb-2"
          renderItem={(item, isActive, itemClassName) => (
            <Link
              key={item.value}
              href={item.value}
              className={itemClassName}
            >
              {item.label}
            </Link>
          )}
        />
      </div>
      {children}
    </div>
  );
}
