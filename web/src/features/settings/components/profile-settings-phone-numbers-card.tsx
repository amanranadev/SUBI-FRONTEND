"use client"

import { Phone, Plus, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  addUserPhoneNumber,
  deleteUserPhoneNumber,
  listUserPhoneNumbers,
} from "@/features/settings/api/profile-contact-methods-service"
import { useToast } from "@/shared/hooks/use-toast"
import { toPhoneDigits } from "@/shared/ui/masked-input"
import { Button, Card, Form, FormPhoneField, Txt } from "@/shared/ui"

type ProfileSettingsPhoneNumbersCardProps = {
  userId: string | null
  primaryPhoneNumber: string
}

const PHONE_NUMBERS_QUERY_KEY = ["settings", "phone-numbers"] as const

const addPhoneNumberSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Phone number is required.")
    .refine((value) => toPhoneDigits(value).length === 10, {
      message: "Phone number must have 10 digits.",
    }),
})

type AddPhoneNumberValues = z.infer<typeof addPhoneNumberSchema>

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 10) return value
  return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`
}

export function ProfileSettingsPhoneNumbersCard({
  userId,
  primaryPhoneNumber,
}: ProfileSettingsPhoneNumbersCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<AddPhoneNumberValues>({
    resolver: zodResolver(addPhoneNumberSchema),
    defaultValues: { phoneNumber: "" },
  })

  const phoneNumbersQuery = useQuery({
    queryKey: [...PHONE_NUMBERS_QUERY_KEY, userId],
    queryFn: () => listUserPhoneNumbers(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })

  const addPhoneNumberMutation = useMutation({
    mutationFn: (values: AddPhoneNumberValues) =>
      addUserPhoneNumber({
        userId: userId!,
        phoneNumber: toPhoneDigits(values.phoneNumber),
      }),
    onSuccess: async () => {
      form.reset()
      await queryClient.invalidateQueries({
        queryKey: [...PHONE_NUMBERS_QUERY_KEY, userId],
      })
      toast({
        title: "Phone number added",
        description: "The number can now receive SMS notifications.",
      })
    },
    onError: (error) => {
      toast({
        title: "Could not add phone number",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    },
  })

  const deletePhoneNumberMutation = useMutation({
    mutationFn: (phoneId: string) => deleteUserPhoneNumber(phoneId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...PHONE_NUMBERS_QUERY_KEY, userId],
      })
      toast({
        title: "Phone number removed",
        description: "Secondary phone number removed successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Could not remove phone number",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (!userId) return
    await addPhoneNumberMutation.mutateAsync(values)
  })

  const isBusy = addPhoneNumberMutation.isPending || deletePhoneNumberMutation.isPending
  const phoneNumbers = phoneNumbersQuery.data ?? []

  return (
    <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-6">
      <div className="space-y-1">
        <Txt as="h3" size="xl" weight="bold">
          Phone numbers
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          Add more numbers for SMS reminders and transaction updates.
        </Txt>
      </div>

      <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 space-y-1">
        <Txt as="p" size="xs" weight="bold" transform="upper" className="opacity-50">
          Primary phone
        </Txt>
        <Txt as="p" size="base" weight="medium">
          {primaryPhoneNumber ? formatPhoneNumber(primaryPhoneNumber) : "Not set"}
        </Txt>
      </div>

      <Form {...form}>
        <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={onSubmit}>
          <FormPhoneField
            control={form.control}
            name="phoneNumber"
            label="Add phone number"
            placeholder="(555)-123-4567"
            start={<Phone className="size-4" />}
            disabled={isBusy || !userId}
            className="flex-1"
          />
          <Button type="submit" disabled={isBusy || !userId}>
            <Plus className="size-4" />
            Add phone
          </Button>
        </form>
      </Form>

      <div className="space-y-3">
        <Txt as="p" size="sm" weight="bold">
          Additional phone numbers
        </Txt>
        {phoneNumbersQuery.isLoading ? (
          <Txt as="p" size="sm" tone="muted">
            Loading phone numbers...
          </Txt>
        ) : phoneNumbers.length === 0 ? (
          <Txt as="p" size="sm" tone="muted">
            No additional phone numbers yet.
          </Txt>
        ) : (
          phoneNumbers.map((phone) => (
            <div
              key={phone.id}
              className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-3"
            >
              <Txt as="p" size="sm" weight="medium">
                {formatPhoneNumber(phone.phoneNumber)}
              </Txt>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onClick={() => deletePhoneNumberMutation.mutate(phone.id)}
              >
                <Trash2 className="size-4" />
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
