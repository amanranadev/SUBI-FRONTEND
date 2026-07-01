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
import { Input } from "./input";
import { LabelOptional } from "./label-required";

type FormInputFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label?: string;
  showLabel?: boolean;
  showMessage?: boolean;
  externalError?: string;
  required?: boolean;
  optional?: boolean;
  type?: ComponentProps<typeof Input>["type"];
  placeholder?: string;
  autoComplete?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  start?: ComponentProps<typeof Input>["start"];
  end?: ComponentProps<typeof Input>["end"];
  leftIcon?: ComponentProps<typeof Input>["leftIcon"];
  rightIcon?: ComponentProps<typeof Input>["rightIcon"];
  onKeyDown?: ComponentProps<typeof Input>["onKeyDown"];
  normalizeValue?: (value: string) => string;
  maxLength?: ComponentProps<typeof Input>["maxLength"];
};

export function FormInputField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  showLabel = true,
  showMessage = true,
  externalError,
  required = false,
  optional = false,
  type = "text",
  placeholder,
  autoComplete,
  disabled = false,
  className,
  inputClassName,
  start,
  end,
  leftIcon,
  rightIcon,
  onKeyDown,
  normalizeValue,
  maxLength,
}: FormInputFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {showLabel && label ? (
            <div className="flex items-center justify-between gap-2">
              <FormLabel required={required}>{label}</FormLabel>
              {optional ? <LabelOptional /> : null}
            </div>
          ) : null}
          <FormControl>
            <Input
              {...field}
              variant={fieldState.error || externalError ? "error" : "default"}
              type={type}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              maxLength={maxLength}
              onChange={(event) => {
                const nextValue = normalizeValue
                  ? normalizeValue(event.target.value)
                  : event.target.value;
                field.onChange(nextValue);
              }}
              onKeyDown={onKeyDown}
              className={inputClassName}
              start={start}
              end={end}
              leftIcon={leftIcon}
              rightIcon={rightIcon}
            />
          </FormControl>
          {showMessage ? (
            <FormMessage>{fieldState.error?.message ?? externalError}</FormMessage>
          ) : null}
        </FormItem>
      )}
    />
  );
}
