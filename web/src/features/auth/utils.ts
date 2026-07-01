"use client";

import { authStorage } from "@/lib/auth/storage";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { env } from "@/lib/env";
import { addBreadcrumb } from "@/lib/sentry";

type AuthApiError = {
  response?: {
    data?: unknown;
  };
  message?: string;
};

type ErrorBag = {
  error?: unknown;
  message?: unknown;
  errors?: unknown;
};

function firstErrorFromErrors(errors: unknown): string | null {
  if (Array.isArray(errors)) {
    for (const item of errors) {
      if (typeof item === "string" && item.trim()) return item;
      if (item && typeof item === "object") {
        const nested = firstErrorFromErrors(Object.values(item));
        if (nested) return nested;
      }
    }
    return null;
  }

  if (errors && typeof errors === "object") {
    for (const value of Object.values(errors)) {
      const nested = firstErrorFromErrors(value);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof errors === "string" && errors.trim()) return errors;
  return null;
}

function extractFromResponseData(data: unknown): string | null {
  if (!data) return null;

  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as unknown;
      return extractFromResponseData(parsed) ?? data;
    } catch {
      return data;
    }
  }

  if (typeof data !== "object") return null;

  const bag = data as ErrorBag;
  if (typeof bag.error === "string" && bag.error.trim()) return bag.error;
  if (typeof bag.message === "string" && bag.message.trim()) return bag.message;

  const nested = firstErrorFromErrors(bag.errors);
  if (nested) return nested;

  return null;
}

function isZodError(error: unknown): boolean {
  return (
    error instanceof Error &&
    error.name === "ZodError" &&
    "issues" in error
  );
}

export function extractAuthErrorMessage(error: unknown, fallback: string) {
  if (isZodError(error)) return fallback;

  const authError = error as AuthApiError;
  const fromResponse = extractFromResponseData(authError?.response?.data);
  if (fromResponse) return fromResponse;

  if (authError?.message && !authError.message.includes("status code")) {
    return authError.message;
  }

  return fallback;
}

export function startGoogleAuthFlow(
  returnTo?: string | null,
  clearSession = true,
) {
  if (clearSession) {
    authStorage.clear();
  }

  const query = returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : "";
  addBreadcrumb("oauth", "Google OAuth flow initiated", {
    hasReturnTo: Boolean(returnTo),
  });
  window.location.href = `${env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google_oauth2${query}`;
}

export function redirectAuthenticatedTarget(returnTo?: string | null) {
  if (returnTo && returnTo.startsWith("/")) {
    return returnTo;
  }

  return AUTH_ROUTES.HOME;
}
