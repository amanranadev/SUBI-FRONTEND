import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useWatch, type Control } from "react-hook-form";
import { ChecklistCreationPanel } from "@/features/transactions/components/checklist-creation-panel";
import { fetchChecklistTemplateRecords } from "@/features/transactions/api/checklist-service";
import { useChecklistTemplates } from "@/features/transactions/hooks/use-checklist-templates";
import { Button } from "@/shared/ui/button";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/shared/ui/accordion";
import type { TransactionFormData } from "@/features/transactions/types";
import {
  TRANSACTION_DIALOG_SECTION,
  type SectionId,
  type ValidationErrors,
} from "./shared";
import { TransactionDialogSectionCheckmark } from "./transaction-dialog-section-checkmark";
import { TransactionDialogSectionStatusBadge } from "./transaction-dialog-section-status-badge";
import { TransactionDialogTaskCard } from "./transaction-dialog-task-card";
import { splitChecklistTaskName } from "@/features/transactions/utils/checklist-name";

type TransactionDialogFormsSectionProps = {
  control: Control<TransactionFormData>;
  verifiedSections: Record<SectionId, boolean>;
  onToggleVerified: (id: SectionId) => void;
  errors: ValidationErrors;
  onTaskToggle: (taskId: string) => void;
  onTaskDateChange: (taskId: string, date: string) => void;
  onTaskNoteChange: (taskId: string, note: string) => void;
  onChecklistIdChange: (checklistId: string | null) => void;
  onChecklistTemplateIdChange: (checklistTemplateId: string | null) => void;
};

export const TransactionDialogFormsSection = React.memo(
  function TransactionDialogFormsSection({
    verifiedSections,
    onToggleVerified,
    control,
    errors,
    onTaskToggle,
    onTaskDateChange,
    onTaskNoteChange,
    onChecklistIdChange,
    onChecklistTemplateIdChange,
  }: TransactionDialogFormsSectionProps) {
    const tasks = useWatch({ control, name: "tasks", defaultValue: [] });
    const checklistId = useWatch({
      control,
      name: "checklistId",
      defaultValue: null,
    });
    const checklistTemplateId = useWatch({
      control,
      name: "checklistTemplateId",
      defaultValue: null,
    });
    const { data: checklistTemplates = [] } = useChecklistTemplates();
    const { data: checklistTemplateRecordsData } = useQuery({
      queryKey: ["checklist-template-records", "transaction-dialog-forms-section"],
      queryFn: () =>
        fetchChecklistTemplateRecords({
          page: 1,
          perPage: 100,
        }),
      enabled: Boolean(checklistTemplateId),
      staleTime: 15_000,
    });
    const savedChecklistTemplates = React.useMemo(
      () => checklistTemplateRecordsData?.data ?? [],
      [checklistTemplateRecordsData?.data],
    );
    const selectedChecklist = React.useMemo(
      () =>
        checklistId
          ? checklistTemplates.find((template) => template.id === checklistId)
          : undefined,
      [checklistId, checklistTemplates],
    );
    const selectedChecklistTemplate = React.useMemo(
      () =>
        checklistTemplateId
          ? savedChecklistTemplates.find((template) => template.id === checklistTemplateId)
          : undefined,
      [checklistTemplateId, savedChecklistTemplates],
    );
    const hasChecklistSelection = Boolean(checklistId || checklistTemplateId);
    const selectedChecklistName =
      selectedChecklist?.name ??
      selectedChecklistTemplate?.templateName ??
      selectedChecklistTemplate?.name ??
      "Custom Checklist";
    const selectedChecklistTasks = selectedChecklist
      ? selectedChecklist.tasks ?? []
      : selectedChecklistTemplate?.tasks ?? [];
    const checklistTaskPreview = React.useMemo(() => {
      return selectedChecklistTasks.slice(0, 6).map((task) => {
        const { category, taskName } = splitChecklistTaskName(task.name);
        return {
          category: category ?? "Checklist Items",
          label: taskName || task.name,
        };
      });
    }, [selectedChecklistTasks]);
    const hiddenTaskCount = Math.max(
      selectedChecklistTasks.length - checklistTaskPreview.length,
      0,
    );

    return (
      <AccordionItem
        value={TRANSACTION_DIALOG_SECTION.FORMS}
        className="border-0 bg-black/[0.02] rounded-[3rem] px-8 py-4"
      >
        <AccordionTrigger className="hover:no-underline">
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold tracking-tighter uppercase opacity-40">
              Forms and Tasks
            </span>
            <TransactionDialogSectionStatusBadge
              isVerified={verifiedSections.forms}
              hasErrors={Object.keys(errors).length > 0}
            />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-6 space-y-8">
          <div className="space-y-4">
            <p className="text-sm opacity-50 font-medium">
              Review and adjust deadlines from your transaction forms. Dates are
              automatically calculated based on key transaction events.
            </p>
            {tasks.length > 0 ? (
              <div className="space-y-4">
                {tasks.map((task) => (
                  <TransactionDialogTaskCard
                    key={task.id}
                    title={task.title}
                    date={task.date}
                    calc={task.calculation}
                    formName={task.formName}
                    isSelected={task.isSelected}
                    note={task.note}
                    onToggle={() => onTaskToggle(task.id)}
                    onDateChange={(date) => onTaskDateChange(task.id, date)}
                    onNoteChange={(note) => onTaskNoteChange(task.id, note)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-4">
                No tasks were extracted from the document.
              </p>
            )}
            {errors.tasks && (
              <p className="text-sm font-medium text-destructive">
                {errors.tasks}
              </p>
            )}
          </div>
          <div className="space-y-4 rounded-[2rem] border border-black/5 bg-white/60 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-bold tracking-tight">Checklist (Optional)</p>
                <p className="text-xs text-foreground/60">
                  Create and attach a checklist while creating this transaction.
                </p>
              </div>
              {hasChecklistSelection ? (
                <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">
                  Attached
                </span>
              ) : null}
            </div>

            {hasChecklistSelection ? (
              <div className="rounded-xl border border-black/5 bg-black/[0.02] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">
                  Selected Checklist
                </p>
                <p className="mt-1 text-sm font-semibold">
                  {selectedChecklistName}
                </p>
                {checklistTaskPreview.length > 0 ? (
                  <div className="mt-3 rounded-lg border border-black/5 bg-white/70 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-foreground/40">
                      Checklist Tasks
                    </p>
                    <div className="mt-2 space-y-1.5">
                      {checklistTaskPreview.map((task, index) => (
                        <p key={`${task.label}-${index}`} className="text-xs text-foreground/70">
                          <span className="font-semibold">{task.category}:</span>{" "}
                          {task.label}
                        </p>
                      ))}
                      {hiddenTaskCount > 0 ? (
                        <p className="text-xs font-medium text-primary">
                          +{hiddenTaskCount} more tasks
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {hasChecklistSelection ? (
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 rounded-xl px-4 text-xs font-bold text-destructive hover:bg-destructive/5"
                  onClick={() => {
                    onChecklistIdChange(null);
                    onChecklistTemplateIdChange(null);
                  }}
                >
                  Remove Checklist
                </Button>
              </div>
            ) : null}

            <ChecklistCreationPanel
              onChecklistReady={async (checklist) => {
                onChecklistIdChange(checklist.id);
                onChecklistTemplateIdChange(null);
              }}
              enableSavedTemplatesOption
              onChecklistTemplateApply={async (templateId) => {
                onChecklistIdChange(null);
                onChecklistTemplateIdChange(templateId);
              }}
              previewDescription="Review the tasks below before attaching this checklist to the transaction."
              onReadyErrorTitle="Could not attach checklist"
            />
          </div>
          <TransactionDialogSectionCheckmark
            isVerified={verifiedSections.forms}
            onToggle={() => onToggleVerified(TRANSACTION_DIALOG_SECTION.FORMS)}
          />
        </AccordionContent>
      </AccordionItem>
    );
  },
);
