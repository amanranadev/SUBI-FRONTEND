"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AUTH_ROUTES } from "@/lib/auth/routes";
import { authService } from "@/lib/auth/service";
import { extractAuthErrorMessage } from "@/features/auth/utils";
import {
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/features/auth/schemas";
import { Button } from "@/shared/ui/button";
import { FormInputField } from "@/shared/ui/form-input-field";
import { Form } from "@/shared/ui/form";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { SubiTextLogo, Txt } from "@/shared/ui";
import { CheckCircle2 } from "lucide-react";

export function ForgotPasswordView() {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsLoading(true);
    setSubmitError(null);
    setSuccessMessage(null);

    try {
      const response = await authService.requestPasswordReset({
        email: values.email,
      });

      setSuccessMessage(
        response?.message ??
        "Password reset instructions sent. Please check your email.",
      );
    } catch (err) {
      setSubmitError(
        extractAuthErrorMessage(
          err,
          "Failed to send password reset instructions. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  });

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

          <Txt as="p" size="sm" tone="muted">
            Enter your email and we will send instructions to reset your
            password.
          </Txt>

          {successMessage && (
            <Alert variant="success">
              <CheckCircle2 className="size-4" />
              <AlertDescription>{successMessage}</AlertDescription>
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

              <Button type="submit" size="lg" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send reset instructions"}
              </Button>
            </form>
          </Form>

          <div className="mt-4 text-center">
            <Txt as="p" size="sm" tone="muted">
              Remember your password?{" "}
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
