import { z } from "zod"

export const signupPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")

export const signupPasswordConfirmSchema = z
  .string()
  .min(1, "Please confirm your password")
  .min(8, "Password must be at least 8 characters")

type MatchPasswordsOptions = {
  passwordKey: string
  confirmKey: string
  message?: string
}

export function withMatchingPasswords<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
  options: MatchPasswordsOptions
) {
  const { passwordKey, confirmKey, message = "Passwords do not match" } = options

  return schema.refine((values) => {
    const payload = values as Record<string, unknown>
    return payload[passwordKey] === payload[confirmKey]
  }, {
    path: [confirmKey],
    message,
  })
}
