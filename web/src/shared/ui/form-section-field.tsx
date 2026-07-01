"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { DatePickerInput } from "@/shared/ui/date-picker-input";
import { Input } from "@/shared/ui/input";
import { LabelOptional } from "@/shared/ui/label-required";
import { MaskedInput } from "@/shared/ui/masked-input";

const FIELD_KIND = {
  DEFAULT: "default",
  DATE: "date",
  PHONE: "phone",
  CURRENCY: "currency",
} as const;

type SectionFieldKind = (typeof FIELD_KIND)[keyof typeof FIELD_KIND];

type FormSectionFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  kind?: SectionFieldKind;
  required?: boolean;
  optional?: boolean;
  highlight?: boolean;
  subtleHighlight?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  showMessage?: boolean;
  placeholder?: string;
};

export function FormSectionField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  kind = FIELD_KIND.DEFAULT,
  required = false,
  optional = false,
  highlight = false,
  subtleHighlight = false,
  readOnly = false,
  disabled = false,
  showMessage = true,
  placeholder,
}: FormSectionFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const value = field.value ?? "";
        const error = fieldState.error?.message;
        const inputClassName = cn(
          "h-14 rounded-[1.75rem] bg-white border-black/[0.05] font-bold text-base",
          kind === FIELD_KIND.DATE ? "px-6 pr-12" : "px-6",
          highlight && "border-orange-300 bg-orange-50/40",
          subtleHighlight &&
            "border-violet-200 bg-violet-50/50 text-violet-700",
          error && "border-red-400 bg-red-50/50",
        );

        const controlNode = readOnly ? (
          <Input
            value={String(value)}
            readOnly
            disabled={disabled}
            className={inputClassName}
          />
        ) : kind === FIELD_KIND.DATE ? (
          <DatePickerInput
            value={String(value)}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            className={inputClassName}
            iconClassName="size-4 opacity-40"
          />
        ) : kind === FIELD_KIND.PHONE ? (
          <MaskedInput
            value={String(value)}
            mask="phone"
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            placeholder={placeholder ?? "(555)-123-4567"}
            className={inputClassName}
          />
        ) : kind === FIELD_KIND.CURRENCY ? (
          <MaskedInput
            value={String(value)}
            mask="currency"
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            disabled={disabled}
            placeholder={placeholder ?? "$0"}
            className={inputClassName}
          />
        ) : (
          <Input
            value={String(value)}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
            disabled={disabled}
            placeholder={placeholder}
            className={inputClassName}
          />
        );

        return (
          <FormItem
            className={cn(
              "space-y-2 p-0.5",
              highlight &&
                "rounded-[2rem] border border-orange-200 bg-orange-50/60 p-3",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <FormLabel
                className={cn(
                  "text-xs font-bold uppercase tracking-widest opacity-40 ml-4 flex flex-wrap items-center gap-1",
                  highlight && "text-orange-700 opacity-90",
                )}
                required={required}
              >
                {label}
                {subtleHighlight ? (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-violet-700">
                    Priority
                  </span>
                ) : null}
                {highlight && !readOnly ? (
                  <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-orange-700">
                    Important
                  </span>
                ) : null}
              </FormLabel>
              {optional ? <LabelOptional /> : null}
            </div>
            <div className="relative">
              <FormControl>{controlNode}</FormControl>
            </div>
            {showMessage ? <FormMessage className="ml-4" /> : null}
          </FormItem>
        );
      }}
    />
  );
}
