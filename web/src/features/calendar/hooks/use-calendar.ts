"use client"

import * as React from "react"
import { addMonths, endOfMonth, startOfMonth, subMonths } from "date-fns"
import { useGoogleCalendarEvents } from "@/features/calendar/hooks/use-google-calendar-events"
import { useIsGoogleCalendarConnected } from "@/features/calendar/hooks/use-is-google-calendar-connected"
import { buildCalendarEvents } from "@/features/calendar/utils/build-calendar-events"
import { useAllTasks } from "@/features/tasks/hooks/use-all-tasks"
import { useTransactions } from "@/features/transactions/hooks/use-transactions"
import { CALENDAR_EVENT_KIND } from "@/features/calendar/types"

export function useCalendar() {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")
  const { data: backendTasks = [], isLoading: isTasksLoading, error: tasksError } =
    useAllTasks()
  const { isConnected } = useIsGoogleCalendarConnected()
  const calendarTimeMin = startOfMonth(currentMonth).toISOString()
  const calendarTimeMax = endOfMonth(currentMonth).toISOString()
  const {
    googleEvents: rawGoogleEvents,
    isLoading: googleEventsLoading,
    error: googleEventsError,
  } = useGoogleCalendarEvents({
    timeMin: calendarTimeMin,
    timeMax: calendarTimeMax,
    enabled: isConnected,
  })
  const {
    data: transactions = [],
    isLoading: isTransactionsQueryLoading,
    error: transactionsError,
  } = useTransactions()

  const allEvents = React.useMemo(
    () =>
      buildCalendarEvents({
        backendTasks,
        transactions,
        googleEvents: rawGoogleEvents,
      }),
    [backendTasks, rawGoogleEvents, transactions],
  )

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredEvents = React.useMemo(() => {
    if (!normalizedSearchTerm) return allEvents

    return allEvents.filter((event) => {
      const searchableText = [event.title, event.kind, event.transactionAddress]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(normalizedSearchTerm)
    })
  }, [allEvents, normalizedSearchTerm])

  const totalFilteredTaskEvents = React.useMemo(
    () =>
      filteredEvents.filter((event) => event.kind === CALENDAR_EVENT_KIND.TASK)
        .length,
    [filteredEvents],
  )

  const totalFilteredChecklistEvents = React.useMemo(
    () =>
      filteredEvents.filter(
        (event) => event.kind === CALENDAR_EVENT_KIND.CHECKLIST,
      ).length,
    [filteredEvents],
  )

  const nextMonth = React.useCallback(
    () => setCurrentMonth((prev) => addMonths(prev, 1)),
    [],
  )
  const prevMonth = React.useCallback(
    () => setCurrentMonth((prev) => subMonths(prev, 1)),
    [],
  )
  const goToToday = React.useCallback(() => setCurrentMonth(new Date()), [])
  const toggleSearch = React.useCallback(
    () => setIsSearchOpen((prev) => !prev),
    [],
  )

  return {
    currentMonth,
    isSearchOpen,
    searchTerm,
    events: allEvents,
    filteredEvents,
    normalizedSearchTerm,
    totalFilteredTaskEvents,
    totalFilteredChecklistEvents,
    isTransactionsLoading: isTasksLoading || isTransactionsQueryLoading,
    isGoogleCalendarTasksLoading: isConnected && googleEventsLoading,
    transactionsError: tasksError ?? transactionsError ?? null,
    googleEventsLoading,
    googleEventsError,
    setSearchTerm,
    nextMonth,
    prevMonth,
    goToToday,
    toggleSearch,
  }
}
