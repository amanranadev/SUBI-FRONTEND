import * as React from "react";
import { Controller, useFormContext, type Control } from "react-hook-form";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import type { TransactionFormData } from "@/features/transactions/types";
import {
  TRANSACTION_DIALOG_SECTION,
  type SectionId,
  type ValidationErrors,
} from "./shared";
import { ItemsThatStayEditor } from "./items-that-stay-editor";
import { TransactionDialogSectionCheckmark } from "./transaction-dialog-section-checkmark";
import { TransactionDialogControlledSectionField } from "./transaction-dialog-controlled-section-field";
import { TransactionDialogSectionStatusBadge } from "./transaction-dialog-section-status-badge";

type TransactionDialogPropertySectionProps = {
  control: Control<TransactionFormData>;
  verifiedSections: Record<SectionId, boolean>;
  onToggleVerified: (id: SectionId) => void;
  errors: ValidationErrors;
};

export const TransactionDialogPropertySection = React.memo(
  function TransactionDialogPropertySection({
    verifiedSections,
    onToggleVerified,
    errors,
    control,
  }: TransactionDialogPropertySectionProps) {
    const { setValue, getValues } = useFormContext<TransactionFormData>();

    return (
      <AccordionItem
        value={TRANSACTION_DIALOG_SECTION.PROPERTY}
        className="border-0 bg-black/[0.02] rounded-[3rem] px-8 py-4"
      >
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tighter uppercase opacity-40">
              Property Information
            </span>
            <TransactionDialogSectionStatusBadge
              isVerified={verifiedSections.property}
              hasErrors={Object.keys(errors).length > 0}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-6 space-y-8">
          <div className="grid grid-cols-2 gap-8 px-1">
            <TransactionDialogControlledSectionField
              control={control}
              name="city"
              label="City"
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="state"
              label="State"
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="county"
              label="County"
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="parcelNumber"
              label="Parcel Number"
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="titleCompany"
              label="Title Company"
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="closingAgent"
              label="Closing Agent"
            />
            <Controller
              control={control}
              name="escrowEmail"
              render={({ field, fieldState }) => (
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                    Escrow Email <span className="text-destructive">*</span>
                  </label>
                  <ContactEmailAutocomplete
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Escrow email"
                    className="h-12 rounded-xl border-primary/20 bg-primary/[0.02] font-bold"
                  />
                  {(fieldState.error?.message || errors.escrowEmail) && (
                    <p className="text-xs text-destructive">
                      {fieldState.error?.message || errors.escrowEmail}
                    </p>
                  )}
                </div>
              )}
            />
            <TransactionDialogControlledSectionField
              control={control}
              name="lender"
              label="Lender"
            />
          </div>

          <ItemsThatStayEditor
            control={control}
            setValue={setValue}
            getValues={getValues}
          />

          <TransactionDialogSectionCheckmark
            isVerified={verifiedSections.property}
            onToggle={() => onToggleVerified(TRANSACTION_DIALOG_SECTION.PROPERTY)}
          />
        </AccordionContent>
      </AccordionItem>
    );
  },
);
