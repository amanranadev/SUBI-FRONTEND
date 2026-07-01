import { Controller, type Control } from "react-hook-form";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { ContactPhoneAutocomplete } from "@/features/contacts/components/contact-autocomplete";
import { FormInputField } from "@/shared/ui/form-input-field";
import type { TransactionFormData } from "@/features/transactions/types";

type TransactionDialogAgentContactSectionProps = {
  title: string;
  namePrefix: "buyerAgent" | "sellerAgent";
  control: Control<TransactionFormData>;
};

export function TransactionDialogAgentContactSection({
  title,
  namePrefix,
  control,
}: TransactionDialogAgentContactSectionProps) {
  return (
    <div className="space-y-4 px-1">
      <p className="text-sm font-bold uppercase tracking-widest opacity-40 ml-4">
        {title}
      </p>
      <div className="bg-white rounded-3xl border border-black/[0.03] p-4 space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormInputField
            control={control}
            name={`${namePrefix}.firstName`}
            showLabel={false}
            showMessage={false}
            placeholder="First name"
            className="space-y-0"
            inputClassName="h-10 rounded-xl border-black/5"
          />
          <FormInputField
            control={control}
            name={`${namePrefix}.lastName`}
            showLabel={false}
            showMessage={false}
            placeholder="Last name"
            className="space-y-0"
            inputClassName="h-10 rounded-xl border-black/5"
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Controller
            control={control}
            name={`${namePrefix}.email`}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <ContactEmailAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Email (optional)"
                  className="h-10 rounded-xl text-sm border-black/5"
                />
                {fieldState.error?.message ? (
                  <p className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />
          <Controller
            control={control}
            name={`${namePrefix}.phone`}
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <ContactPhoneAutocomplete
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Phone (optional)"
                  className="h-10 rounded-xl text-sm border-black/5"
                />
                {fieldState.error?.message ? (
                  <p className="text-xs text-destructive">
                    {fieldState.error.message}
                  </p>
                ) : null}
              </div>
            )}
          />
        </div>
      </div>
    </div>
  );
}
