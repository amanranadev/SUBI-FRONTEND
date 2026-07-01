"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { authService } from "@/lib/auth/service";
import { extractAuthErrorMessage } from "@/features/auth/utils";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/features/auth/schemas";
import { Button } from "@/shared/ui/button";
import { FormPasswordField } from "@/shared/ui/form-password-field";
import { Form } from "@/shared/ui/form";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { SubiLoading, SubiTextLogo, Txt } from "@/shared/ui";

export function ResetPasswordView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      password: "",
      passwordConfirm: "",
    },
  });

  useEffect(() => {
    if (!token) {
      router.replace(AUTH_ROUTES.FORGOT_PASSWORD);
      return;
    }

    const validateToken = async () => {
      setIsValidating(true);
      setSubmitError(null);

      try {
        const response = await authService.validateResetToken(token);
        const isValid = Boolean(response?.valid);
        setIsTokenValid(isValid);
        if (!isValid) {
          setSubmitError(response?.message ?? "Invalid or expired token.");
        }
      } catch (err) {
        setIsTokenValid(false);
        setSubmitError(
          extractAuthErrorMessage(err, "Invalid or expired token."),
        );
      } finally {
        setIsValidating(false);
      }
    };

    void validateToken();
  }, [router, token]);

  const onSubmit = form.handleSubmit(async (values) => {
    if (!token) return;

    setIsLoading(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.resetPassword({
        password: values.password,
        password_confirmation: values.passwordConfirm,
        token,
      });

      setSuccessMessage(
        response?.message ??
        "Password updated successfully. You can log in now.",
      );
      form.reset();
    } catch (err) {
      setSubmitError(
        extractAuthErrorMessage(
          err,
          "Failed to reset password. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  });

  if (isValidating) {
    return <SubiLoading />;
  }

  return (
    <div className="fixed inset-0 flex min-h-dvh w-screen items-center overflow-y-auto bg-card font-body font-normal">
      <div className="w-full h-full flex flex-col p-2">
        <div className="h-10 w-auto">
          <SubiTextLogo className="h-full w-auto" variant="s-only" />
        </div>

        <div className="flex w-full flex-1 justify-center max-w-lg flex-col gap-4 p-4 sm:p-8 mx-auto">
          <Txt as="h1" size="4xl" weight="regular" className="tracking-tight">
            Reset your password
          </Txt>

          {submitError && (
            <Alert variant="danger" className="px-3 py-2">
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="success" className="px-3 py-2">
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {!successMessage && isTokenValid && (
            <>
              <Txt as="p" size="sm" tone="muted">
                Enter your new password and confirm it.
              </Txt>

              <Form {...form}>
                <form
                  className="flex flex-col gap-4"
                  onSubmit={onSubmit}
                  noValidate
                >
                  <FormPasswordField
                    control={form.control}
                    name="password"
                    label="New Password"
                    required
                    autoComplete="new-password"
                  />

                  <FormPasswordField
                    control={form.control}
                    name="passwordConfirm"
                    label="Confirm Password"
                    required
                    autoComplete="new-password"
                  />

                  <Button type="submit" size="lg" disabled={isLoading}>
                    {isLoading ? "Resetting..." : "Reset password"}
                  </Button>
                </form>
              </Form>
            </>
          )}

          <div className="mt-4 text-center">
            <Txt as="p" size="sm" tone="muted">
              <Link
                href={AUTH_ROUTES.LOGIN}
                className="underline transition-all duration-300 hover:text-foreground font-medium cursor-pointer"
              >
                Back to login
              </Link>
            </Txt>
          </div>
        </div>
      </div>
    </div>
  );
}
