"use client";

import { useRouter } from "next/navigation";
import { Txt } from "@/shared/ui";
import { TRANSACTIONS_ROUTES } from "@/features/transactions/routes";
import { CALENDAR_EVENT_KIND } from "@/features/calendar/types";
import { useCalendar } from "@/features/calendar/hooks/use-calendar";
import { CalendarHeader } from "./calendar-header";
import { CalendarDayLabels } from "./calendar-day-labels";
import { CalendarGrid } from "./calendar-grid";
import { CalendarLegend } from "./calendar-legend";

export function Calendar() {
  const router = useRouter();
  const {
    currentMonth,
    isSearchOpen,
    searchTerm,
    events,
    filteredEvents,
    normalizedSearchTerm,
    totalFilteredTaskEvents,
    totalFilteredChecklistEvents,
    isTransactionsLoading,
    isGoogleCalendarTasksLoading,
    transactionsError,
    setSearchTerm,
    nextMonth,
    prevMonth,
    goToToday,
    toggleSearch,
  } = useCalendar();

  return (
    <div className="w-full flex flex-col h-full animate-in fade-in slide-in-from-bottom-8 duration-700 origin-top scale-[0.98]">
      <CalendarHeader
        currentMonth={currentMonth}
        isSearchOpen={isSearchOpen}
        searchTerm={searchTerm}
        onToggleSearch={toggleSearch}
        onSearchTermChange={setSearchTerm}
        onPrevMonth={prevMonth}
        onNextMonth={nextMonth}
        onGoToToday={goToToday}
      />

      <div className="flex items-center justify-between">
        {normalizedSearchTerm ? (
          <Txt as="p" size="xs" weight="medium" className="mb-3 opacity-60">
            Showing {filteredEvents.length} of {events.length} events for &quot;
            {searchTerm}&quot;.
          </Txt>
        ) : null}
        <div className="flex flex-1 items-center justify-end">
          <CalendarLegend
            totalTaskEvents={totalFilteredTaskEvents}
            totalChecklistEvents={totalFilteredChecklistEvents}
            isGoogleCalendarTasksLoading={isGoogleCalendarTasksLoading}
            isTransactionsLoading={isTransactionsLoading}
            hasTransactionsError={Boolean(transactionsError)}
          />
        </div>
      </div>

      <div className="glass-card shadow-default rounded-2xl overflow-hidden flex flex-col flex-1 border-white/60">
        <CalendarDayLabels />
        <div className="subtle-scrollbar flex-1 overflow-y-auto">
          <CalendarGrid
            currentMonth={currentMonth}
            events={filteredEvents}
            onGoToChecklistItem={(transactionId, taskId, eventKind) => {
              if (eventKind === CALENDAR_EVENT_KIND.CHECKLIST) {
                router.push(
                  TRANSACTIONS_ROUTES.detailChecklist(transactionId, taskId),
                );
                return;
              }

              router.push(TRANSACTIONS_ROUTES.detailFormsAndTasks(transactionId));
            }}
          />
        </div>
      </div>
    </div>
  );
}
