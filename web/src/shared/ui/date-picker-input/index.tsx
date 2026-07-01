"use client";

import * as React from "react";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { formatDateInput, MaskedInput } from "@/shared/ui/masked-input";

type DatePickerInputProps = {
  value: string;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  iconClassName?: string;
  disabled?: boolean;
};

function parseIsoDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export function DatePickerInput({
  value,
  onValueChange,
  onBlur,
  placeholder = "YYYY-MM-DD",
  className,
  iconClassName,
  disabled = false,
}: DatePickerInputProps) {
  const [open, setOpen] = React.useState(false);
  const normalizedValue = React.useMemo(() => formatDateInput(value), [value]);
  const selectedDate = React.useMemo(
    () => parseIsoDate(normalizedValue),
    [normalizedValue],
  );

  return (
    <div className="relative">
      <MaskedInput
        value={normalizedValue}
        mask="date"
        onValueChange={onValueChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        disabled={disabled}
      />
      <Popover modal open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="absolute right-3 top-1/2 size-8 -translate-y-1/2 rounded-full hover:bg-input hover:text-input-foreground"
          >
            <CalendarIcon className={iconClassName ?? "size-4 opacity-40"} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="z-[9999] w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (!date) return;
              onValueChange?.(format(date, "yyyy-MM-dd"));
              onBlur?.();
              setOpen(false);
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
