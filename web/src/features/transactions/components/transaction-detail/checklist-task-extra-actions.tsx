"use client";

import { Trash2, User, UserPlus } from "lucide-react";
import { CONFIRM_MODAL_VARIANT, ConfirmModal } from "@/shared/ui/confirm-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

export type ChecklistAssignableMember = {
  id: string;
  label: string;
};

type ChecklistTaskExtraActionsProps = {
  assignedTo: string | null;
  canAssignChecklistTasks: boolean;
  assignableMembers: ChecklistAssignableMember[];
  deleteLabel: string;
  onAssign: (memberId: string | null) => void;
  onDelete: () => void;
};

export function ChecklistTaskExtraActions({
  assignedTo,
  canAssignChecklistTasks,
  assignableMembers,
  deleteLabel,
  onAssign,
  onDelete,
}: ChecklistTaskExtraActionsProps) {
  return (
    <div
      className="ml-2 flex items-center gap-1.5"
      onClick={(event) => event.stopPropagation()}
    >
      {canAssignChecklistTasks ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {assignedTo ? (
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 text-[10px] font-bold text-blue-600 transition-all hover:bg-blue-500/20"
              >
                {assignedTo}
              </button>
            ) : (
              <button
                type="button"
                className="inline-flex size-9 items-center justify-center rounded-lg text-foreground/40 transition-all hover:bg-black/5 hover:text-foreground"
              >
                <UserPlus className="size-5" />
              </button>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[180px] rounded-2xl border-0 p-2 shadow-xl"
          >
            <DropdownMenuLabel className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest opacity-40">
              Assign Task
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {assignableMembers.map((member) => (
              <DropdownMenuItem
                key={member.id}
                onClick={() => onAssign(member.id)}
                className="group h-10 gap-3 rounded-xl px-3 text-xs font-bold"
              >
                <div className="flex size-6 items-center justify-center rounded-lg bg-primary/5">
                  <User className="size-3 text-primary transition-colors group-data-[highlighted]:text-white" />
                </div>
                {member.label}
              </DropdownMenuItem>
            ))}
            {assignedTo ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onAssign(null)}
                  className="h-10 gap-3 rounded-xl px-3 text-xs font-bold text-destructive"
                >
                  Unassign
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : assignedTo ? (
        <span className="inline-flex h-9 items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-4 text-[10px] font-bold text-blue-600">
          {assignedTo}
        </span>
      ) : null}

      <ConfirmModal
        title="Remove Task?"
        description={`Delete "${deleteLabel}"?`}
        confirmLabel="Delete Item"
        cancelLabel="Cancel"
        variant={CONFIRM_MODAL_VARIANT.DESTRUCTIVE}
        onConfirm={onDelete}
        trigger={
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-xl text-destructive transition-all hover:bg-destructive/10"
          >
            <Trash2 className="size-6" />
          </button>
        }
        contentClassName="rounded-[2.5rem] border-0 p-8 shadow-xl"
        cancelButtonClassName="h-14 flex-1 !rounded-xl border-black/10 font-bold"
        confirmButtonClassName="h-14 flex-1 !rounded-xl bg-destructive font-bold text-white"
      />
    </div>
  );
}
