"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  signupPasswordConfirmSchema,
  signupPasswordSchema,
  withMatchingPasswords,
} from "@/features/auth/password-schema"
import { changeUserPassword } from "@/features/settings/api/profile-security-service"
import { useAuth } from "@/lib/auth/context"
import { useToast } from "@/shared/hooks/use-toast"
import { Button, Card, Form, FormPasswordField, Txt } from "@/shared/ui"

function createPasswordChangeSchema(requiresCurrentPassword: boolean) {
  return withMatchingPasswords(
    z
      .object({
        currentPassword: z.string().optional(),
        newPassword: signupPasswordSchema,
        confirmPassword: signupPasswordConfirmSchema,
      })
      .superRefine((values, context) => {
        if (requiresCurrentPassword && !values.currentPassword) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Current password is required.",
            path: ["currentPassword"],
          })
        }

        if (
          requiresCurrentPassword &&
          values.currentPassword &&
          values.currentPassword === values.newPassword
        ) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: "New password must be different from current password.",
            path: ["newPassword"],
          })
        }
      }),
    { passwordKey: "newPassword", confirmKey: "confirmPassword", message: "Passwords do not match." }
  )
}

type PasswordChangeValues = z.infer<ReturnType<typeof createPasswordChangeSchema>>

function getPasswordChangeErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data &&
    "error" in error.response.data &&
    typeof error.response.data.error === "string"
  ) {
    return error.response.data.error
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return "Could not update password right now. Please try again."
}

export function ProfileSettingsPasswordCard() {
  const { user } = useAuth()
  const { toast } = useToast()
  const requiresCurrentPassword = user?.hasPassword ?? true

  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(createPasswordChangeSchema(requiresCurrentPassword)),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onSubmit",
  })

  const changePasswordMutation = useMutation({
    mutationFn: (values: PasswordChangeValues) =>
      changeUserPassword({
        currentPassword: requiresCurrentPassword ? values.currentPassword : undefined,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }),
    onSuccess: (message) => {
      form.reset()
      toast({
        title: "Password updated",
        description: message,
      })
    },
    onError: (error) => {
      toast({
        title: "Could not update password",
        description: getPasswordChangeErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    await changePasswordMutation.mutateAsync(values)
  })

  return (
    <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-8">
      <div className="space-y-1">
        <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
          Password
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          {requiresCurrentPassword
            ? "Change the password used to sign in to your account."
            : "Create a password to sign in directly with email and password."}
        </Txt>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          {requiresCurrentPassword ? (
            <FormPasswordField
              control={form.control}
              name="currentPassword"
              label="Current password"
              required
              autoComplete="current-password"
            />
          ) : null}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <FormPasswordField
              control={form.control}
              name="newPassword"
              label="New password"
              required
              autoComplete="new-password"
            />
            <FormPasswordField
              control={form.control}
              name="confirmPassword"
              label="Confirm new password"
              required
              autoComplete="new-password"
            />
          </div>

          <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
            <Txt as="p" size="xs" tone="muted">
              Use at least 8 characters.
            </Txt>
          </div>

          <div className="flex justify-end border-t border-black/5 pt-6">
            <Button type="submit" disabled={changePasswordMutation.isPending}>
              {changePasswordMutation.isPending ? "Updating..." : "Save new password"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  )
}
