"use client";

import { Button, Modal, Txt } from "@/shared/ui";
import { RefreshCw, ReplaceIcon } from "lucide-react";

type TransactionDocumentActionModalProps = {
  open: boolean;
  title: string;
  description: string;
  confirmOnlyLabel: string;
  confirmReprocessLabel: string;
  disabled?: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmOnly: () => void;
  onConfirmReprocess: () => void;
};

export function TransactionDocumentActionModal({
  open,
  onOpenChange,
  title,
  description,
  confirmOnlyLabel,
  confirmReprocessLabel,
  disabled = false,
  onConfirmOnly,
  onConfirmReprocess,
}: TransactionDocumentActionModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      contentClassName="max-w-xl rounded-[2rem] border-black/5 p-8"
    >
      <div className="space-y-6">
        <Txt as="p" size="sm" tone="muted">
          Reprocessing updates transaction data and tasks using the new file
          analysis.
        </Txt>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline-dark"
            className="h-12 flex-1 rounded-2xl"
            disabled={disabled}
            onClick={onConfirmOnly}
          >
            <ReplaceIcon className="size-4" />
            {confirmOnlyLabel}
          </Button>
          <Button
            type="button"
            className="h-12 flex-1 rounded-2xl"
            variant="outline-dark"
            disabled={disabled}
            onClick={onConfirmReprocess}
          >
            <RefreshCw className="size-4" />
            {confirmReprocessLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
