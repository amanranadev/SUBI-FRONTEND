"use client";

import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";
import { AlertCircle } from "lucide-react";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { ContactPhoneAutocomplete } from "@/features/contacts/components/contact-autocomplete";
import type { TransactionDetailEditValues } from "@/features/transactions/schemas/transaction-detail-edit-schema";
import { FormInputField, Label, Txt } from "@/shared/ui";

type AgentContactCardProps = {
  title: string;
  namePrefix: "buyerAgent" | "sellerAgent";
  control: Control<TransactionDetailEditValues>;
  isSaving: boolean;
};

export function TransactionDetailAgentContactCard({
  title,
  namePrefix,
  control,
  isSaving,
}: AgentContactCardProps) {
  return (
    <div className="space-y-4 overflow-visible px-0.5 py-1">
      <Label className="text-sm font-bold uppercase tracking-widest opacity-40">
        {title}
      </Label>
      <div className="overflow-visible rounded-[1.75rem] border border-black/[0.06] bg-white p-2 shadow-sm">
        <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 p-2 sm:grid-cols-2">
          <FormInputField
            control={control}
            name={`${namePrefix}.firstName`}
            label="First name"
            disabled={isSaving}
            className="min-w-0"
            inputClassName="h-12 rounded-2xl"
          />
          <FormInputField
            control={control}
            name={`${namePrefix}.lastName`}
            label="Last name"
            disabled={isSaving}
            className="min-w-0"
            inputClassName="h-12 rounded-2xl"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 p-3 pt-0 sm:grid-cols-2">
          <Controller
            control={control}
            name={`${namePrefix}.email`}
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
            name={`${namePrefix}.phone`}
            render={({ field, fieldState }) => (
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
                {fieldState.error?.message ? (
                  <Txt className="flex items-center gap-1 text-xs font-medium text-destructive">
                    <AlertCircle className="size-3 shrink-0" />
                    {fieldState.error.message}
                  </Txt>
                ) : null}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
