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
import { signupSchema, type SignupValues } from "@/features/auth/schemas";
import { Button } from "@/shared/ui/button";
import { FormCheckboxField } from "@/shared/ui/form-checkbox-field";
import { FormInputField } from "@/shared/ui/form-input-field";
import { FormPasswordField } from "@/shared/ui/form-password-field";
import { Form } from "@/shared/ui/form";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { SubiTextLogo, Txt } from "@/shared/ui";

export function SignupView() {
  const searchParams = useSearchParams();
  const { signup, isLoading, isAuthenticated } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const returnTo = searchParams.get("returnTo");

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
      agreeToTerms: false,
      agreeToAiDisclaimer: false,
    },
  });

  useRedirectIfAuthenticated(isAuthenticated, returnTo);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setSubmitError(null);
      await signup({
        email: values.email,
        password: values.password,
        returnTo,
      });
    } catch (err) {
      const message = extractAuthErrorMessage(
        err,
        "Registration failed. Please try again.",
      );
      setSubmitError(message);
    }
  });

  return (
    <div className="fixed inset-0 flex min-h-dvh w-screen items-center overflow-y-auto bg-card font-body font-normal">
      <div className="w-full h-full flex flex-col p-2">
        <div className="h-10 w-auto">
          <SubiTextLogo className="h-full w-auto" variant="s-only" />
        </div>

        <div className="flex w-full flex-1 justify-center max-w-lg flex-col gap-4 p-4 sm:p-8 mx-auto">
        <Txt
          as="h1"
          size="4xl"
          weight="regular"
          className="my-2 tracking-tight text-foreground"
        >
          Smarter transactions, <br />
          less busywork
        </Txt>

        {submitError ? (
          <Alert variant="danger" className="px-3 py-2">
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        ) : null}

        <GoogleAuthButton returnTo={returnTo} disabled={isLoading} />

        <Form {...form}>
          <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
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
              autoComplete="new-password"
            />

            <FormPasswordField
              control={form.control}
              name="passwordConfirm"
              label="Confirm Password"
              required
              autoComplete="new-password"
            />

            <div className="flex flex-col gap-3 rounded-lg border border-input bg-muted/40 p-3">
              <FormCheckboxField
                control={form.control}
                name="agreeToTerms"
                label={
                  <>
                    I agree to the{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline transition-all duration-300 hover:text-foreground font-medium"
                    >
                      Terms of Use
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline transition-all duration-300 hover:text-foreground font-medium"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </>
                }
              />

              <FormCheckboxField
                control={form.control}
                name="agreeToAiDisclaimer"
                label="I understand AI-assisted output must be reviewed before use."
              />
            </div>

            <Button type="submit" size="lg" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Continue with email"}
            </Button>
          </form>
        </Form>

        <div className="mt-8 flex flex-col gap-2 text-center">
          <Txt as="p" size="sm" tone="muted">
            Already have an account?{" "}
            <Link
              href={
                returnTo
                  ? `${AUTH_ROUTES.LOGIN}?returnTo=${encodeURIComponent(returnTo)}`
                  : AUTH_ROUTES.LOGIN
              }
              className="underline transition-all duration-300 hover:text-foreground font-medium"
            >
              Sign in
            </Link>
          </Txt>
        </div>

        <AuthLegalNotice variant="signup" />
        </div>
      </div>
    </div>
  );
}
