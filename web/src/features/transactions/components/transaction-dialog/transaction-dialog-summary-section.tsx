import * as React from "react";
import { useFormContext, useWatch, type Control } from "react-hook-form";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { ConfirmModal } from "@/shared/ui/confirm-modal";
import type { TransactionFormData } from "@/features/transactions/types";
import {
  TRANSACTION_DIALOG_SECTION,
  type SectionId,
  type ValidationErrors,
} from "./shared";
import { TransactionDialogControlledSectionField } from "./transaction-dialog-controlled-section-field";
import { TransactionDialogSectionCheckmark } from "./transaction-dialog-section-checkmark";
import { TransactionDialogSectionField } from "./transaction-dialog-section-field";
import { TransactionDialogSectionStatusBadge } from "./transaction-dialog-section-status-badge";

type PendingDateChange = {
  name: "closeDate" | "mutualAcceptanceDate";
  value: string;
};

type TransactionDialogSummarySectionProps = {
  control: Control<TransactionFormData>;
  verifiedSections: Record<SectionId, boolean>;
  onToggleVerified: (id: SectionId) => void;
  errors: ValidationErrors;
  onDateCascade: (
    fieldName: "closeDate" | "mutualAcceptanceDate",
    newDate: string,
  ) => void;
};

export const TransactionDialogSummarySection = React.memo(
  function TransactionDialogSummarySection({
    verifiedSections,
    onToggleVerified,
    errors,
    control,
    onDateCascade,
  }: TransactionDialogSummarySectionProps) {
    const form = useFormContext<TransactionFormData>();
    const psaType = useWatch({ control, name: "psaType", defaultValue: "" });
    const [pendingDate, setPendingDate] =
      React.useState<PendingDateChange | null>(null);

    const setDateWithConfirm = React.useCallback(
      (name: "closeDate" | "mutualAcceptanceDate") => (value: string) => {
        setPendingDate({ name, value });
      },
      [],
    );

    const handleConfirmDateChange = React.useCallback(() => {
      if (!pendingDate) return;
      form.setValue(pendingDate.name, pendingDate.value, {
        shouldDirty: true,
        shouldValidate: true,
      });
      onDateCascade(pendingDate.name, pendingDate.value);
      setPendingDate(null);
    }, [form, onDateCascade, pendingDate]);

    const handleCancelDateChange = React.useCallback(() => {
      setPendingDate(null);
    }, []);

    return (
      <AccordionItem
        value={TRANSACTION_DIALOG_SECTION.SUMMARY}
        className="border-0 bg-black/[0.02] rounded-[3rem] px-8 py-4"
      >
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tighter uppercase opacity-40">
              Transaction Summary
            </span>
            <TransactionDialogSectionStatusBadge
              isVerified={verifiedSections.summary}
              hasErrors={Object.keys(errors).length > 0}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-6 space-y-8">
          <div className="grid grid-cols-2 gap-8 px-1">
            <TransactionDialogControlledSectionField
              control={control}
              name="address"
              label="Property Address"
              externalError={errors.address}
              required
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="price"
              label="Purchase Price"
              externalError={errors.price}
              kind="currency"
              required
            />
            <TransactionDialogSectionField
              label="PSA Type"
              value={psaType}
              subtleHighlight
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="earnestMoney"
              label="Earnest Money"
              kind="currency"
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="closeDate"
              label="Closing Date"
              onValueChange={setDateWithConfirm("closeDate")}
              externalError={errors.closeDate}
              kind="date"
              required
              highlight
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="mutualAcceptanceDate"
              label="Mutual Acceptance"
              onValueChange={setDateWithConfirm("mutualAcceptanceDate")}
              externalError={errors.mutualAcceptanceDate}
              kind="date"
              required
            />
          </div>
          <TransactionDialogSectionCheckmark
            isVerified={verifiedSections.summary}
            onToggle={() => onToggleVerified(TRANSACTION_DIALOG_SECTION.SUMMARY)}
          />
        </AccordionContent>

        <ConfirmModal
          open={pendingDate !== null}
          onOpenChange={(open) => {
            if (!open) setPendingDate(null);
          }}
          title="Update transaction dates?"
          description="Changing the closing date or pending date will automatically recalculate the due dates for all linked tasks."
          confirmLabel="Yes, update dates"
          cancelLabel="Cancel"
          variant="warning"
          onConfirm={handleConfirmDateChange}
          onCancel={handleCancelDateChange}
        />
      </AccordionItem>
    );
  },
);
