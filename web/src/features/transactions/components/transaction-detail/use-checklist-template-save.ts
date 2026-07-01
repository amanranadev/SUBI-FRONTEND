"use client";

import * as React from "react";

import { createChecklistTemplateRecord } from "@/features/transactions/api/checklist-service";
import { splitChecklistTaskName } from "@/features/transactions/utils/checklist-name";
import { useToast } from "@/shared/hooks/use-toast";
import type { TaskListItem } from "@/features/tasks/types";

type ChecklistTemplateSummary = {
  name?: string;
  description?: string;
};

type UseChecklistTemplateSaveParams = {
  checklistTasks: TaskListItem[];
  currentChecklistTemplate?: ChecklistTemplateSummary;
};

export function useChecklistTemplateSave({
  checklistTasks,
  currentChecklistTemplate,
}: UseChecklistTemplateSaveParams) {
  const { toast } = useToast();
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [templateName, setTemplateName] = React.useState("");
  const [templateNameError, setTemplateNameError] = React.useState<
    string | null
  >(null);
  const [isSavingTemplate, setIsSavingTemplate] = React.useState(false);

  const handleTemplateNameChange = React.useCallback(
    (value: string) => {
      setTemplateName(value);
      if (templateNameError) {
        setTemplateNameError(null);
      }
    },
    [templateNameError],
  );

  const handleSaveChecklistAsTemplate = React.useCallback(async () => {
    const nextTemplateName = templateName.trim();
    if (!nextTemplateName) {
      setTemplateNameError("Template name is required.");
      return;
    }

    if (checklistTasks.length === 0) {
      toast({
        title: "Checklist is empty",
        description: "Add at least one checklist item before saving template.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingTemplate(true);
    try {
      const checklistName = currentChecklistTemplate?.name ?? "Checklist";
      await createChecklistTemplateRecord({
        checklist_template: {
          name: nextTemplateName,
          checklistName,
          description: currentChecklistTemplate?.description,
          checklist_tasks_attributes: checklistTasks.map((task, index) => {
            const parsed = splitChecklistTaskName((task.name ?? "").trim());
            const taskName =
              parsed.taskName || (task.name ?? "").trim() || "Checklist Item";
            return {
              name: parsed.category?.trim()
                ? `${parsed.category.trim()} :: ${taskName}`
                : taskName,
              days_offset: 0,
              priority: "MEDIUM",
              position: index,
            };
          }),
        },
      });

      setTemplateDialogOpen(false);
      setTemplateName("");
      setTemplateNameError(null);
      toast({
        title: "Checklist template saved",
        description: "You can now apply this template to other transactions.",
      });
    } catch {
      toast({
        title: "Could not save checklist template",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSavingTemplate(false);
    }
  }, [
    checklistTasks,
    currentChecklistTemplate?.description,
    currentChecklistTemplate?.name,
    templateName,
    toast,
  ]);

  return {
    templateDialogOpen,
    setTemplateDialogOpen,
    templateName,
    templateNameError,
    isSavingTemplate,
    handleTemplateNameChange,
    handleSaveChecklistAsTemplate,
  };
}
