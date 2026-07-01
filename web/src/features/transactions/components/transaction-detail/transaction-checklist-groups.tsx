"use client";

import type { TaskListItem } from "@/features/tasks/types";
import { buildChecklistGroupRows } from "@/features/transactions/components/transaction-detail/checklist-group-rows-builder";
import type { ChecklistGroup } from "@/features/transactions/components/transaction-detail/checklist-grouping";
import type { ChecklistAssignableMember } from "@/features/transactions/components/transaction-detail/checklist-task-extra-actions";
import { TransactionTaskList } from "@/features/transactions/components/transaction-detail/transaction-task-list";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";

type TransactionChecklistGroupsProps = {
  groups: ChecklistGroup[];
  openGroupIds: string[];
  onOpenGroupIdsChange: (value: string[]) => void;
  checklistTaskMap: Map<string, TaskListItem>;
  highlightedTaskId?: string | null;
  openNoteId: string | null;
  editingNoteText: string;
  editingNameId: string | null;
  editingNameText: string;
  isMutatingTaskId: string | null;
  canAssignChecklistTasks: boolean;
  assignableMembers: ChecklistAssignableMember[];
  onSetTaskStatus: (task: TaskListItem, status: "dont-need" | "done") => void;
  onOpenNoteEditor: (task: TaskListItem) => void;
  onDeleteTask: (taskId: string) => void;
  onSaveNote: (task: TaskListItem) => void;
  onCloseNote: () => void;
  onNoteTextChange: (value: string) => void;
  onUpdateDueDate: (task: TaskListItem, date: Date) => void;
  onAssignTask: (task: TaskListItem, assigneeId: string | null) => void;
  resolveAssignedTo: (task: TaskListItem) => string | null;
  onStartNameEdit: (task: TaskListItem) => void;
  onNameTextChange: (value: string) => void;
  onSaveName: (task: TaskListItem) => void;
  onCancelNameEdit: () => void;
};

export function TransactionChecklistGroups({
  groups,
  openGroupIds,
  onOpenGroupIdsChange,
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
  resolveAssignedTo,
  onStartNameEdit,
  onNameTextChange,
  onSaveName,
  onCancelNameEdit,
}: TransactionChecklistGroupsProps) {
  return (
    <Accordion
      type="multiple"
      value={openGroupIds}
      onValueChange={onOpenGroupIdsChange}
      className="w-full space-y-4"
    >
      {groups.map((group) => (
        <AccordionItem key={group.id} value={group.id} className="border-0">
          <div className="glass-card shadow-default rounded-[1.5rem] px-5 py-2">
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
                  resolveAssignedTo,
                })}
              />
            </AccordionContent>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
