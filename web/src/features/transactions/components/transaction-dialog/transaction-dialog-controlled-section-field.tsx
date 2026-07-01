import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { TransactionDialogSectionField } from "./transaction-dialog-section-field";

type TransactionDialogControlledSectionFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  externalError?: string;
  kind?: "default" | "date" | "phone" | "currency";
  onValueChange?: (value: string) => void;
  required?: boolean;
  highlight?: boolean;
  subtleHighlight?: boolean;
};

export function TransactionDialogControlledSectionField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  externalError,
  kind = "default",
  onValueChange,
  required,
  highlight = false,
  subtleHighlight = false,
}: TransactionDialogControlledSectionFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TransactionDialogSectionField
          label={label}
          value={toStringValue(field.value)}
          onChange={onValueChange ?? field.onChange}
          onBlur={field.onBlur}
          error={fieldState.error?.message ?? externalError}
          kind={kind}
          required={required}
          highlight={highlight}
          subtleHighlight={subtleHighlight}
        />
      )}
    />
  );
}

function toStringValue(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return String(value);
}
