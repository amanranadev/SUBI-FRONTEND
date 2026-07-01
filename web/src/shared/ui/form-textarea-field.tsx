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
import { Textarea } from "@/shared/ui/textarea";
import { LabelOptional } from "./label-required";

type FormTextareaFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  required?: boolean;
  optional?: boolean;
  showMessage?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  textareaClassName?: string;
  rows?: ComponentProps<typeof Textarea>["rows"];
};

export function FormTextareaField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  required = false,
  optional = false,
  showMessage = true,
  placeholder,
  disabled = false,
  className,
  textareaClassName,
  rows,
}: FormTextareaFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label ? (
            <div className="flex items-center justify-between gap-2">
              <FormLabel required={required}>{label}</FormLabel>
              {optional ? <LabelOptional /> : null}
            </div>
          ) : null}
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              className={textareaClassName}
              rows={rows}
            />
          </FormControl>
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}
