import { AlertCircle, User, X } from "lucide-react";
import { type Control } from "react-hook-form";
import { TransactionPartyContactActions } from "@/features/transactions/components/transaction-party-contact-actions";
import type {
  TransactionFormData,
  TransactionFormParty,
} from "@/features/transactions/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/shared/ui/badge";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { ContactPhoneAutocomplete } from "@/features/contacts/components/contact-autocomplete";
import { FormField } from "@/shared/ui/form";
import { FormInputField } from "@/shared/ui/form-input-field";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { MaskedInput } from "@/shared/ui/masked-input";

import type { ValidationErrors } from "./shared";

type TransactionDialogPartySectionProps = {
  label: string;
  partyType: "buyers" | "sellers";
  parties: TransactionFormParty[];
  control: Control<TransactionFormData>;
  globalError?: string;
  errors: ValidationErrors;
  onAddParty: (party: TransactionFormParty) => void;
  onRemoveParty: (index: number) => void;
};

export function TransactionDialogPartySection({
  label,
  partyType,
  parties,
  control,
  globalError,
  errors,
  onAddParty,
  onRemoveParty,
}: TransactionDialogPartySectionProps) {
  if (parties.length === 0 && globalError) {
    return (
      <div className="space-y-2 px-1">
        <Label className="text-sm font-bold uppercase tracking-widest opacity-40 ml-4">
          {label}
        </Label>
        <p className="text-xs text-red-500 font-medium ml-4 flex items-center gap-1">
          <AlertCircle className="size-3" />
          {globalError}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 px-1">
      <Label className="text-sm font-bold uppercase tracking-widest opacity-40 ml-4">
        {label}
        {globalError && (
          <span className="text-red-500 normal-case tracking-normal font-medium ml-2">
            - {globalError}
          </span>
        )}
      </Label>
      <TransactionPartyContactActions
        addLabel={`Add ${label.slice(0, -1).toLowerCase()}`}
        existingParties={parties}
        onAddManual={() =>
          onAddParty({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            representing: false,
          })
        }
        onImportParty={onAddParty}
      />
      {parties.map((_, i) => (
        <div
          key={i}
          className=" bg-white rounded-3xl border border-black/[0.03]"
        >
          <div className="flex items-center z-10 relative gap-4 p-2 bg-white  rounded-3xl shadow-md">
            <User className="size-5 opacity-40 ml-4 shrink-0" />
            <div className="flex-1 flex gap-2">
              <FormInputField
                control={control}
                name={`${partyType}.${i}.firstName` as const}
                showLabel={false}
                showMessage={false}
                placeholder="First name"
                className="space-y-0"
                inputClassName="border-0 focus-visible:ring-0 font-bold text-base h-12"
              />
              <FormInputField
                control={control}
                name={`${partyType}.${i}.lastName` as const}
                showLabel={false}
                showMessage={false}
                placeholder="Last name"
                className="space-y-0"
                inputClassName="border-0 focus-visible:ring-0 font-bold text-base h-12"
              />
            </div>
            <div className="mr-2 flex shrink-0 items-center gap-1">
              <Badge
                variant="outline"
                className="whitespace-nowrap border-primary/25 bg-primary/8 text-primary"
              >
                from document
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-9 shrink-0 !rounded-lg text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                aria-label={`Remove ${label.slice(0, -1).toLowerCase()}`}
                onClick={() => onRemoveParty(i)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-4">
            <FormField
              control={control}
              name={`${partyType}.${i}.email` as const}
              render={({ field }) => (
                <div className="space-y-1">
                  <ContactEmailAutocomplete
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Email (optional)"
                    className="h-10 rounded-xl text-sm border-black/5"
                  />
                  {errors[`${partyType.slice(0, -1)}_${i}_email`] && (
                    <p className="text-xs text-destructive">
                      {errors[`${partyType.slice(0, -1)}_${i}_email`]}
                    </p>
                  )}
                </div>
              )}
            />
            <FormField
              control={control}
              name={`${partyType}.${i}.phone` as const}
              render={({ field, fieldState }) => (
                <div className="space-y-1">
                  <ContactPhoneAutocomplete
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Phone (optional)"
                    className={cn(
                      "h-10 rounded-xl text-sm border-black/5",
                      (fieldState.error?.message ||
                        errors[`${partyType.slice(0, -1)}_${i}_phone`]) &&
                        "border-red-400",
                    )}
                  />
                  {(fieldState.error?.message ||
                    errors[`${partyType.slice(0, -1)}_${i}_phone`]) && (
                    <p className="text-xs text-red-500 mt-1 ml-3">
                      {fieldState.error?.message ??
                        errors[`${partyType.slice(0, -1)}_${i}_phone`]}
                    </p>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
