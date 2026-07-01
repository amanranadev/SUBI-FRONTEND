import * as React from "react";
import { useFormContext, useFormState, useWatch, type Control } from "react-hook-form";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { FormSelectField } from "@/shared/ui/form-select-field";
import type { TransactionFormData } from "@/features/transactions/types";
import {
  TRANSACTION_DIALOG_SECTION,
  type SectionId,
  type ValidationErrors,
} from "./shared";
import type { RepresentingParty } from "@/features/transactions/types";
import { TransactionDialogAgentContactSection } from "./transaction-dialog-agent-contact-section";
import { TransactionDialogPartySection } from "./transaction-dialog-party-section";
import { TransactionDialogSectionCheckmark } from "./transaction-dialog-section-checkmark";
import { TransactionDialogSectionStatusBadge } from "./transaction-dialog-section-status-badge";

type TransactionDialogClientsSectionProps = {
  control: Control<TransactionFormData>;
  verifiedSections: Record<SectionId, boolean>;
  onToggleVerified: (id: SectionId) => void;
  errors: ValidationErrors;
};

export const TransactionDialogClientsSection = React.memo(
  function TransactionDialogClientsSection({
    verifiedSections,
    onToggleVerified,
    errors,
    control,
  }: TransactionDialogClientsSectionProps) {
    const form = useFormContext<TransactionFormData>();
    const { errors: formErrors } = useFormState({
      control,
      name: ["buyers", "sellers"],
    });
    const buyers = useWatch({ control, name: "buyers", defaultValue: [] });
    const sellers = useWatch({ control, name: "sellers", defaultValue: [] });
    const buyersError = (formErrors.buyers as { message?: string } | undefined)?.message;
    const sellersError = (formErrors.sellers as { message?: string } | undefined)?.message;

    const syncRepresentingToParties = React.useCallback(
      (representingParty: RepresentingParty | null) => {
        if (!representingParty) return;
        const buyers = form.getValues("buyers") ?? [];
        const sellers = form.getValues("sellers") ?? [];

        if (representingParty === "buyer") {
          form.setValue(
            "buyers",
            buyers.map((b) => ({ ...b, representing: true })),
            { shouldDirty: true },
          );
          form.setValue(
            "sellers",
            sellers.map((s) => ({ ...s, representing: false })),
            { shouldDirty: true },
          );
        } else if (representingParty === "seller") {
          form.setValue(
            "sellers",
            sellers.map((s) => ({ ...s, representing: true })),
            { shouldDirty: true },
          );
          form.setValue(
            "buyers",
            buyers.map((b) => ({ ...b, representing: false })),
            { shouldDirty: true },
          );
        }
      },
      [form],
    );

    const addParty = React.useCallback(
      (
        partyType: "buyers" | "sellers",
        party: {
          firstName: string;
          lastName: string;
          email: string;
          phone: string;
          representing: boolean;
        },
      ) => {
        const representingParty = form.getValues("representingParty");
        const shouldRepresent =
          representingParty === (partyType === "buyers" ? "buyer" : "seller");
        const nextParty = { ...party, representing: shouldRepresent };
        const current = form.getValues(partyType) ?? [];

        form.setValue(partyType, [...current, nextParty], {
          shouldDirty: true,
          shouldValidate: true,
        });
        form.clearErrors(partyType);
      },
      [form],
    );

    const removeParty = React.useCallback(
      (partyType: "buyers" | "sellers", index: number) => {
        const current = form.getValues(partyType) ?? [];
        if (current.length <= 1) {
          form.setError(partyType, {
            type: "manual",
            message: `At least one ${partyType === "buyers" ? "buyer" : "seller"} is required`,
          });
          return;
        }
        form.setValue(
          partyType,
          current.filter((_, i) => i !== index),
          { shouldDirty: true, shouldValidate: true },
        );
      },
      [form],
    );

    return (
      <AccordionItem
        value={TRANSACTION_DIALOG_SECTION.CLIENTS}
        className="border-0 bg-black/[0.02] rounded-[3rem] px-8 py-4"
      >
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tighter uppercase opacity-40">
              Client Information
            </span>
            <TransactionDialogSectionStatusBadge
              isVerified={verifiedSections.clients}
              hasErrors={Object.keys(errors).length > 0}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-6 space-y-8">
          <div className="rounded-2xl border border-black/[0.06] bg-white p-4 space-y-3">
            <FormSelectField
              control={control}
              name="representingParty"
              label="I am representing"
              options={[
                { value: "buyer", label: "Buyer(s)" },
                { value: "seller", label: "Seller(s)" },
              ]}
              placeholder="Select who you are representing"
              onValueChange={(v) =>
                syncRepresentingToParties(v as RepresentingParty | null)
              }
              showMessage={false}
              triggerClassName="h-11 rounded-xl border-black/[0.08]"
            />
          </div>
          <TransactionDialogPartySection
            label="Buyers"
            partyType="buyers"
            parties={buyers}
            control={control}
            globalError={buyersError ?? errors.buyers}
            errors={errors}
            onAddParty={(party) => addParty("buyers", party)}
            onRemoveParty={(index) => removeParty("buyers", index)}
          />
          <TransactionDialogPartySection
            label="Sellers"
            partyType="sellers"
            parties={sellers}
            control={control}
            globalError={sellersError ?? errors.sellers}
            errors={errors}
            onAddParty={(party) => addParty("sellers", party)}
            onRemoveParty={(index) => removeParty("sellers", index)}
          />
          <TransactionDialogAgentContactSection
            title="Buyer Agent"
            namePrefix="buyerAgent"
            control={control}
          />
          <TransactionDialogAgentContactSection
            title="Seller Agent"
            namePrefix="sellerAgent"
            control={control}
          />
          <TransactionDialogSectionCheckmark
            isVerified={verifiedSections.clients}
            onToggle={() => onToggleVerified(TRANSACTION_DIALOG_SECTION.CLIENTS)}
          />
        </AccordionContent>
      </AccordionItem>
    );
  },
);
