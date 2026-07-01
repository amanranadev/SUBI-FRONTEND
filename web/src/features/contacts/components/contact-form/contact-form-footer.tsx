import * as React from "react";
import { DialogClose } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

interface ContactFormFooterProps {
  isEdit: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
  onCancel?: () => void;
}

export function ContactFormFooter({
  isEdit,
  isSubmitting,
  isDirty,
  isValid,
  onCancel,
}: ContactFormFooterProps) {
  return (
    <div className="flex items-center justify-end gap-3 border-t border-black/[0.04] bg-background px-6 py-5">
      {onCancel ? (
        <DialogClose asChild>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="rounded-2xl"
          >
            Cancel
          </Button>
        </DialogClose>
      ) : null}
      <Button
        type="submit"
        disabled={
          isSubmitting ||
          (isEdit ? !isDirty : !isValid)
        }
        className="rounded-2xl px-6"
      >
        {isSubmitting
          ? "Saving..."
          : isEdit
          ? "Update Contact"
          : "Add Contact"}
      </Button>
    </div>
  );
}
