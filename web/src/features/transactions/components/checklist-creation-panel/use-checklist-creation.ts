import * as React from "react";
import { format } from "date-fns";
import Papa from "papaparse";
import { useQuery } from "@tanstack/react-query";
import { fetchChecklistTemplateRecords, createChecklistTemplate } from "@/features/transactions/api/checklist-service";
import { CHECKLIST_NAME_SEPARATOR } from "@/features/transactions/utils/checklist-name";
import { useToast } from "@/shared/hooks/use-toast";
import { CHECKLIST_LIMITS, CHECKLIST_PATTERNS } from "./constants";
import type { CreationMode } from "./types";
import { parseChecklistCsvRows } from "./parse-checklist-csv";
import { useChecklistBuilder } from "./use-checklist-builder";
import { useChecklistDialogs, type PreviewTask } from "./use-checklist-dialogs";
import { useChecklistActions } from "./use-checklist-actions";

interface UseChecklistCreationProps {
  onChecklistReady: (checklist: { id: string; name: string }) => Promise<void> | void;
  onReadyErrorTitle: string;
  enableSavedTemplatesOption: boolean;
  onChecklistTemplateApply?: (templateId: string) => Promise<void> | void;
}

export function useChecklistCreation({
  onChecklistReady,
  onReadyErrorTitle,
  enableSavedTemplatesOption,
  onChecklistTemplateApply,
}: UseChecklistCreationProps) {
  const { toast } = useToast();
  const [mode, setMode] = React.useState<CreationMode>("selection");
  const [csvError, setCsvError] = React.useState<string | null>(null);
  const [savedTemplateSearch, setSavedTemplateSearch] = React.useState("");

  const dialogs = useChecklistDialogs();
  const actions = useChecklistActions({ onChecklistReady, onReadyErrorTitle });

  const canUseSavedTemplates = enableSavedTemplatesOption && Boolean(onChecklistTemplateApply);

  const {
    data: templateRecords,
    isLoading: isLoadingTemplates,
    isFetching: isFetchingTemplates,
  } = useQuery({
    queryKey: ["checklist-templates", "records", savedTemplateSearch],
    queryFn: () =>
      fetchChecklistTemplateRecords({
        search: savedTemplateSearch.trim() || undefined,
        page: 1,
        perPage: 100,
      }),
    enabled: mode === "saved-templates" && canUseSavedTemplates,
  });

  const validateChecklistText = React.useCallback(
    (value: string, type: "TASK_NAME" | "TASK_LABEL") => {
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.length > CHECKLIST_LIMITS[type]) {
        return `${type === "TASK_NAME" ? "Task name" : "Task label"} too long.`;
      }
      if (!CHECKLIST_PATTERNS[type].test(trimmed)) {
        return "Invalid characters used.";
      }
      return null;
    },
    [],
  );

  const builder = useChecklistBuilder({ validateChecklistText });

  const handleSaveCustom = async () => {
    if (actions.isSubmitting) return;
    const { hasErrors } = builder.validateBuilderBeforeSave();
    if (hasErrors) return;

    const flattened = builder.builderData.flatMap((cat, catIdx) => {
      const catLabel = cat.label.trim();
      return cat.subtasks
        .map((task, taskIdx) => ({
          name: catLabel.length > 0 ? `${catLabel}${CHECKLIST_NAME_SEPARATOR}${task.label.trim()}` : task.label.trim(),
          position: catIdx * 1000 + taskIdx,
        }))
        .filter((t) => t.name.length > 0);
    });

    if (flattened.length === 0) {
      toast({ title: "Checklist is empty", variant: "destructive" });
      return;
    }

    actions.setIsSubmitting(true);
    const name = `Custom Checklist ${format(new Date(), "MMM dd, yyyy")}`;
    try {
      const created = await createChecklistTemplate({
        name,
        description: "Created from builder",
        checklist_tasks_attributes: flattened.map((item) => ({
          name: item.name,
          days_offset: 0,
          priority: "MEDIUM",
          position: item.position,
        })),
      });
      await actions.handleChecklistReady({ id: created.id, name });
    } catch {
      toast({ title: "Could not save checklist", variant: "destructive" });
      actions.setIsSubmitting(false);
    }
  };

  const handleCsvFile = (file: File) => {
    setCsvError(null);
    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvError("Please upload a .csv file.");
      return;
    }

    Papa.parse<string[]>(file, {
      skipEmptyLines: "greedy",
      complete: (results) => {
        const rows = (results.data ?? []).filter((row) => Array.isArray(row));
        const parsed = parseChecklistCsvRows({ rows, warningCount: results.errors.length });

        if (parsed.error) {
          setCsvError(parsed.error);
          return;
        }

        dialogs.showPreview(
          "Import from CSV",
          parsed.tasks.map((t) => ({ category: t.category || undefined, name: t.task })),
          async (edited) => {
            const name = `Imported Checklist ${format(new Date(), "MMM dd, yyyy")}`;
            const created = await createChecklistTemplate({
              name,
              description: "Imported from CSV",
              checklist_tasks_attributes: edited.map((t, idx) => ({
                name: t.category ? `${t.category}${CHECKLIST_NAME_SEPARATOR}${t.name}` : t.name,
                days_offset: 0,
                priority: "MEDIUM",
                position: idx,
              })),
            });
            await actions.handleChecklistReady({ id: created.id, name });
          },
          async (edited) => {
            dialogs.openTemplateDialog({
              checklistName: `Imported Checklist ${format(new Date(), "MMM dd, yyyy")}`,
              description: "Imported from CSV",
              items: edited.map((t) => ({ category: t.category?.trim(), task: t.name.trim() })),
            });
          },
        );
      },
    });
  };

  const handleApplyTemplate = async (id: string) => {
    if (!onChecklistTemplateApply) return;
    try {
      await onChecklistTemplateApply(id);
    } catch {
      toast({ title: "Could not apply template", variant: "destructive" });
    }
  };

  const handlePreviewConfirm = async (edited: PreviewTask[]) => {
    if (!dialogs.previewAction || actions.isSubmitting) return;
    actions.setIsSubmitting(true);
    try {
      await dialogs.previewAction(edited);
      dialogs.setPreviewOpen(false);
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      actions.setIsSubmitting(false);
    }
  };

  return {
    mode,
    setMode,
    csvError,
    savedTemplateSearch,
    setSavedTemplateSearch,
    templateRecords,
    isLoadingTemplates: isLoadingTemplates || isFetchingTemplates,
    canUseSavedTemplates,
    builder,
    dialogs,
    actions,
    handleSaveCustom,
    handleCsvFile,
    handleApplyTemplate,
    handlePreviewConfirm,
  };
}
