"use client";

import type { Control, UseFormGetValues } from "react-hook-form";
import { Controller, useFormState } from "react-hook-form";
import { AlertCircle, Trash2 } from "lucide-react";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { ContactPhoneAutocomplete } from "@/features/contacts/components/contact-autocomplete";
import type { TransactionDetailEditValues } from "@/features/transactions/schemas/transaction-detail-edit-schema";
import { TransactionPartyContactActions } from "@/features/transactions/components/transaction-party-contact-actions";
import {
  Badge,
  Button,
  FormInputField,
  Label,
  Txt,
} from "@/shared/ui";

type ClientPartyColumnProps = {
  title: string;
  partyType: "buyers" | "sellers";
  fieldArray: {
    fields: { id: string }[];
    append: (v: TransactionDetailEditValues["buyers"][number]) => void;
    remove: (index: number) => void;
  };
  control: Control<TransactionDetailEditValues>;
  getValues: UseFormGetValues<TransactionDetailEditValues>;
  isSaving: boolean;
  minRows: number;
  onImportParty: (party: TransactionDetailEditValues["buyers"][number]) => void;
};

export function ClientPartyColumn({
  title,
  partyType,
  fieldArray,
  control,
  getValues,
  isSaving,
  minRows,
  onImportParty,
}: ClientPartyColumnProps) {
  const { fields, append, remove } = fieldArray;
  const { errors } = useFormState({ control });
  const arrayRootMessage =
    partyType === "buyers"
      ? (errors.buyers as { message?: string } | undefined)?.message
      : (errors.sellers as { message?: string } | undefined)?.message;

  return (
    <div className="space-y-4 overflow-visible px-0.5 py-1">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Label className="text-sm font-bold uppercase tracking-widest opacity-40">
          {title}
        </Label>
      </div>
      <TransactionPartyContactActions
        disabled={isSaving}
        addLabel={`Add ${title.slice(0, -1).toLowerCase()}`}
        existingParties={(getValues(partyType) ?? []).map((party) => ({
          firstName: party.firstName,
          lastName: party.lastName,
          email: party.email,
          phone: party.phone,
          representing: party.representing,
        }))}
        onAddManual={() =>
          append({
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            representing: false,
          })
        }
        onImportParty={onImportParty}
      />

      {arrayRootMessage ? (
        <Txt className="flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3 shrink-0" />
          {arrayRootMessage}
        </Txt>
      ) : null}

      <div className="space-y-5">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="overflow-visible rounded-[1.75rem] border border-black/[0.06] bg-white p-2 shadow-sm"
          >
            <div className="flex items-center gap-3 p-2">
              <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                <FormInputField
                  control={control}
                  name={`${partyType}.${index}.firstName`}
                  label="First name"
                  disabled={isSaving}
                  className="min-w-0"
                  inputClassName="h-12 rounded-2xl"
                />
                <FormInputField
                  control={control}
                  name={`${partyType}.${index}.lastName`}
                  label="Last name"
                  disabled={isSaving}
                  className="min-w-0"
                  inputClassName="h-12 rounded-2xl"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 p-3 pt-0 sm:grid-cols-2">
              <Controller
                control={control}
                name={`${partyType}.${index}.email`}
                render={({ field, fieldState }) => (
                  <div className="space-y-2 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Email (optional)
                    </label>
                    <ContactEmailAutocomplete
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Email (optional)"
                      className="h-11 rounded-xl"
                      disabled={isSaving}
                    />
                    {fieldState.error?.message ? (
                      <Txt className="flex items-center gap-1 text-xs font-medium text-destructive">
                        <AlertCircle className="size-3 shrink-0" />
                        {fieldState.error.message}
                      </Txt>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                control={control}
                name={`${partyType}.${index}.phone`}
                render={({ field }) => (
                  <div className="space-y-2 min-w-0">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Phone (optional)
                    </label>
                    <ContactPhoneAutocomplete
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="(555) 555-5555"
                      className="h-11 rounded-xl"
                      disabled={isSaving}
                    />
                  </div>
                )}
              />
            </div>
            <div className="flex items-center justify-between px-3 pb-3">
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase"
              >
                Client row {index + 1}
              </Badge>
              <Button
                type="button"
                variant="ghost-destructive"
                size="icon"
                className="shrink-0 !rounded-xl"
                disabled={isSaving || fields.length <= minRows}
                aria-label={`Remove ${title} row`}
                onClick={() => {
                  if (fields.length <= minRows) return;
                  remove(index);
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {fields.length === 0 ? (
        <Txt className="flex items-center gap-1 text-xs font-medium text-destructive">
          <AlertCircle className="size-3" />
          Add at least one {title.slice(0, -1).toLowerCase()}.
        </Txt>
      ) : null}
    </div>
  );
}
