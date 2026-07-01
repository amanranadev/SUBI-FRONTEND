"use client";

import * as React from "react";
import { useAllTasksWithGoogleEvents } from "@/features/tasks/hooks/use-all-tasks-with-google-events";
import { useTasksFilter } from "@/features/tasks/hooks/use-tasks-filter";
import { useTaskActions } from "@/features/tasks/hooks/use-task-actions";
import { isGoogleCalendarTask } from "@/features/calendar/utils/is-google-calendar-task";
import type { TaskListItem, TasksViewTask } from "@/features/tasks/types";
import { useTransactions } from "@/features/transactions/hooks/use-transactions";
import { TRANSACTION_TASK_TYPES } from "@/features/transactions/types/transaction-task";
import type { TransactionTask } from "@/features/transactions/types/transaction-task";
import { ConfirmModal, type ConfirmModalRef, CONFIRM_MODAL_VARIANT } from "@/shared/ui/confirm-modal";
import { TasksHeader } from "../components/tasks-header";
import { TasksToolbar } from "../components/tasks-toolbar";
import { TasksContent } from "../components/tasks-content";

type EditModalMode = "native" | "google-calendar";

export function TasksView() {
  const {
    data: backendTasks = [],
    isLoading: isLoadingTasks,
    isGoogleLoading,
    googleError,
  } = useAllTasksWithGoogleEvents({});

  const { data: transactions = [] } = useTransactions();
  const transactionNamesById = React.useMemo(() => {
    return new Map(transactions.map((t) => [t.id, t.address]));
  }, [transactions]);

  const {
    groupedTaskEntries,
    state: filterState,
    actions: filterActions,
  } = useTasksFilter({
    backendTasks,
    transactionNamesById,
  });

  const [editingTask, setEditingTask] = React.useState<TransactionTask | null>(null);
  const [openNoteId, setOpenNoteId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editModalMode, setEditModalMode] = React.useState<EditModalMode>("native");
  const [editingNoteText, setEditingNoteText] = React.useState("");
  const confirmModalRef = React.useRef<ConfirmModalRef>(null);

  const taskDetailsById = React.useMemo(() => {
    const map = new Map<string, TaskListItem | import("@/features/calendar/types/google-calendar-event").GoogleCalendarEventMapped>();
    backendTasks.forEach((task) => {
      if (task.id) map.set(task.id, task);
    });
    return map;
  }, [backendTasks]);

  const { state: actionState, actions: taskActions } = useTaskActions({
    taskDetailsById,
    openNoteId,
    setOpenNoteId,
    editingNoteText,
    setEditingNoteText,
    setStatusOverride: filterActions.setStatusOverride,
    setNoteOverride: filterActions.setNoteOverride,
    clearNoteOverride: filterActions.clearNoteOverride,
  });

  const handleOpenNote = (task: TasksViewTask) => {
    if (openNoteId === task.id) {
      setOpenNoteId(null);
      return;
    }
    setEditingNoteText(task.note || "");
    setOpenNoteId(task.id);
  };

  const handleEditTask = (task: TasksViewTask) => {
    const sourceTask = task.sourceTask;
    const isGoogleTask = isGoogleCalendarTask(sourceTask);

    setEditingTask({
      id: task.id,
      name: sourceTask?.name || task.title,
      description: task.note || "",
      information: sourceTask?.information || task.information || "",
      completed: sourceTask?.completed ?? false,
      dueDate: sourceTask?.dueDate || task.dueDate || task.date,
      transactionId: sourceTask?.transactionId || task.transactionId,
      type: sourceTask?.type || TRANSACTION_TASK_TYPES.TASK,
    });
    setEditModalMode(isGoogleTask ? "google-calendar" : "native");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditingTask(null);
    setEditModalMode("native");
    setIsModalOpen(false);
  };

  const handleRequestDeleteTask = React.useCallback(async (task: TasksViewTask) => {
    const confirmed = await confirmModalRef.current?.confirm({
      title: "Delete task",
      description: "Do you want to delete this task? This action cannot be undone.",
      confirmLabel: "Delete",
      variant: CONFIRM_MODAL_VARIANT.DANGER,
    });

    if (confirmed) {
      await taskActions.handleDeleteTask(task);
    }
  }, [taskActions]);

  return (
    <div className="w-full max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-8 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="shrink-0">
        <div className="flex flex-col gap-4 border-b border-black/[0.03] pb-6 xl:flex-row xl:items-end xl:justify-between">
          <TasksHeader />
          <TasksToolbar
            isSearchOpen={filterState.isSearchOpen}
            searchInputValue={filterState.searchInputValue}
            taskFilterMode={filterState.taskFilterMode}
            listFilters={filterState.listFilters}
            hasActiveFilters={filterState.hasActiveFilters}
            onSearchChange={filterActions.setSearchInputValue}
            onSearchDebouncedChange={filterActions.applySearchTerm}
            onToggleSearch={filterActions.toggleSearch}
            onFilterModeChange={filterActions.setTaskFilterMode}
            onApplyListFilters={filterActions.applyTaskFilters}
          />
        </div>
      </div>

      <TasksContent
        isLoadingTasks={isLoadingTasks}
        isGoogleLoading={isGoogleLoading}
        googleError={googleError}
        groupedTaskEntries={groupedTaskEntries}
        appliedSearchTerm={filterState.appliedSearchTerm}
        isModalOpen={isModalOpen}
        editingTask={editingTask}
        editModalMode={editModalMode}
        backendTasks={backendTasks}
        pendingTaskActions={actionState.pendingTaskActions}
        openNoteId={openNoteId}
        editingNoteText={editingNoteText}
        isUpdatingNote={actionState.isUpdatingNote}
        actions={{
          handleCloseModal,
          handleSaveTask: taskActions.handleSaveTask,
          handleToggleDone: taskActions.handleToggleDone,
          handleToggleDontNeed: taskActions.handleToggleDontNeed,
          handleRequestDeleteTask,
          handleUpdateTaskDate: taskActions.handleUpdateTaskDate,
          handleOpenNote,
          setEditingNoteText,
          handleUpdateNote: taskActions.handleUpdateNote,
          handleEditTask,
          setOpenNoteId,
        }}
      />

      <ConfirmModal ref={confirmModalRef} />
    </div>
  );
}
