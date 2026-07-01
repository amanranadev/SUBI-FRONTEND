"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  CalendarDays,
  CircleCheck,
  Layout,
  Link2,
  Pencil,
  Plus,
  StickyNote,
  Trash2,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Calendar } from "@/shared/ui/calendar";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Textarea } from "@/shared/ui/textarea";
import { cn } from "@/lib/utils";
import type { TaskListItem } from "@/features/tasks/types";
import {
  TRANSACTION_CHECKLIST_UI_STATUS,
  type TransactionChecklistUiStatus,
} from "@/features/transactions/constants/transaction-checklist";
import { Txt } from "@/shared/ui";
import { getChecklistTaskDisplayName } from "@/features/transactions/utils/checklist-name";
import { parseDateValue } from "@/shared/utils/dateUtils";

export { TRANSACTION_CHECKLIST_UI_STATUS };
export type ChecklistUiStatus = TransactionChecklistUiStatus;

export type ChecklistTaskRowProps = {
  task: TaskListItem;
  uiStatus: ChecklistUiStatus;
  isNoteOpen: boolean;
  editingNoteText: string;
  isUpdatingNote: boolean;
  isDeleting: boolean;
  onEditTask: () => void;
  onToggleDontNeed: () => void;
  onToggleDone: () => void;
  onOpenNote: () => void;
  onDeleteTask: () => void;
  onNoteTextChange: (value: string) => void;
  onSaveNote: () => void;
  onCloseNote: () => void;
  onDateChange?: (date: Date) => void;
  noteLabel?: string;
  notePlaceholder?: string;
  titleLabel?: string;
  datePlaceholder?: string;
  isChecklistItem?: boolean;
  isDateUpdating?: boolean;
  rowId?: string;
  rowClassName?: string;
  showEditButton?: boolean;
  showDeleteButton?: boolean;
  showStatusActions?: boolean;
  isGoogleCalendarEvent?: boolean;
  extraActions?: React.ReactNode;
  isEditingName?: boolean;
  editingNameText?: string;
  isUpdatingName?: boolean;
  onStartNameEdit?: () => void;
  onNameTextChange?: (value: string) => void;
  onSaveName?: () => void;
  onCancelNameEdit?: () => void;
};

type TaskDateControlProps = {
  dueDate?: Date;
  disabled: boolean;
  isUpdating: boolean;
  placeholder: string;
  onDateChange: (date: Date) => void;
};

function TaskDateControl({
  dueDate,
  disabled,
  isUpdating,
  placeholder,
  onDateChange,
}: TaskDateControlProps) {
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState<Date>(dueDate ?? new Date());

  React.useEffect(() => {
    if (dueDate) {
      setMonth(dueDate);
    }
  }, [dueDate]);

  const hasDate = Boolean(dueDate);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || isUpdating}
          onClick={(event) => {
            event.stopPropagation();
          }}
          className={cn(
            "inline-flex h-10 items-center gap-2 rounded-2xl border px-4 text-xs font-bold transition-all disabled:cursor-not-allowed disabled:opacity-50",
            hasDate
              ? "border-black/8 bg-[#faf7f1] text-foreground/70 hover:border-primary/25 hover:bg-primary/5 hover:text-primary"
              : "border-dashed border-black/10 bg-white text-foreground/45 hover:border-primary/30 hover:bg-primary/5 hover:text-primary",
          )}
          aria-label={hasDate ? "Edit task date" : "Set task date"}
        >
          <CalendarDays className="size-4" strokeWidth={2.2} />
          <span>
            {hasDate && dueDate ? format(dueDate, "dd-MMM-yyyy") : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto rounded-[2rem] border border-black/5 bg-white p-3 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Calendar
          mode="single"
          selected={dueDate}
          month={month}
          onMonthChange={setMonth}
          onSelect={(date) => {
            if (!date) return;
            onDateChange(date);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}

/**
 * Checklist row — same interaction model as the global task list, labeled for transaction checklist.
 */
export function ChecklistTaskRow({
  task,
  uiStatus,
  isNoteOpen,
  editingNoteText,
  isUpdatingNote,
  isDeleting,
  onEditTask,
  onToggleDontNeed,
  onToggleDone,
  onOpenNote,
  onDeleteTask,
  onNoteTextChange,
  onSaveNote,
  onCloseNote,
  onDateChange,
  notePlaceholder = "Add context for this checklist step...",
  titleLabel = "Checklist item",
  datePlaceholder = "Set Date",
  isChecklistItem = false,
  isDateUpdating = false,
  rowId,
  rowClassName,
  showEditButton = true,
  showDeleteButton = true,
  showStatusActions = true,
  isGoogleCalendarEvent = false,
  extraActions,
  isEditingName = false,
  editingNameText = "",
  isUpdatingName = false,
  onStartNameEdit,
  onNameTextChange,
  onSaveName,
  onCancelNameEdit,
}: ChecklistTaskRowProps) {
  const dueDate = parseDateValue(task.dueDate);
  const hasNote = Boolean(task.description?.trim());
  const hasDraftNote = Boolean(editingNoteText.trim());
  const noteSectionLabel = hasNote ? "Edit Note" : "Add Note";
  const noteActionLabel = hasNote ? "Update" : "Save";
  const isPrimaryNoteAction = hasNote || hasDraftNote;
  const isSkipped = uiStatus === TRANSACTION_CHECKLIST_UI_STATUS.DONT_NEED;
  const areTaskButtonsDisabled = isDeleting || isSkipped;
  const canInlineEditName = Boolean(
    onStartNameEdit && onNameTextChange && onSaveName && onCancelNameEdit,
  );
  const displayTaskName = isChecklistItem
    ? getChecklistTaskDisplayName(task.name, "Untitled")
    : task.name || "Untitled";

  return (
    <div id={rowId} className={cn("flex flex-col", rowClassName)}>
      <div
        role={!areTaskButtonsDisabled ? "button" : undefined}
        tabIndex={!areTaskButtonsDisabled ? 0 : -1}
        onClick={() => {
          if (!areTaskButtonsDisabled) {
            onOpenNote();
          }
        }}
        onKeyDown={(e) => {
          if (!areTaskButtonsDisabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            onOpenNote();
          }
        }}
        className={cn(
          "flex flex-wrap items-center gap-4 rounded-[2rem] border border-black/5 bg-white p-5 transition-all dark:border-white/10 md:flex-nowrap md:gap-5",
          !areTaskButtonsDisabled && "cursor-pointer",
          isSkipped && "bg-black/[0.01]",
          isNoteOpen && "rounded-b-none border-b-0 shadow-none",
        )}
      >
        <div className="flex shrink-0 flex-wrap gap-2 md:gap-3">
          {showEditButton ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onEditTask();
              }}
              disabled={areTaskButtonsDisabled}
              className="h-10 !rounded-2xl bg-black/5 px-4 text-[10px] font-bold uppercase tracking-widest text-foreground/40 hover:bg-black/10 disabled:cursor-not-allowed disabled:bg-black/[0.04] disabled:text-foreground/25"
            >
              <span className="inline-flex items-center gap-2">
                <Pencil className="size-3.5" />
                Edit
              </span>
            </Button>
          ) : null}
          {showStatusActions ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDontNeed();
                }}
                disabled={isDeleting}
                className={cn(
                  "h-10 !rounded-2xl px-4 text-[10px] font-bold uppercase tracking-widest disabled:cursor-not-allowed",
                  isSkipped
                    ? "bg-neutral-500 text-white"
                    : "bg-black/5 text-foreground/40 hover:bg-black/10 disabled:bg-black/[0.04] disabled:text-foreground/25",
                )}
              >
                SKIP
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleDone();
                }}
                disabled={areTaskButtonsDisabled}
                className={cn(
                  "h-10 !rounded-2xl px-4 text-[10px] font-bold uppercase tracking-widest disabled:cursor-not-allowed hover:text-green-600",
                  uiStatus === TRANSACTION_CHECKLIST_UI_STATUS.DONE
                    ? "bg-green-500 text-white hover:bg-green-600 hover:text-green-500"
                    : "bg-green-500/5 text-green-600 hover:bg-green-500/10 disabled:bg-green-500/[0.08] disabled:text-green-600/40",
                )}
              >
                Done
              </Button>
            </>
          ) : null}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-stretch gap-3">
            <span
              className="inline-flex w-9 shrink-0 self-stretch items-center justify-center rounded-[.9rem] border border-black/5 bg-black/[0.03] text-neutral-400 shadow-xs"
              onClick={(event) => event.stopPropagation()}
            >
              {isChecklistItem ? (
                <CircleCheck className="size-4" strokeWidth={2.5} />
              ) : isGoogleCalendarEvent ? (
                <CalendarDays className="size-4" strokeWidth={2.2} />
              ) : (
                <Layout className="size-4" strokeWidth={3} />
              )}
            </span>
            <div
              className="min-w-0"
              onClick={(event) => event.stopPropagation()}
            >
              {isGoogleCalendarEvent ? (
                <p className="truncate text-[10px] font-medium text-muted-foreground">
                  Google Calendar
                </p>
              ) : (
                <p
                  className={cn(
                    "truncate text-[9px] font-bold uppercase tracking-widest text-primary/60",
                    isSkipped && "line-through",
                  )}
                >
                  {titleLabel}
                </p>
              )}
              {isGoogleCalendarEvent && titleLabel ? (
                <p className="truncate text-[9px] text-muted-foreground/80">
                  {titleLabel}
                </p>
              ) : null}
              {canInlineEditName && isEditingName ? (
                <Input
                  value={editingNameText}
                  onChange={(event) => onNameTextChange?.(event.target.value)}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => {
                    event.stopPropagation();
                    if (event.key === "Enter") {
                      event.preventDefault();
                      onSaveName?.();
                    }
                    if (event.key === "Escape") {
                      event.preventDefault();
                      onCancelNameEdit?.();
                    }
                  }}
                  onBlur={() => onSaveName?.()}
                  autoFocus
                  disabled={areTaskButtonsDisabled || isUpdatingName}
                  className="h-10 rounded-[1rem] border-black/10 bg-white px-3 text-base font-bold tracking-tight shadow-none"
                  aria-label="Edit checklist item name"
                />
              ) : canInlineEditName ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    if (!areTaskButtonsDisabled) {
                      onStartNameEdit?.();
                    }
                  }}
                  disabled={areTaskButtonsDisabled || isUpdatingName}
                  className={cn(
                    "block max-w-full truncate text-left text-base font-bold tracking-tight transition-colors",
                    !areTaskButtonsDisabled && "cursor-text hover:text-primary",
                    (areTaskButtonsDisabled || isUpdatingName) && "opacity-70",
                    isSkipped && "line-through opacity-40",
                    uiStatus === TRANSACTION_CHECKLIST_UI_STATUS.DONE &&
                      "text-green-600",
                  )}
                >
                  {displayTaskName}
                </button>
              ) : (
                <span
                  className={cn(
                    "block truncate text-base font-bold tracking-tight",
                    isSkipped && "line-through opacity-40",
                    uiStatus === TRANSACTION_CHECKLIST_UI_STATUS.DONE &&
                      "text-green-600",
                  )}
                >
                  {displayTaskName}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          {onDateChange ? (
            <TaskDateControl
              dueDate={dueDate}
              disabled={areTaskButtonsDisabled}
              isUpdating={isDateUpdating}
              placeholder={datePlaceholder}
              onDateChange={onDateChange}
            />
          ) : dueDate ? (
            <span
              className="text-xs font-bold text-muted-foreground opacity-60"
              onClick={(event) => event.stopPropagation()}
            >
              {task.parentTaskId ? (
                <span className="flex items-center gap-1">
                  <Link2 className="size-[18px]" />
                  {format(dueDate, "MMM d, yyyy")}
                </span>
              ) : (
                format(dueDate, "MMM d, yyyy")
              )}
            </span>
          ) : null}
          <button
            type="button"
            disabled={areTaskButtonsDisabled}
            onClick={(e) => {
              e.stopPropagation();
              onOpenNote();
            }}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none",
              hasNote
                ? "bg-black text-white shadow-sm hover:bg-black/90"
                : "text-foreground/40 hover:bg-black/[0.04] hover:text-foreground hover:shadow-sm",
            )}
          >
            <StickyNote className="size-5" strokeWidth={2} />
          </button>

          {extraActions}

          {showDeleteButton ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteTask();
              }}
              disabled={isDeleting}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-red-500 transition-all hover:bg-red-500/10 hover:text-red-500 hover:shadow-sm disabled:cursor-not-allowed disabled:text-red-300 disabled:hover:bg-transparent disabled:hover:shadow-none"
            >
              <Trash2 className="size-5" strokeWidth={2} />
            </button>
          ) : null}
        </div>
      </div>

      {isNoteOpen ? (
        <div className="animate-in fade-in slide-in-from-top-2 z-0 rounded-[2rem] rounded-t-none border border-black/5 border-t-0 bg-black/[0.04] p-6 backdrop-blur-sm duration-200">
          <div className="mb-5 flex items-center justify-between">
            <Label className="ml-2 text-[11px] font-bold uppercase tracking-widest text-foreground/35">
              {noteSectionLabel}
            </Label>
            <button
              type="button"
              onClick={onCloseNote}
              className="rounded-full p-1 text-foreground/25 transition-colors hover:bg-black/[0.04] hover:text-foreground/50"
              aria-label="Close note editor"
            >
              <Plus className="size-4 rotate-45" />
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center ">
              <Textarea
                value={editingNoteText}
                onChange={(e) => onNoteTextChange(e.target.value)}
                placeholder={notePlaceholder}
                rows={1}
                wrap="off"
                className="min-h-16 flex-1 resize-none whitespace-nowrap rounded-[1.75rem] border-0 bg-white px-5 py-4 text-base shadow-sm placeholder:text-foreground/35 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:ring-1 focus-visible:ring-black/10"
              />
              <Button
                type="button"
                onClick={onSaveNote}
                disabled={isUpdatingNote}
                className={cn(
                  "h-16 shrink-0 rounded-[1.5rem] px-8 font-bold md:self-stretch",
                  isPrimaryNoteAction
                    ? "bg-green-600 text-white shadow-[0_12px_28px_rgba(34,197,94,0.22)] hover:bg-green-700"
                    : "bg-green-500/10 text-green-600 hover:bg-green-500/15 hover:text-green-700",
                )}
              >
                {isUpdatingNote ? "Saving..." : noteActionLabel}
              </Button>
            </div>
            {task.information ? (
              <div className="space-y-1 border-t border-black/[0.05] pt-4">
                <Txt className="text-[11px] font-bold uppercase tracking-widest text-foreground/45">
                  System information
                </Txt>
                <Txt as="p" className="text-sm leading-6">
                  {task.information}
                </Txt>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
