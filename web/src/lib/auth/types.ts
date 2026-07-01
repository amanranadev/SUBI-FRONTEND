import { z } from "zod"
import type { AuthSessionStatus } from "@/lib/auth/constants"

const nullableStringToEmpty = z.string().nullish().transform((value) => value ?? "")

export const teamSchema = z.object({
  id: z.coerce.string(),
  name: nullableStringToEmpty,
  logo: z.string().nullish().transform((value) => value ?? ""),
})

export const userSchema = z.object({
  id: z.coerce.string(),
  email: z.string().email(),
  name: nullableStringToEmpty,
  lastName: nullableStringToEmpty,
  nickname: nullableStringToEmpty,
  picture: z.string().nullable().optional(),
  avatar: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  userType: z.string().nullable().optional(),
  onboardingCompleted: z.boolean().optional().default(false),
  isSuperadmin: z.boolean().optional().default(false),
  hasPassword: z.boolean().optional().default(true),
  teamId: z.string().nullable().optional(),
  teams: z.array(teamSchema).optional().default([]),
})

export const authResponseSchema = z.object({
  token: z.string(),
  user: userSchema,
  message: z.string().optional(),
})

export type Team = z.infer<typeof teamSchema>
export type User = z.infer<typeof userSchema>
export type AuthResponse = z.infer<typeof authResponseSchema>

export interface AuthSession {
  status: AuthSessionStatus
  user: User | null
  token: string | null
}
