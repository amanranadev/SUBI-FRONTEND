import { z } from "zod"
import {
  signupPasswordConfirmSchema,
  signupPasswordSchema,
  withMatchingPasswords,
} from "@/features/auth/password-schema"

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
})

export type LoginValues = z.infer<typeof loginSchema>

const signupSchemaBase = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    password: signupPasswordSchema,
    passwordConfirm: signupPasswordConfirmSchema,
    agreeToTerms: z
      .boolean()
      .refine((value) => value, "You must agree to the terms to continue"),
    agreeToAiDisclaimer: z
      .boolean()
      .refine((value) => value, "You must acknowledge the AI disclaimer"),
  })
export const signupSchema = withMatchingPasswords(signupSchemaBase, {
  passwordKey: "password",
  confirmKey: "passwordConfirm",
})

export type SignupValues = z.infer<typeof signupSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
})

export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

const resetPasswordSchemaBase = z
  .object({
    password: signupPasswordSchema
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    passwordConfirm: signupPasswordConfirmSchema,
  })
export const resetPasswordSchema = withMatchingPasswords(resetPasswordSchemaBase, {
  passwordKey: "password",
  confirmKey: "passwordConfirm",
})

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>
