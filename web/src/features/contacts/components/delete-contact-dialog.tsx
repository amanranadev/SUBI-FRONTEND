"use client"

import type { ContactResult } from "@/features/contacts/types"
import { getContactDisplayName } from "@/features/contacts/utils"
import { CONFIRM_MODAL_VARIANT, ConfirmModal } from "@/shared/ui/confirm-modal"

interface DeleteContactDialogProps {
  contact: ContactResult | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteContactDialog({
  contact,
  open,
  onOpenChange,
  onConfirm,
  isDeleting = false,
}: DeleteContactDialogProps) {
  const description = contact
    ? `Delete ${getContactDisplayName(contact)} from your contacts? This action cannot be undone.`
    : "Delete this contact? This action cannot be undone."

  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Contact"
      description={description}
      variant={CONFIRM_MODAL_VARIANT.DESTRUCTIVE}
      cancelLabel="Cancel"
      confirmLabel={isDeleting ? "Deleting..." : "Delete Contact"}
      onConfirm={onConfirm}
      isConfirming={isDeleting}
      contentClassName="rounded-[2rem] border-none p-8 shadow-box"
      cancelButtonClassName="rounded-2xl"
      confirmButtonClassName="rounded-2xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
    />
  )
}
