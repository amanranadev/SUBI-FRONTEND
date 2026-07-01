import { z } from "zod";
import {
  CONTACT_TYPES,
  CONTACT_TYPES_ARRAY,
  VENDOR_TYPES_ARRAY,
  type ContactType,
  type VendorType,
} from "@/features/contacts/constants";
import type { ContactFormData } from "@/features/contacts/types";
import { toPhoneDigits } from "@/shared/ui/masked-input";

const WEBSITE_REGEX = /^https?:\/\/.+/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_TYPE_OPTIONS = CONTACT_TYPES_ARRAY as [ContactType, ...ContactType[]];
const VENDOR_TYPE_OPTIONS = VENDOR_TYPES_ARRAY as [VendorType, ...VendorType[]];

export function getContactSchema(requiredFields: string[]): z.ZodType<ContactFormData> {
  return z
    .object({
      contactType: z.enum(CONTACT_TYPE_OPTIONS, {
        message: "Contact type is required",
      }),
      vendorType: z.enum(VENDOR_TYPE_OPTIONS).optional(),
      companyName: z.string().optional(),
      individualName: z.string().optional(),
      phoneNumber: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      license: z.string().optional(),
      notes: z.string().optional(),
      isFavorite: z.boolean(),
    })
    .superRefine((value: ContactFormData, ctx) => {
      const requireText = (
        field:
          | "vendorType"
          | "companyName"
          | "individualName"
          | "license"
          | "notes",
        label: string,
      ) => {
        if (requiredFields.includes(field) && !(value[field] || "").trim()) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `${label} is required`,
          });
        }
      };

      requireText("vendorType", "Vendor type");
      requireText("companyName", "Company name");
      requireText("individualName", "Individual name");
      requireText("license", "License number");
      requireText("notes", "Notes");

      const phoneDigits = toPhoneDigits(value.phoneNumber || "");
      if (requiredFields.includes("phoneNumber") && phoneDigits.length !== 10) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phoneNumber"],
          message: "Phone number must be exactly 10 digits",
        });
      }

      if (
        !requiredFields.includes("phoneNumber") &&
        value.phoneNumber &&
        phoneDigits.length > 0 &&
        phoneDigits.length !== 10
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phoneNumber"],
          message: "Phone number must be exactly 10 digits",
        });
      }

      if (
        requiredFields.includes("email") &&
        !EMAIL_REGEX.test((value.email || "").trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Valid email is required",
        });
      }

      if (
        !requiredFields.includes("email") &&
        value.email &&
        !EMAIL_REGEX.test(value.email.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["email"],
          message: "Enter a valid email address",
        });
      }

      if (
        requiredFields.includes("website") &&
        !WEBSITE_REGEX.test((value.website || "").trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website"],
          message: "Website must start with http:// or https://",
        });
      }

      if (
        !requiredFields.includes("website") &&
        value.website &&
        !WEBSITE_REGEX.test(value.website.trim())
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["website"],
          message: "Website must start with http:// or https://",
        });
      }
    });
}

export function getEmptyFormValues(): ContactFormData {
  return {
    contactType: CONTACT_TYPES.LENDER,
    vendorType: undefined,
    companyName: "",
    individualName: "",
    phoneNumber: "",
    email: "",
    website: "",
    license: "",
    notes: "",
    isFavorite: false,
  };
}
