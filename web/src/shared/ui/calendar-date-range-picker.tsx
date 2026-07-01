"use client";

import * as React from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/shared/ui/calendar";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { parseDateValue } from "@/shared/utils/dateUtils";
import { cn } from "@/lib/utils";
import { CalendarDays } from "lucide-react";

export type CalendarDateRangePickerProps = {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "default";
  /** Full-width field vs compact pill (e.g. “Custom range” in filter popovers). */
  variant?: "field" | "pill";
  /** Use when opening inside another popover to avoid focus conflicts. */
  nested?: boolean;
  /** Emphasize pill when the range does not match a quick preset. */
  accentSelected?: boolean;
};

function stringsToRange(fromStr: string, toStr: string): DateRange | undefined {
  const from = fromStr.trim() ? parseDateValue(fromStr.trim()) : undefined;
  const to = toStr.trim() ? parseDateValue(toStr.trim()) : undefined;
  if (!from && !to) return undefined;
  return { from: from ?? to, to: to ?? from };
}

function rangeToStrings(range: DateRange | undefined): { from: string; to: string } {
  if (!range?.from) return { from: "", to: "" };
  const from = format(range.from, "yyyy-MM-dd");
  const end = range.to ?? range.from;
  const to = format(end, "yyyy-MM-dd");
  return { from, to };
}

export function CalendarDateRangePicker({
  from,
  to,
  onChange,
  disabled = false,
  className,
  size = "default",
  variant = "field",
  nested = false,
  accentSelected = false,
}: CalendarDateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = React.useMemo(() => stringsToRange(from, to), [from, to]);

  const label = React.useMemo(() => {
    if (!from.trim() && !to.trim()) {
      return variant === "pill" ? "Custom range" : "Select date range";
    }
    const fromDate = from.trim() ? parseDateValue(from.trim()) : undefined;
    const toDate = to.trim() ? parseDateValue(to.trim()) : undefined;
    if (!fromDate) {
      return variant === "pill" ? "Custom range" : "Select date range";
    }
    const same = !toDate || format(fromDate, "yyyy-MM-dd") === format(toDate, "yyyy-MM-dd");
    const fmt = variant === "pill" ? "MMM d" : "MMM d, yyyy";
    if (same) return format(fromDate, fmt);
    if (!toDate) return `${format(fromDate, fmt)} → …`;
    return `${format(fromDate, fmt)} – ${format(toDate, fmt)}`;
  }, [from, to, variant]);

  const handleSelect = (range: DateRange | undefined) => {
    if (!range?.from) {
      onChange("", "");
      return;
    }
    const { from: nextFrom, to: nextTo } = rangeToStrings(range);
    onChange(nextFrom, nextTo);
  };

  return (
    <Popover modal={!nested} open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            variant === "field" &&
              "h-auto min-h-10 w-full justify-start gap-2 rounded-xl border-black/[0.08] bg-background px-3 py-2 text-left font-normal shadow-sm hover:bg-muted/40",
            variant === "field" &&
              !from.trim() &&
              !to.trim() &&
              "text-muted-foreground",
            variant === "pill" &&
              cn(
                "h-10 min-h-10 w-full justify-start gap-2 rounded-full border-input bg-background px-3.5 text-left text-xs font-medium text-foreground shadow-none",
                "hover:!bg-muted hover:!text-foreground",
                "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !from.trim() &&
                  !to.trim() &&
                  "text-foreground/60 [&_svg]:text-foreground/50",
                accentSelected &&
                  "border-primary/50 bg-primary/5 !text-primary hover:!bg-primary/10 hover:!text-primary [&_svg]:!text-primary/70",
              ),
            size === "sm" && variant === "field" && "min-h-9 py-1.5 text-sm",
            className,
          )}
        >
          <CalendarDays
            className={cn(
              "shrink-0",
              variant === "field" ? "size-4 opacity-50" : "size-3.5",
              variant === "pill" &&
                (from.trim() || to.trim()
                  ? accentSelected
                    ? "text-primary/70"
                    : "text-foreground/55"
                  : ""),
            )}
            aria-hidden
          />
          <span className={cn("min-w-0 flex-1 truncate text-left", variant === "field" && "line-clamp-2")}>
            {label}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={nested ? 8 : 4}>
        <Calendar
          key={`${from}-${to}`}
          mode="range"
          numberOfMonths={1}
          selected={selected}
          onSelect={handleSelect}
          defaultMonth={selected?.from}
        />
        <div className="flex justify-end gap-2 border-t p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => {
              onChange("", "");
            }}
          >
            Clear range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
