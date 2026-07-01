"use client";

import type { ComponentProps } from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { MaskedInput } from "@/shared/ui/masked-input";
import { LabelOptional } from "./label-required";

type FormPhoneFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  optional?: boolean;
  placeholder?: string;
  showMessage?: boolean;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  start?: ComponentProps<typeof MaskedInput>["start"];
  end?: ComponentProps<typeof MaskedInput>["end"];
  onValueChange?: (value: string) => void;
};

export function FormPhoneField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label = "Phone",
  required = false,
  optional = false,
  placeholder = "(555)-123-4567",
  showMessage = true,
  disabled = false,
  className,
  inputClassName,
  start,
  end,
  onValueChange,
}: FormPhoneFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center justify-between gap-2">
            <FormLabel required={required}>{label}</FormLabel>
            {optional ? <LabelOptional /> : null}
          </div>
          <FormControl>
            <MaskedInput
              value={(field.value as string) ?? ""}
              onValueChange={(value) => {
                field.onChange(value);
                onValueChange?.(value);
              }}
              onBlur={field.onBlur}
              mask="phone"
              placeholder={placeholder}
              className={inputClassName}
              disabled={disabled}
              start={start}
              end={end}
            />
          </FormControl>
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}
