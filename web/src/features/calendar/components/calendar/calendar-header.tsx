"use client";

import { format, startOfMonth, endOfMonth } from "date-fns";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Txt } from "@/shared/ui";
import { cn } from "@/lib/utils";

type CalendarHeaderProps = {
  currentMonth: Date;
  isSearchOpen: boolean;
  searchTerm: string;
  onToggleSearch: () => void;
  onSearchTermChange: (value: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onGoToToday: () => void;
};

export function CalendarHeader({
  currentMonth,
  isSearchOpen,
  searchTerm,
  onToggleSearch,
  onSearchTermChange,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-center justify-center h-16 w-16 bg-white rounded-2xl shadow-default border border-black/5">
          <Txt
            as="span"
            size="xs"
            weight="bold"
            transform="upper"
            className="text-[10px] tracking-widest opacity-40"
          >
            {format(currentMonth, "MMM")}
          </Txt>
          <Txt as="span" size="2xl" weight="bold" className="tracking-tighter">
            {format(currentMonth, "dd")}
          </Txt>
        </div>
        <div className="space-y-0.5">
          <Txt as="h1" size="3xl" weight="bold" className="tracking-tighter">
            {format(currentMonth, "MMMM yyyy")}
          </Txt>
          <Txt
            as="p"
            size="sm"
            weight="medium"
            className="opacity-40 tracking-tight"
          >
            {format(startOfMonth(currentMonth), "MMM d, yyyy")} -{" "}
            {format(endOfMonth(currentMonth), "MMM d, yyyy")}
          </Txt>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSearch}
            className={cn(
              "rounded-full h-10 w-10 opacity-50 hover:opacity-100 hover:bg-black/5 transition-all hover:text-black",
              isSearchOpen && "opacity-100 bg-black/5",
            )}
          >
            <Search className="size-4" />
          </Button>
          {isSearchOpen && (
            <Input
              value={searchTerm}
              onChange={(event) => onSearchTermChange(event.target.value)}
              placeholder="Filter tasks/checklists..."
              className="h-10 w-60 rounded-2xl border-black/10 bg-white/80"
            />
          )}
        </div>
        <div className="flex items-center gap-1 bg-black/[0.03] p-1 rounded-2xl border border-black/[0.03] shadow-default">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevMonth}
            className="h-9 w-9 rounded-xl hover:bg-black/5 hover:text-black transition-all"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="ghost"
            onClick={onGoToToday}
            className="h-9 px-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-black/5 hover:text-black transition-all"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextMonth}
            className="h-9 w-9 rounded-xl hover:bg-black/5 hover:text-black transition-all"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
