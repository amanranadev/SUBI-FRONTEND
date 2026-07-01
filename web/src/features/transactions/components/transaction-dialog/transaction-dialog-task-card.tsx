import * as React from "react";
import { Plus, StickyNote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { DatePickerInput } from "@/shared/ui/date-picker-input";
import { Input } from "@/shared/ui/input";

type TransactionDialogTaskCardProps = {
  title: string;
  date: string;
  calc: string;
  formName: string;
  isSelected: boolean;
  note?: string;
  onToggle: () => void;
  onDateChange: (date: string) => void;
  onNoteChange: (note: string) => void;
};

export function TransactionDialogTaskCard({
  title,
  date,
  calc,
  formName,
  isSelected,
  note,
  onToggle,
  onDateChange,
  onNoteChange,
}: TransactionDialogTaskCardProps) {
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const committedNote = note?.trim() ?? "";
  const [draftNote, setDraftNote] = React.useState(note ?? "");
  const hasDraftNote = draftNote.trim().length > 0;
  const noteSectionLabel = committedNote ? "Edit Note" : "Add Note";
  const noteActionLabel = committedNote ? "Update" : "Save";

  React.useEffect(() => {
    if (!isNoteOpen) {
      setDraftNote(note ?? "");
    }
  }, [isNoteOpen, note]);

  const handleOpenNote = React.useCallback(() => {
    setDraftNote(note ?? "");
    setIsNoteOpen(true);
  }, [note]);

  const handleCloseNote = React.useCallback(() => {
    setDraftNote(note ?? "");
    setIsNoteOpen(false);
  }, [note]);

  const handleSaveNote = React.useCallback(() => {
    onNoteChange(draftNote);
    setIsNoteOpen(false);
  }, [draftNote, onNoteChange]);

  return (
    <div
      className={cn(
        "p-6 bg-white rounded-[2.5rem] border border-black/[0.03] flex flex-col gap-3 transition-opacity",
        !isSelected && "opacity-40",
      )}
    >
      <div className="flex items-start justify-between gap-6">
        <div className="space-y-1 flex-1 min-w-0">
          <h4 className="font-bold text-lg/6 tracking-tighter">{title}</h4>
          <p className="text-xs opacity-80 font-bold tracking-tight uppercase text-primary">
            {formName}
          </p>
          {calc && (
            <p className="text-xs opacity-30 font-medium tracking-tight">
              Calculated: {calc}
            </p>
          )}
          {committedNote && !isNoteOpen && (
            <p className="text-xs text-foreground/50 font-medium truncate pt-1">
              {committedNote}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right p-0.5">
            <DatePickerInput
              value={date}
              onValueChange={onDateChange}
              className="h-10 w-40 rounded-xl text-center font-bold text-primary border-black/5 pr-10"
              iconClassName="size-3 opacity-40"
            />
            <p className="text-[10px] opacity-40 font-bold uppercase mt-1">
              Due Date
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenNote}
            title={committedNote ? "Edit note" : "Add note"}
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-full transition-all",
              committedNote
                ? "bg-black text-white shadow-sm hover:bg-black/90"
                : "text-foreground/40 hover:bg-black/[0.04] hover:text-foreground hover:shadow-sm",
            )}
          >
            <StickyNote className="size-5" strokeWidth={2} />
          </button>
          <Checkbox
            checked={isSelected}
            onCheckedChange={onToggle}
            className="size-6 rounded-lg"
          />
        </div>
      </div>

      {isNoteOpen && (
        <div className="rounded-[2rem] border border-black/5 bg-black/[0.04] p-4">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-widest text-foreground/35">
              {noteSectionLabel}
            </p>
            <button
              type="button"
              onClick={handleCloseNote}
              className="rounded-full p-1 text-foreground/25 transition-colors hover:bg-black/[0.04] hover:text-foreground/50"
              aria-label="Close note editor"
            >
              <Plus className="size-4 rotate-45" />
            </button>
          </div>
          <div className="flex w-full items-center gap-3">
            <Input
              value={draftNote}
              onChange={(event) => setDraftNote(event.target.value)}
              placeholder="Add note..."
              containerClassName="flex-1"
              className="h-14 rounded-[1.75rem] border-0 bg-white px-5 text-sm shadow-sm placeholder:text-foreground/35"
              autoFocus
            />
            <Button
              type="button"
              className={cn(
                "h-14 shrink-0 rounded-[1.5rem] px-8 font-bold",
                committedNote || hasDraftNote
                  ? "bg-green-600 text-white shadow-[0_12px_28px_rgba(34,197,94,0.22)] hover:bg-green-700"
                  : "bg-green-500/10 text-green-600 hover:bg-green-500/15 hover:text-green-700",
              )}
              onClick={handleSaveNote}
            >
              {noteActionLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
