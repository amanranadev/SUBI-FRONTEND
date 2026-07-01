"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { redirectAuthenticatedTarget } from "@/features/auth/utils";

export function useRedirectIfAuthenticated(
  isAuthenticated: boolean,
  returnTo?: string | null,
) {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectAuthenticatedTarget(returnTo));
    }
  }, [isAuthenticated, returnTo, router]);
}
