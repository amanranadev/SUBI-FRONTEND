"use client";

import * as React from "react";
import { GenericTaskModal } from "@/features/tasks/components/generic-task-modal";
import { TasksList } from "./tasks-list";
import type { TaskListItem, TasksViewTask, TasksViewPendingTaskAction } from "../types";
import type { TransactionTask } from "@/features/transactions/types/transaction-task";

interface TasksContentProps {
  isLoadingTasks: boolean;
  isGoogleLoading: boolean;
  googleError: Error | null;
  groupedTaskEntries: [string, TasksViewTask[]][];
  appliedSearchTerm: string;
  isModalOpen: boolean;
  editingTask: TransactionTask | null;
  editModalMode: "native" | "google-calendar";
  backendTasks: TaskListItem[];
  pendingTaskActions: Record<string, TasksViewPendingTaskAction | undefined>;
  openNoteId: string | null;
  editingNoteText: string;
  isUpdatingNote: boolean;
  actions: {
    handleCloseModal: () => void;
    handleSaveTask: (task: TransactionTask) => Promise<boolean>;
    handleToggleDone: (task: TasksViewTask) => void;
    handleToggleDontNeed: (task: TasksViewTask) => void;
    handleRequestDeleteTask: (task: TasksViewTask) => void;
    handleUpdateTaskDate: (task: TasksViewTask, date: Date) => void;
    handleOpenNote: (task: TasksViewTask) => void;
    setEditingNoteText: (text: string) => void;
    handleUpdateNote: (task: TasksViewTask) => void;
    handleEditTask: (task: TasksViewTask) => void;
    setOpenNoteId: (id: string | null) => void;
  };
}

export function TasksContent({
  isLoadingTasks,
  isGoogleLoading,
  googleError,
  groupedTaskEntries,
  appliedSearchTerm,
  isModalOpen,
  editingTask,
  editModalMode,
  backendTasks,
  pendingTaskActions,
  openNoteId,
  editingNoteText,
  isUpdatingNote,
  actions,
}: TasksContentProps) {
  return (
    <div className="subtle-scrollbar flex-1 min-h-0 overflow-y-auto pr-4 pb-32 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="space-y-12">
        <GenericTaskModal
          isOpen={isModalOpen}
          onClose={actions.handleCloseModal}
          onSave={actions.handleSaveTask}
          initialData={editingTask}
          title={editingTask ? "Edit Task" : "Add Task"}
          subtitle={
            editingTask
              ? "Update the task details"
              : "Create a task for a transaction"
          }
          showTransactionSelector={editModalMode === "native"}
          availableTasks={
            editingTask?.transactionId
              ? backendTasks.filter(
                  (t) => t.transactionId === editingTask.transactionId,
                )
              : []
          }
        />

        <TasksList
          isLoading={isLoadingTasks}
          isGoogleLoading={isGoogleLoading}
          googleError={googleError}
          groupedTaskEntries={groupedTaskEntries}
          appliedSearchTerm={appliedSearchTerm}
          pendingTaskActions={pendingTaskActions}
          openNoteId={openNoteId}
          editingNoteText={editingNoteText}
          isUpdatingNote={isUpdatingNote}
          actions={{
            handleToggleDone: actions.handleToggleDone,
            handleToggleDontNeed: actions.handleToggleDontNeed,
            handleRequestDeleteTask: actions.handleRequestDeleteTask,
            handleUpdateTaskDate: actions.handleUpdateTaskDate,
            handleOpenNote: actions.handleOpenNote,
            setEditingNoteText: actions.setEditingNoteText,
            handleUpdateNote: actions.handleUpdateNote,
            handleEditTask: actions.handleEditTask,
            setOpenNoteId: actions.setOpenNoteId,
          }}
        />
      </div>
    </div>
  );
}
