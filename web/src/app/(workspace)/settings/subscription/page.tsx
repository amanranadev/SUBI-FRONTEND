"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SETTINGS_ROUTES } from "@/features/settings/routes";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/lib/auth/context";
import { useWorkspaceAccessValidation } from "@/features/workspace/hooks/use-workspace-access-validation";

export default function SettingsSubscriptionRedirectPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { selectedTeamId } = useWorkspace();
  const { shouldShowBillingSettings } = useWorkspaceAccessValidation({
    user,
    selectedTeamId,
    queryKey: ["settings", "subscription-redirect"],
  });

  useEffect(() => {
    router.replace(
      shouldShowBillingSettings ? SETTINGS_ROUTES.BILLING : SETTINGS_ROUTES.PROFILE,
    );
  }, [router, shouldShowBillingSettings]);

  return null;
}
