import { z } from "zod"
import { apiClient } from "@/lib/api/client"

const secondaryEmailSchema = z.object({
  id: z.coerce.string(),
  email: z.string().email(),
})

const userPhoneNumberSchema = z.object({
  id: z.coerce.string(),
  phoneNumber: z.string(),
})

const userEmailApiItemSchema = z.object({
  id: z.coerce.string(),
  attributes: z.object({
    email: z.string().email(),
  }),
})

const userEmailsApiSchema = z.object({
  data: z.array(userEmailApiItemSchema).optional().default([]),
})

const userPhoneApiItemSchema = z.object({
  id: z.coerce.string(),
  phone_number: z.string(),
})

const userPhoneNumbersApiSchema = z.object({
  user_phone_numbers: z.array(userPhoneApiItemSchema).optional().default([]),
})

function toSecondaryEmails(data: unknown) {
  const parsed = userEmailsApiSchema.parse(data)
  return parsed.data.map((item) =>
    secondaryEmailSchema.parse({
      id: item.id,
      email: item.attributes.email,
    }),
  )
}

function toUserPhoneNumbers(data: unknown) {
  const parsed = userPhoneNumbersApiSchema.parse(data)
  return parsed.user_phone_numbers.map((item) =>
    userPhoneNumberSchema.parse({
      id: item.id,
      phoneNumber: item.phone_number,
    }),
  )
}

export type SecondaryEmail = z.infer<typeof secondaryEmailSchema>
export type UserPhoneNumber = z.infer<typeof userPhoneNumberSchema>

export async function listSecondaryEmails(userId: string): Promise<SecondaryEmail[]> {
  const response = await apiClient.get(`/users/${userId}/emails`)
  return toSecondaryEmails(response.data)
}

export async function addSecondaryEmail(input: {
  userId: string
  email: string
}): Promise<SecondaryEmail> {
  const response = await apiClient.post(`/users/${input.userId}/emails`, {
    email: input.email.trim().toLowerCase(),
  })

  const parsed = userEmailsApiSchema
    .pick({ data: true })
    .parse({ data: [response.data?.data ?? response.data] })

  const first = parsed.data[0]
  return secondaryEmailSchema.parse({
    id: first.id,
    email: first.attributes.email,
  })
}

export async function deleteSecondaryEmail(emailId: string): Promise<void> {
  await apiClient.delete(`/user_emails/${emailId}`)
}

export async function listUserPhoneNumbers(userId: string): Promise<UserPhoneNumber[]> {
  const response = await apiClient.get(`/users/${userId}/phone_numbers`)
  return toUserPhoneNumbers(response.data)
}

export async function addUserPhoneNumber(input: {
  userId: string
  phoneNumber: string
}): Promise<UserPhoneNumber> {
  const response = await apiClient.post(`/users/${input.userId}/phone_numbers`, {
    phone_number: input.phoneNumber,
  })

  const phone = (response.data as { user_phone_number?: { id?: string; phone_number?: string } })
    .user_phone_number

  return userPhoneNumberSchema.parse({
    id: phone?.id,
    phoneNumber: phone?.phone_number,
  })
}

export async function deleteUserPhoneNumber(phoneId: string): Promise<void> {
  await apiClient.delete(`/user_phone_numbers/${phoneId}`)
}
