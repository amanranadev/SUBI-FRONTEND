"use client"

import { Button, Modal, Txt } from "@/shared/ui"

type TransactionDocumentPreviewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  previewUrl: string | null
}

export function TransactionDocumentPreviewModal({
  open,
  onOpenChange,
  title,
  previewUrl,
}: TransactionDocumentPreviewModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Visualize document content directly in this page."
      contentClassName="max-w-6xl rounded-[2rem] border-black/5 p-6"
    >
      <div className="space-y-4">
        <div className="h-[72dvh] overflow-hidden rounded-2xl border border-black/10 bg-black/[0.02]">
          {previewUrl ? (
            <iframe
              title={title}
              src={previewUrl}
              className="h-full w-full"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center">
              <Txt as="p" size="sm" tone="muted">
                Could not load this preview. Use download to access the file.
              </Txt>
            </div>
          )}
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}
