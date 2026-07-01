"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { cn } from "@/lib/utils";

export type FormSelectOption = {
  value: string;
  label: string;
};

type FormSelectFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  options: FormSelectOption[];
  label?: string;
  showLabel?: boolean;
  showMessage?: boolean;
  placeholder?: string;
  /** Called after the form value is updated. Use for side effects (e.g. syncing to other fields). */
  onValueChange?: (value: string | null) => void;
  className?: string;
  triggerClassName?: string;
};

export function FormSelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  options,
  label,
  showLabel = true,
  showMessage = true,
  placeholder,
  onValueChange,
  className,
  triggerClassName,
}: FormSelectFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={className}>
          {showLabel && label ? <FormLabel>{label}</FormLabel> : null}
          <FormControl>
            <Select
              value={field.value ?? ""}
              onValueChange={(v) => {
                const value = v || null;
                field.onChange(value);
                onValueChange?.(value);
              }}
            >
              <SelectTrigger
                className={cn(
                  triggerClassName,
                  fieldState.error && "border-red-500 focus:ring-red-200",
                )}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormControl>
          {showMessage ? <FormMessage /> : null}
        </FormItem>
      )}
    />
  );
}
