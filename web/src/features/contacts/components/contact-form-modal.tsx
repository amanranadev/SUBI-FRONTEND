"use client"

import * as React from "react"
import { ContactForm } from "@/features/contacts/components/contact-form"
import type {
  ContactResult,
  CreateContactData,
} from "@/features/contacts/types"
import { Modal } from "@/shared/ui/modal"

interface ContactFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateContactData) => Promise<boolean | void> | boolean | void
  contact?: ContactResult | null
  isSubmitting?: boolean
}

export function ContactFormModal({
  isOpen,
  onClose,
  onSubmit,
  contact,
  isSubmitting = false,
}: ContactFormModalProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      onClose()
    }
  }

  React.useEffect(() => {
    if (isOpen || typeof document === "undefined") {
      return
    }

    const cleanupTimer = window.setTimeout(() => {
      const hasOpenDialog = document.querySelector(
        '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
      )

      if (!hasOpenDialog) {
        document.body.style.pointerEvents = ""
      }
    }, 0)

    return () => {
      window.clearTimeout(cleanupTimer)
    }
  }, [isOpen])

  React.useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.pointerEvents = ""
      }
    }
  }, [])

  return (
    <Modal
      open={isOpen}
      onOpenChange={handleOpenChange}
      hideHeader
      showCloseButton={false}
      overlayClassName="bg-black/80 backdrop-blur-sm"
      contentClassName="!flex !max-h-[90vh] !w-[min(96vw,58rem)] !max-w-none !flex-col !gap-0 overflow-hidden rounded-[2rem] border-none bg-background/95 p-0 shadow-box"
    >
        <ContactForm
          contact={contact}
          isSubmitting={isSubmitting}
          onCancel={onClose}
          onSubmit={onSubmit}
        />
    </Modal>
  )
}
