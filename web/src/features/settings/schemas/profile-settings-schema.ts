import { z } from "zod"
import { toPhoneDigits } from "@/shared/ui/masked-input"

const MAX_TEXT_LENGTH = 120

function optionalTrimmedString(maxLength = MAX_TEXT_LENGTH) {
  return z.string().trim().max(maxLength, `Use at most ${maxLength} characters.`)
}

export const profileSettingsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required.").max(MAX_TEXT_LENGTH),
  lastName: optionalTrimmedString(),
  nickname: optionalTrimmedString(),
  email: z.string().trim().email("Enter a valid email address."),
  phoneNumber: z
    .string()
    .trim()
    .refine((value) => value === "" || value.replace(/\D/g, "").length === 10, {
      message: "Phone number must contain 10 digits.",
    }),
  licenseNumber: optionalTrimmedString(),
  brokerageName: optionalTrimmedString(),
  managingBrokerName: optionalTrimmedString(),
  managingBrokerPhone: z
    .string()
    .trim()
    .refine((value) => !value || toPhoneDigits(value).length === 10, {
      message: "Managing broker phone must contain 10 digits.",
    }),
  website: z
    .string()
    .trim()
    .refine(
      (value) => {
        if (!value) return true
        try {
          const normalized = value.startsWith("http") ? value : `https://${value}`
          const parsed = new URL(normalized)
          return Boolean(parsed.hostname)
        } catch {
          return false
        }
      },
      { message: "Enter a valid website URL." },
    ),
})
