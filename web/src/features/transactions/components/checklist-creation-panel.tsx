"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChecklistPreviewDialog } from "@/features/transactions/components/transaction-detail/checklist-preview-dialog";
import { ChecklistTemplateSaveDialog } from "@/features/transactions/components/checklist-template-save-dialog";

import { SelectionCards } from "./checklist-creation-panel/selection-cards";
import { CustomBuilder } from "./checklist-creation-panel/custom-builder";
import { SavedTemplatesPanel } from "./checklist-creation-panel/saved-templates-panel";
import { UploadPanel } from "./checklist-creation-panel/upload-panel";
import { useChecklistCreation } from "./checklist-creation-panel/use-checklist-creation";

type ChecklistCreationPanelProps = {
  onChecklistReady: (checklist: { id: string; name: string }) => Promise<void> | void;
  previewDescription?: string;
  onReadyErrorTitle?: string;
  className?: string;
  enableSavedTemplatesOption?: boolean;
  onChecklistTemplateApply?: (templateId: string) => Promise<void> | void;
};

export function ChecklistCreationPanel({
  onChecklistReady,
  previewDescription = "Review the tasks below before applying to this transaction.",
  onReadyErrorTitle = "Could not apply checklist",
  className,
  enableSavedTemplatesOption = false,
  onChecklistTemplateApply,
}: ChecklistCreationPanelProps) {
  const {
    mode,
    setMode,
    csvError,
    savedTemplateSearch,
    setSavedTemplateSearch,
    templateRecords,
    isLoadingTemplates,
    canUseSavedTemplates,
    builder,
    dialogs,
    actions,
    handleSaveCustom,
    handleCsvFile,
    handleApplyTemplate,
    handlePreviewConfirm,
  } = useChecklistCreation({
    onChecklistReady,
    onReadyErrorTitle,
    enableSavedTemplatesOption,
    onChecklistTemplateApply,
  });

  const csvInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className={cn("space-y-6", className)}>
      {mode === "selection" && (
        <SelectionCards
          isSubmitting={actions.isSubmitting}
          onLoadStandard={actions.handleLoadStandard}
          onStartCreate={() => {
            builder.resetBuilder();
            setMode("create");
          }}
          onLoadUpload={() => setMode("upload")}
          showSavedTemplatesOption={canUseSavedTemplates}
          onLoadSavedTemplates={() => setMode("saved-templates")}
        />
      )}

      {mode === "create" && (
        <CustomBuilder
          builderData={builder.builderData}
          builderErrors={builder.builderErrors}
          isSubmitting={actions.isSubmitting}
          canSaveTemplate={builder.customDraftItems.length > 0}
          onCategoryChange={builder.handleCategoryChange}
          onTaskChange={builder.handleTaskChange}
          onRemoveTask={builder.handleRemoveTask}
          onAddTask={builder.handleAddTask}
          onCancel={() => setMode("selection")}
          onAddCategory={builder.handleAddCategory}
          onSave={handleSaveCustom}
          onSaveAsTemplate={() =>
            dialogs.openTemplateDialog({
              checklistName: "Custom Checklist",
              description: "Created from builder",
              items: builder.customDraftItems,
            })
          }
        />
      )}

      {mode === "upload" && (
        <UploadPanel
          csvError={csvError}
          isSubmitting={actions.isSubmitting}
          csvInputRef={csvInputRef}
          onFileSelect={handleCsvFile}
          onDropFile={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleCsvFile(file);
          }}
          onBack={() => setMode("selection")}
        />
      )}

      {mode === "saved-templates" && (
        <SavedTemplatesPanel
          templates={templateRecords?.data ?? []}
          isLoading={isLoadingTemplates}
          isApplying={actions.isSubmitting}
          search={savedTemplateSearch}
          onSearchChange={setSavedTemplateSearch}
          onApply={handleApplyTemplate}
          onBack={() => setMode("selection")}
        />
      )}

      <ChecklistPreviewDialog
        open={dialogs.previewOpen}
        onOpenChange={dialogs.setPreviewOpen}
        title={dialogs.previewTitle}
        description={previewDescription}
        tasks={dialogs.previewTasks}
        onConfirm={handlePreviewConfirm}
        onSecondaryConfirm={
          dialogs.previewTemplateAction
            ? async (edited) => {
                await dialogs.previewTemplateAction?.(edited);
              }
            : undefined
        }
        isConfirming={actions.isSubmitting}
        confirmLabel="Save Checklist"
        secondaryConfirmLabel="Save as Template"
      />

      <ChecklistTemplateSaveDialog
        open={dialogs.templateDialogOpen}
        onOpenChange={dialogs.setTemplateDialogOpen}
        templateName={dialogs.templateName}
        templateNameError={dialogs.templateNameError}
        isSaving={actions.isSubmitting}
        onTemplateNameChange={dialogs.setTemplateName}
        onSave={async () => {
          const success = await actions.handleSaveChecklistTemplate(
            dialogs.templateName,
            dialogs.templateDraft,
          );
          if (success) dialogs.setTemplateDialogOpen(false);
        }}
      />
    </div>
  );
}
