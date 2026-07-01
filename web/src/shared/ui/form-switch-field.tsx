"use client";

import type { ReactNode } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "@/shared/ui/form";
import { Switch } from "./switch";

type FormSwitchFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: ReactNode;
  showMessage?: boolean;
  className?: string;
};

export function FormSwitchField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  showMessage = false,
  className,
}: FormSwitchFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label ? <div>{label}</div> : null}
          <FormControl>
            <Switch
              checked={Boolean(field.value)}
              onCheckedChange={(checked) => field.onChange(Boolean(checked))}
            />
          </FormControl>
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}
