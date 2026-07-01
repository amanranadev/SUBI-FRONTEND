import * as React from "react";
import type { ChecklistTemplateSaveDraft } from "./template-draft";

export type PreviewTask = { category?: string; name: string };

export function useChecklistDialogs() {
  // Preview Dialog State
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewTasks, setPreviewTasks] = React.useState<PreviewTask[]>([]);
  const [previewTitle, setPreviewTitle] = React.useState("");
  const [previewAction, setPreviewAction] = React.useState<
    ((editedTasks: PreviewTask[]) => Promise<void>) | null
  >(null);
  const [previewTemplateAction, setPreviewTemplateAction] = React.useState<
    ((editedTasks: PreviewTask[]) => Promise<void>) | null
  >(null);

  // Template Dialog State
  const [templateDialogOpen, setTemplateDialogOpen] = React.useState(false);
  const [templateName, setTemplateName] = React.useState("");
  const [templateNameError, setTemplateNameError] = React.useState<string | null>(null);
  const [templateDraft, setTemplateDraft] = React.useState<ChecklistTemplateSaveDraft | null>(
    null,
  );

  const showPreview = React.useCallback(
    (
      title: string,
      tasks: PreviewTask[],
      action: (editedTasks: PreviewTask[]) => Promise<void>,
      templateAction?: (editedTasks: PreviewTask[]) => Promise<void>,
    ) => {
      setPreviewTitle(title);
      setPreviewTasks(tasks);
      setPreviewAction(() => action);
      setPreviewTemplateAction(() => (templateAction ? templateAction : null));
      setPreviewOpen(true);
    },
    [],
  );

  const openTemplateDialog = React.useCallback(
    (draft: ChecklistTemplateSaveDraft) => {
      setTemplateDraft(draft);
      setTemplateName("");
      setTemplateNameError(null);
      setTemplateDialogOpen(true);
    },
    [],
  );

  return {
    // Preview Dialog
    previewOpen,
    setPreviewOpen,
    previewTasks,
    previewTitle,
    previewAction,
    previewTemplateAction,
    showPreview,

    // Template Dialog
    templateDialogOpen,
    setTemplateDialogOpen,
    templateName,
    setTemplateName,
    templateNameError,
    setTemplateNameError,
    templateDraft,
    openTemplateDialog,
  };
}
