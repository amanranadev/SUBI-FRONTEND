"use client"

import { Mail, Plus, Trash2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  addSecondaryEmail,
  deleteSecondaryEmail,
  listSecondaryEmails,
} from "@/features/settings/api/profile-contact-methods-service"
import { useToast } from "@/shared/hooks/use-toast"
import { Button, Card, Form, FormInputField, Txt } from "@/shared/ui"

type ProfileSettingsSecondaryEmailsCardProps = {
  userId: string | null
  primaryEmail: string
}

const SECONDARY_EMAILS_QUERY_KEY = ["settings", "secondary-emails"] as const

const addSecondaryEmailSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
})

type AddSecondaryEmailValues = z.infer<typeof addSecondaryEmailSchema>

export function ProfileSettingsSecondaryEmailsCard({
  userId,
  primaryEmail,
}: ProfileSettingsSecondaryEmailsCardProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<AddSecondaryEmailValues>({
    resolver: zodResolver(addSecondaryEmailSchema),
    defaultValues: { email: "" },
  })

  const secondaryEmailsQuery = useQuery({
    queryKey: [...SECONDARY_EMAILS_QUERY_KEY, userId],
    queryFn: () => listSecondaryEmails(userId!),
    enabled: Boolean(userId),
    staleTime: 30_000,
  })

  const addSecondaryEmailMutation = useMutation({
    mutationFn: (values: AddSecondaryEmailValues) =>
      addSecondaryEmail({ userId: userId!, email: values.email }),
    onSuccess: async () => {
      form.reset()
      await queryClient.invalidateQueries({
        queryKey: [...SECONDARY_EMAILS_QUERY_KEY, userId],
      })
      toast({
        title: "Secondary email added",
        description: "The new email can now receive notifications.",
      })
    },
    onError: (error) => {
      toast({
        title: "Could not add email",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    },
  })

  const deleteSecondaryEmailMutation = useMutation({
    mutationFn: (emailId: string) => deleteSecondaryEmail(emailId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...SECONDARY_EMAILS_QUERY_KEY, userId],
      })
      toast({
        title: "Email removed",
        description: "Secondary email removed successfully.",
      })
    },
    onError: (error) => {
      toast({
        title: "Could not remove email",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      })
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    if (!userId) return
    await addSecondaryEmailMutation.mutateAsync(values)
  })

  const isBusy = addSecondaryEmailMutation.isPending || deleteSecondaryEmailMutation.isPending
  const secondaryEmails = secondaryEmailsQuery.data ?? []

  return (
    <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-6">
      <div className="space-y-1">
        <Txt as="h3" size="xl" weight="bold">
          Email addresses
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          Keep your primary email and add secondary emails for notifications.
        </Txt>
      </div>

      <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4 space-y-1">
        <Txt as="p" size="xs" weight="bold" transform="upper" className="opacity-50">
          Primary email
        </Txt>
        <Txt as="p" size="base" weight="medium">
          {primaryEmail}
        </Txt>
      </div>

      <Form {...form}>
        <form className="flex flex-col gap-3 md:flex-row md:items-end" onSubmit={onSubmit}>
          <FormInputField
            control={form.control}
            name="email"
            label="Add secondary email"
            type="email"
            placeholder="agent@example.com"
            start={<Mail className="size-4" />}
            disabled={isBusy || !userId}
            className="flex-1"
          />
          <Button type="submit" disabled={isBusy || !userId}>
            <Plus className="size-4" />
            Add email
          </Button>
        </form>
      </Form>

      <div className="space-y-3">
        <Txt as="p" size="sm" weight="bold">
          Secondary email list
        </Txt>
        {secondaryEmailsQuery.isLoading ? (
          <Txt as="p" size="sm" tone="muted">
            Loading secondary emails...
          </Txt>
        ) : secondaryEmails.length === 0 ? (
          <Txt as="p" size="sm" tone="muted">
            No secondary emails yet.
          </Txt>
        ) : (
          secondaryEmails.map((email) => (
            <div
              key={email.id}
              className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-3"
            >
              <Txt as="p" size="sm" weight="medium">
                {email.email}
              </Txt>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isBusy}
                onClick={() => deleteSecondaryEmailMutation.mutate(email.id)}
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
