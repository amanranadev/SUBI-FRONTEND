import * as React from "react";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  createChecklistTemplate,
  createChecklistTemplateRecord,
} from "@/features/transactions/api/checklist-service";
import { CHECKLIST_NAME_SEPARATOR } from "@/features/transactions/utils/checklist-name";
import { CHECKLIST_TEMPLATES_QUERY_KEY } from "@/features/transactions/hooks/use-checklist-templates";
import { useToast } from "@/shared/hooks/use-toast";
import { STANDARD_CHECKLIST_DATA } from "./constants";
import { buildTemplateTaskName, type ChecklistTemplateSaveDraft } from "./template-draft";
import type { PreviewTask } from "./use-checklist-dialogs";

interface ChecklistActionProps {
  onChecklistReady: (checklist: { id: string; name: string }) => Promise<void> | void;
  onReadyErrorTitle: string;
}

export function useChecklistActions({
  onChecklistReady,
  onReadyErrorTitle,
}: ChecklistActionProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChecklistReady = React.useCallback(
    async (checklist: { id: string; name: string }) => {
      setIsSubmitting(true);
      try {
        await queryClient.invalidateQueries({ queryKey: CHECKLIST_TEMPLATES_QUERY_KEY });
        await onChecklistReady(checklist);
      } catch {
        toast({
          title: onReadyErrorTitle,
          description: "Try again in a moment.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onChecklistReady, onReadyErrorTitle, queryClient, toast],
  );

  const handleLoadStandard = React.useCallback(async () => {
    if (isSubmitting) return;
    const checklistName = `Standard Checklist ${format(new Date(), "MMM dd, yyyy")}`;
    try {
      const attributes = STANDARD_CHECKLIST_DATA.flatMap((group, categoryIndex) =>
        group.tasks.map((taskLabel, taskIndex) => ({
          name: `${group.label}${CHECKLIST_NAME_SEPARATOR}${taskLabel}`,
          days_offset: 0,
          priority: "MEDIUM" as const,
          position: categoryIndex * 1000 + taskIndex,
        })),
      );
      const createdChecklist = await createChecklistTemplate({
        name: checklistName,
        description: "SUBI Professional template",
        checklist_tasks_attributes: attributes,
      });
      await handleChecklistReady({ id: createdChecklist.id, name: checklistName });
    } catch {
      toast({
        title: "Could not create checklist",
        description: "Try again in a moment.",
        variant: "destructive",
      });
    }
  }, [handleChecklistReady, isSubmitting, toast]);

  const handleSaveChecklistTemplate = React.useCallback(
    async (templateName: string, templateDraft: ChecklistTemplateSaveDraft | null) => {
      if (!templateName.trim() || !templateDraft) return;
      setIsSubmitting(true);
      try {
        await createChecklistTemplateRecord({
          checklist_template: {
            name: templateName.trim(),
            checklistName: templateDraft.checklistName,
            description: templateDraft.description,
            checklist_tasks_attributes: templateDraft.items.map((item, index) => ({
              name: buildTemplateTaskName(item),
              days_offset: 0,
              priority: "MEDIUM",
              position: index,
            })),
          },
        });
        toast({ title: "Checklist template saved" });
        return true;
      } catch {
        toast({
          title: "Could not save checklist template",
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [toast],
  );

  return {
    isSubmitting,
    setIsSubmitting,
    handleLoadStandard,
    handleChecklistReady,
    handleSaveChecklistTemplate,
  };
}
