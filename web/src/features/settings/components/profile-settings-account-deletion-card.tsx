"use client"

import { useState } from "react"
import { AlertTriangle } from "lucide-react"
import { useMutation } from "@tanstack/react-query"
import { deleteUserAccount } from "@/features/settings/api/profile-security-service"
import { useAuth } from "@/lib/auth/context"
import { useToast } from "@/shared/hooks/use-toast"
import {
  Button,
  Card,
  Modal,
  Txt,
} from "@/shared/ui"

type ProfileSettingsAccountDeletionCardProps = {
  userId: string | null
}

function getDeleteErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data &&
    "errors" in error.response.data &&
    Array.isArray(error.response.data.errors) &&
    typeof error.response.data.errors[0] === "string"
  ) {
    return error.response.data.errors[0]
  }

  if (error instanceof Error && error.message) return error.message
  return "Could not delete your account right now. Please try again."
}

export function ProfileSettingsAccountDeletionCard({
  userId,
}: ProfileSettingsAccountDeletionCardProps) {
  const { toast } = useToast()
  const { logout } = useAuth()
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!userId) {
        throw new Error("Missing authenticated user.")
      }

      await deleteUserAccount(userId)
    },
    onSuccess: async () => {
      setIsDeleteModalOpen(false)
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      })
      await logout()
    },
    onError: (error) => {
      toast({
        title: "Could not delete account",
        description: getDeleteErrorMessage(error),
        variant: "destructive",
      })
    },
  })

  return (
    <Card className="rounded-[3rem] border border-destructive/20 bg-destructive/5 heavy-shadow p-8 md:p-10 space-y-6">
      <div className="space-y-1">
        <Txt as="h2" size="2xl" weight="bold" className="tracking-tight text-destructive">
          Delete account
        </Txt>
        <Txt as="p" size="sm" tone="muted">
          Permanently delete your account and all associated data. This action cannot be
          undone.
        </Txt>
      </div>

      <Button
        variant="destructive"
        disabled={deleteAccountMutation.isPending || !userId}
        onClick={() => setIsDeleteModalOpen(true)}
      >
        <AlertTriangle className="size-4" />
        Delete my account
      </Button>

      <Modal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete your account?"
        description="This action is irreversible. All your account data, settings, and access will be permanently removed."
        contentClassName="rounded-[2.5rem] border-0 heavy-shadow p-8"
        footer={
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={deleteAccountMutation.isPending}
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteAccountMutation.isPending}
              onClick={() => deleteAccountMutation.mutate()}
            >
              {deleteAccountMutation.isPending ? "Deleting..." : "Delete permanently"}
            </Button>
          </div>
        }
      >
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive text-white">
              <AlertTriangle className="size-5" />
            </div>
            <Txt as="p" size="sm" className="text-destructive">
              You are about to permanently delete your account.
            </Txt>
          </div>
        </div>
      </Modal>
    </Card>
  )
}
