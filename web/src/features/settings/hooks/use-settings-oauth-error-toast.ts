"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/shared/hooks/use-toast";

/** Query `error` values returned when Google connect fails on the backend. */
export const SETTINGS_OAUTH_ERROR = {
  GOOGLE_ACCOUNT_ALREADY_LINKED: "google_account_already_linked",
  GOOGLE_EMAIL_HAS_SUBI_ACCOUNT: "google_email_has_subi_account",
} as const;

const GOOGLE_LINK_ERRORS = new Set<string>([
  SETTINGS_OAUTH_ERROR.GOOGLE_ACCOUNT_ALREADY_LINKED,
  SETTINGS_OAUTH_ERROR.GOOGLE_EMAIL_HAS_SUBI_ACCOUNT,
]);

function getGoogleLinkErrorToast(error: string) {
  if (!GOOGLE_LINK_ERRORS.has(error)) {
    return null;
  }

  return {
    title: "Google account already linked",
    description:
      "This Google account is already linked to another Subi account. Use a different Google account or sign in with the Subi account that owns it.",
  };
}

/**
 * Shows a toast when the backend redirects to settings with a Google connect error,
 * then removes `error` from the URL so refresh does not repeat the toast.
 */
export function useSettingsOAuthErrorToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const handledErrorRef = useRef<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error")?.trim();
    if (!error || handledErrorRef.current === error) {
      return;
    }

    const message = getGoogleLinkErrorToast(error);
    if (!message) {
      return;
    }

    handledErrorRef.current = error;
    toast({
      title: message.title,
      description: message.description,
      variant: "destructive",
    });

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("error");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, toast]);
}
