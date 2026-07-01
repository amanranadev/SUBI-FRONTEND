"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";

type ChecklistTemplateSaveDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templateName: string;
  templateNameError?: string | null;
  isSaving: boolean;
  onTemplateNameChange: (value: string) => void;
  onSave: () => void;
  title?: string;
  description?: string;
};

export function ChecklistTemplateSaveDialog({
  open,
  onOpenChange,
  templateName,
  templateNameError,
  isSaving,
  onTemplateNameChange,
  onSave,
  title = "Save as Checklist Template",
  description = "Enter a template name to save this checklist for reuse in future transactions.",
}: ChecklistTemplateSaveDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={(nextOpen) => {
        if (isSaving) return;
        onOpenChange(nextOpen);
      }}
      title={title}
      description={description}
      contentClassName="max-w-md rounded-[2rem] border-0 heavy-shadow"
      footerClassName="gap-2"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Template"}
          </Button>
        </>
      }
    >
      <div className="space-y-2">
        <Input
          value={templateName}
          onChange={(event) => onTemplateNameChange(event.target.value)}
          placeholder="Template name"
          disabled={isSaving}
          className={cn(templateNameError ? "border-destructive" : undefined)}
        />
        {templateNameError ? (
          <p className="text-xs font-medium text-destructive">
            {templateNameError}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
