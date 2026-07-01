"use client";

import { useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Button, Modal, Txt } from "@/shared/ui";

type TransactionDetailDeleteDialogProps = {
  address: string;
  onConfirmDelete: () => Promise<void>;
};

export function TransactionDetailDeleteDialog({
  address,
  onConfirmDelete,
}: TransactionDetailDeleteDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="flex justify-center pt-6">
      <Button
        variant="ghost"
        className="gap-2 rounded-2xl px-8 py-6 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5 hover:text-destructive"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="size-4" />
        Delete transaction
      </Button>

      <Modal
        open={isOpen}
        onOpenChange={setIsOpen}
        title={<span className="sr-only">Delete transaction?</span>}
        description={
          <span className="sr-only">
            This cannot be undone. The transaction {address} will be removed
            from your list.
          </span>
        }
        contentClassName="rounded-[4rem] border-0 p-12 shadow-default"
        footer={
          <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:gap-6">
            <Button
              type="button"
              variant="outline"
              className="h-16 flex-1 rounded-[2rem] border-black/10 font-bold"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-16 flex-1 rounded-[2rem] font-bold text-white hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);
                try {
                  await onConfirmDelete();
                  setIsOpen(false);
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete permanently"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto mb-2 flex size-24 items-center justify-center rounded-[2.5rem] bg-destructive/10">
            <AlertTriangle className="size-12 text-destructive" />
          </div>
          <Txt as="h3" size="4xl" weight="bold" className="tracking-tighter">
            Delete transaction?
          </Txt>
          <Txt
            as="p"
            size="xl"
            className="font-medium leading-tight opacity-60"
          >
            This cannot be undone. The transaction{" "}
            <span className="font-bold text-foreground">{address}</span> will be
            removed from your list.
          </Txt>
        </div>
      </Modal>
    </div>
  );
}
