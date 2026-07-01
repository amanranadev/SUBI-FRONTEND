"use client";

import { Button, Modal, Txt } from "@/shared/ui";

export type TransactionReprocessChange = {
  key: string;
  label: string;
  currentValue: string;
  nextValue: string;
};

type TransactionDocumentReprocessReviewModalProps = {
  open: boolean;
  isSaving: boolean;
  changes: TransactionReprocessChange[];
  onOpenChange: (open: boolean) => void;
  onApply: () => void;
};

export function TransactionDocumentReprocessReviewModal({
  open,
  isSaving,
  changes,
  onOpenChange,
  onApply,
}: TransactionDocumentReprocessReviewModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Review reprocessed changes"
      description="Highlighted fields changed from document reprocessing. Apply to update the transaction."
      contentClassName="max-w-4xl rounded-[2rem] border-black/5 p-6"
    >
      <div className="space-y-4">
        <div className="max-h-[56dvh] overflow-auto rounded-2xl border border-black/10">
          <div className="grid grid-cols-1 divide-y divide-black/8">
            {changes.map((change) => (
              <div key={change.key} className="grid gap-3 p-4 md:grid-cols-3 md:gap-4">
                <Txt as="p" size="sm" weight="bold">
                  {change.label}
                </Txt>
                <div className="rounded-xl border border-black/8 bg-black/[0.02] p-3">
                  <Txt as="p" size="xs" tone="muted" className="uppercase tracking-wide">
                    Current
                  </Txt>
                  <Txt as="p" size="sm" className="mt-1 break-words">
                    {change.currentValue}
                  </Txt>
                </div>
                <div className="rounded-xl border border-primary/25 bg-primary/8 p-3">
                  <Txt as="p" size="xs" tone="muted" className="uppercase tracking-wide">
                    Reprocessed
                  </Txt>
                  <Txt as="p" size="sm" className="mt-1 break-words">
                    {change.nextValue}
                  </Txt>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="rounded-xl"
            onClick={onApply}
            disabled={isSaving || changes.length === 0}
          >
            {isSaving ? "Saving..." : "Apply updates"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
