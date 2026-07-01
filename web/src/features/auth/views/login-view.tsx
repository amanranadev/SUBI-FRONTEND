"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/lib/auth/context";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { AuthLegalNotice } from "@/features/auth/components/auth-legal-notice";
import { GoogleAuthButton } from "@/features/auth/components/google-auth-button";
import { useRedirectIfAuthenticated } from "@/features/auth/hooks";
import { extractAuthErrorMessage } from "@/features/auth/utils";
import { loginSchema, type LoginValues } from "@/features/auth/schemas";
import { Button } from "@/shared/ui/button";
import { FormInputField } from "@/shared/ui/form-input-field";
import { FormPasswordField } from "@/shared/ui/form-password-field";
import { Form } from "@/shared/ui/form";
import { Alert, AlertDescription } from "@/shared/ui/alert";

import { SubiTextLogo, Txt } from "@/shared/ui";
import { AUTH_SESSION_STATUS } from "@/lib/auth/constants";

export function LoginView() {
  const searchParams = useSearchParams();
  const { login, isLoading, isSessionExpired, isAuthenticated } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const reason = searchParams.get("reason");
  const returnTo = searchParams.get("returnTo");
  const error = searchParams.get("error");
  const showSessionExpiredNotice =
    (reason === AUTH_SESSION_STATUS.EXPIRED || isSessionExpired) &&
    !error &&
    !submitError;

  useRedirectIfAuthenticated(isAuthenticated, returnTo);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitError(null);
      await login({ ...values, returnTo });
    } catch (err) {
      const message = extractAuthErrorMessage(
        err,
        "Authentication failed. Please try again.",
      );
      setSubmitError(message);
    }
  });

  const isSubmitting = form.formState.isSubmitting;
  const isBusy = isLoading || isSubmitting;

  return (
    <div className="fixed inset-0 flex min-h-dvh w-screen items-center overflow-y-auto bg-card font-body font-normal">
      <div className="w-full h-full flex flex-col  p-2">
        <div className="h-10 w-auto ">
          <SubiTextLogo className="h-full w-auto" variant="s-only" />
        </div>

        <div className="flex w-full flex-1 justify-center max-w-xl flex-col gap-4 p-4 sm:p-8 mx-auto">
          <div className="flex w-16 h-16 p-10 items-center justify-center rounded-full bg-secondary text-4xl transition-all duration-300 hover:scale-110 shadow-xl cursor-pointer">
            <span
              className="animate-wave"
              style={{
                fontFamily:
                  '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif',
              }}
              aria-hidden
            >
              👋
            </span>
          </div>

          <Txt
            as="h1"
            size="4xl"
            weight="bold"
            className="flex  items-center gap-2 duration-300 animate-in fade-in-0"
          >
            Welcome back to <SubiTextLogo />
          </Txt>

          {showSessionExpiredNotice && (
            <Alert variant="danger" className="px-3 py-2">
              <AlertDescription>
                Your session expired. Please sign in again.
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="danger" className="px-3 py-2">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {submitError && (
            <Alert variant="danger" className="px-3 py-2">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              className="flex flex-col gap-4"
              onSubmit={onSubmit}
              noValidate
            >
              <FormInputField
                control={form.control}
                name="email"
                label="Email address"
                required
                type="email"
                placeholder="name@email.com"
                autoComplete="email"
              />

              <FormPasswordField
                control={form.control}
                name="password"
                label="Password"
                required
                autoComplete="current-password"
              />

              <Button type="submit" disabled={isBusy} size="lg">
                {isBusy ? "Log in..." : "Log in"}
              </Button>
            </form>
          </Form>

          <GoogleAuthButton returnTo={returnTo} disabled={isBusy} />

          <div className="mt-10 flex flex-col gap-2 text-center">
            <Txt as="p" size="sm" tone="muted">
              New to{" "}
              <Txt as="span" weight="medium" className="text-primary">
                SUBI
              </Txt>
              ?{" "}
              <Link
                href={
                  returnTo
                    ? `${AUTH_ROUTES.SIGNUP}?returnTo=${encodeURIComponent(returnTo)}`
                    : AUTH_ROUTES.SIGNUP
                }
                className="underline transition-all duration-300 hover:text-foreground font-medium"
              >
                Create an account
              </Link>
            </Txt>
            <Txt as="p" size="sm" tone="muted">
              Forgot your password?{" "}
              <Link
                href={AUTH_ROUTES.FORGOT_PASSWORD}
                className="underline transition-all duration-300 hover:text-foreground font-medium"
              >
                Reset it
              </Link>
            </Txt>
          </div>

          <AuthLegalNotice variant="login" />
        </div>
      </div>
    </div>
  );
}
