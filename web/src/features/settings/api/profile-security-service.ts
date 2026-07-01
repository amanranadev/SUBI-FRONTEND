import { z } from "zod"
import { apiClient } from "@/lib/api/client"

const changePasswordResponseSchema = z.object({
  message: z.string().optional(),
  error: z.string().optional(),
})

type ChangePasswordInput = {
  currentPassword?: string
  newPassword: string
  confirmPassword: string
}

export async function changeUserPassword(input: ChangePasswordInput): Promise<string> {
  const payload: Record<string, string> = {
    new_password: input.newPassword,
    new_password_confirmation: input.confirmPassword,
  }

  if (input.currentPassword) {
    payload.current_password = input.currentPassword
  }

  const response = await apiClient.post("/auth/change-password", payload)

  const parsed = changePasswordResponseSchema.parse(response.data)
  return parsed.message ?? "Password has been changed successfully."
}

export async function deleteUserAccount(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}`)
}
