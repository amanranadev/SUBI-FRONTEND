"use client";

import { useSettingsOAuthErrorToast } from "@/features/settings/hooks/use-settings-oauth-error-toast";

/** Renders nothing; reads `?error=` from the URL and shows settings OAuth toasts. */
export function SettingsOAuthErrorHandler() {
  useSettingsOAuthErrorToast();
  return null;
}
