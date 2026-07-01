import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import { TransactionTaskList } from "@/features/transactions/components/transaction-detail/transaction-task-list";
import { buildChecklistGroupRows } from "@/features/transactions/components/transaction-detail/checklist-group-rows-builder";
import { ChecklistAddItemForm } from "@/features/transactions/components/transaction-detail/checklist-add-item-form";
import { resolveChecklistAssigneeLabel } from "@/features/transactions/utils/checklist-assignee";
import type { TaskListItem } from "@/features/tasks/types";
import type { ChecklistGroup } from "@/features/transactions/components/transaction-detail/checklist-grouping";
import type { ChecklistAssignableMember } from "@/features/transactions/components/transaction-detail/checklist-task-extra-actions";
import type { User } from "@/lib/auth/types";
import type { ChecklistStatus } from "@/features/transactions/hooks/use-checklist-actions";

interface ChecklistActiveViewProps {
  currentChecklist: ChecklistGroup[];
  openChecklistGroupIds: string[];
  setOpenChecklistGroupIds: (ids: string[]) => void;
  checklistTaskMap: Map<string, TaskListItem>;
  highlightedTaskId?: string | null;
  openNoteId: string | null;
  editingNoteText: string;
  editingNameId: string | null;
  editingNameText: string;
  isMutatingTaskId: string | null;
  canAssignChecklistTasks: boolean;
  assignableMembers: ChecklistAssignableMember[];
  assigneeById: Map<string, string>;
  user: User | null;
  onSetTaskStatus: (task: TaskListItem, status: Exclude<ChecklistStatus, "none">) => void;
  onOpenNoteEditor: (task: TaskListItem) => void;
  onDeleteTask: (taskId: string) => void;
  onSaveNote: (task: TaskListItem) => void;
  onCloseNote: () => void;
  onNoteTextChange: (text: string) => void;
  onUpdateDueDate: (task: TaskListItem, date: Date) => void;
  onAssignTask: (task: TaskListItem, assigneeId: string | null) => void;
  onStartNameEdit: (task: TaskListItem) => void;
  onNameTextChange: (text: string) => void;
  onSaveName: (task: TaskListItem) => void;
  onCancelNameEdit: () => void;
  onCreateChecklistItem: (params: {
    groupLabel: string;
    itemName: string;
  }) => Promise<boolean>;
  isCreatingChecklistItem: boolean;
}

export function ChecklistActiveView({
  currentChecklist,
  openChecklistGroupIds,
  setOpenChecklistGroupIds,
  checklistTaskMap,
  highlightedTaskId,
  openNoteId,
  editingNoteText,
  editingNameId,
  editingNameText,
  isMutatingTaskId,
  canAssignChecklistTasks,
  assignableMembers,
  assigneeById,
  user,
  onSetTaskStatus,
  onOpenNoteEditor,
  onDeleteTask,
  onSaveNote,
  onCloseNote,
  onNoteTextChange,
  onUpdateDueDate,
  onAssignTask,
  onStartNameEdit,
  onNameTextChange,
  onSaveName,
  onCancelNameEdit,
  onCreateChecklistItem,
  isCreatingChecklistItem,
}: ChecklistActiveViewProps) {
  const checklistCategoryLabels = React.useMemo(
    () => currentChecklist.map((group) => group.label).filter(Boolean),
    [currentChecklist],
  );

  return (
    <div className="space-y-4">
      <Accordion
        type="multiple"
        value={openChecklistGroupIds}
        onValueChange={setOpenChecklistGroupIds}
        className="w-full space-y-4"
      >
        {currentChecklist.map((group) => (
          <AccordionItem
            key={group.id}
            value={group.id}
            className="border-0 glass-card rounded-[1.5rem] px-5 py-2"
          >
            <AccordionTrigger className="hover:no-underline py-2">
              <span className="text-sm font-bold uppercase tracking-widest opacity-30">
                {group.label}
              </span>
            </AccordionTrigger>
            <AccordionContent className="pt-4 space-y-2">
              <TransactionTaskList
                className="space-y-2"
                rows={buildChecklistGroupRows({
                  groupLabel: group.label,
                  subtasks: group.subtasks ?? [],
                  checklistTaskMap,
                  highlightedTaskId,
                  openNoteId,
                  editingNoteText,
                  editingNameId,
                  editingNameText,
                  isMutatingTaskId,
                  canAssignChecklistTasks,
                  assignableMembers,
                  onSetTaskStatus,
                  onOpenNoteEditor,
                  onDeleteTask,
                  onSaveNote,
                  onCloseNote,
                  onNoteTextChange,
                  onUpdateDueDate,
                  onAssignTask,
                  onStartNameEdit,
                  onNameTextChange,
                  onSaveName,
                  onCancelNameEdit,
                  resolveAssignedTo: (task) =>
                    resolveChecklistAssigneeLabel({
                      task,
                      assigneeById,
                      currentUser: user,
                    }) ?? null,
                })}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="glass-card rounded-[1.5rem] px-5 py-5">
        <ChecklistAddItemForm
          categoryOptions={checklistCategoryLabels}
          onAddItem={onCreateChecklistItem}
          disabled={isCreatingChecklistItem}
        />
      </div>
    </div>
  );
}
