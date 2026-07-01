"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { SubiLoading } from "@/shared/ui";
import { Alert, AlertDescription } from "@/shared/ui/alert";

export function OAuthCallbackView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeOAuthLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const returnTo = searchParams.get("returnTo");

    if (error) {
      router.replace(`${AUTH_ROUTES.LOGIN}?error=${encodeURIComponent(error)}`);
      return;
    }

    if (!token) {
      router.replace(`${AUTH_ROUTES.LOGIN}?error=missing_token`);
      return;
    }

    completeOAuthLogin(token, returnTo).catch(() => {
      setErrorMessage("Authentication failed. Please try again.");
    });
  }, [completeOAuthLogin, router, searchParams]);

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-card">
      {errorMessage ? (
        <Alert variant="danger" className="px-4 py-3">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2 text-center">
          <SubiLoading />
        </div>
      )}
    </div>
  );
}
