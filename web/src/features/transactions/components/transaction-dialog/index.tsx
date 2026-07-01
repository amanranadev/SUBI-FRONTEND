"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Accordion } from "@/shared/ui/accordion";
import { Form } from "@/shared/ui/form";
import { cn } from "@/lib/utils";
import {
  TRANSACTION_DIALOG_DEFAULT_OPEN_SECTIONS,
  TRANSACTION_DIALOG_SECTION,
  type SectionId,
  type TransactionDialogProps,
} from "./shared";
import { ReviewHeader } from "./review-header";
import { TransactionDialogSummarySection } from "./transaction-dialog-summary-section";
import { TransactionDialogClientsSection } from "./transaction-dialog-clients-section";
import { TransactionDialogPropertySection } from "./transaction-dialog-property-section";
import { TransactionDialogFormsSection } from "./transaction-dialog-forms-section";
import { useTransactionDialogForm } from "./use-transaction-dialog-form";

export function TransactionDialog({
  isOpen,
  onOpenChange,
  onSave,
  initialData,
  sourceFileId,
  isSaving = false,
  discardButtonLabel = "Discard Draft",
  saveButtonLabel = "Save Transaction",
  saveButtonLoadingLabel = "Saving transaction...",
}: TransactionDialogProps) {
  const {
    form,
    verifiedSections,
    sectionErrors,
    allVerified,
    handleSave,
    handleDiscard,
    handleTaskToggle,
    handleTaskDateChange,
    handleTaskNoteChange,
    handleChecklistIdChange,
    handleChecklistTemplateIdChange,
    handleDateCascade,
    toggleVerified,
  } = useTransactionDialogForm({
    initialData,
    isOpen,
    onSave,
    onOpenChange,
  });

  const [openSections, setOpenSections] = React.useState<SectionId[]>(
    TRANSACTION_DIALOG_DEFAULT_OPEN_SECTIONS,
  );

  React.useEffect(() => {
    if (isOpen) {
      setOpenSections(TRANSACTION_DIALOG_DEFAULT_OPEN_SECTIONS);
    }
  }, [isOpen]);

  const handleToggleVerified = React.useCallback(
    (id: SectionId) => {
      const didVerify = toggleVerified(id);
      if (!didVerify) return;

      setOpenSections((prev) => prev.filter((section) => section !== id));
    },
    [toggleVerified],
  );

  return (
    <Modal
      open={isOpen}
      onOpenChange={onOpenChange}
      hideHeader
      ariaDescribedBy={undefined}
      overlayClassName="bg-black/80"
      onInteractOutside={(event) => event.preventDefault()}
      contentClassName="max-w-5xl h-[90vh] rounded-default flex flex-col p-0 overflow-visible border-0 shadow-default [@media(max-height:720px)]:inset-0 [@media(max-height:720px)]:left-0 [@media(max-height:720px)]:top-0 [@media(max-height:720px)]:h-dvh [@media(max-height:720px)]:max-h-dvh [@media(max-height:720px)]:w-screen [@media(max-height:720px)]:max-w-none [@media(max-height:720px)]:translate-x-0 [@media(max-height:720px)]:translate-y-0 [@media(max-height:720px)]:rounded-none sm:!rounded-default [@media(max-height:720px)]:sm:!rounded-none"
      footerClassName="p-5 w-full border-t border-black/[0.03] flex justify-between items-center gap-4 [@media(max-height:720px)]:gap-2 [@media(max-height:720px)]:py-2 [@media(max-height:720px)]:px-4"
      footer={
        <>
          <Button
            variant="outline-dark"
            onClick={handleDiscard}
            disabled={isSaving}
            className="!rounded-[2rem] h-16 px-10 font-bold text-lg [@media(max-height:720px)]:h-10 [@media(max-height:720px)]:text-sm [@media(max-height:720px)]:px-4"
          >
            {discardButtonLabel}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!allVerified || isSaving}
            className={cn(
              "!rounded-[2rem] h-16 px-10 font-bold text-lg transition-all shadow-xl [@media(max-height:720px)]:h-10 [@media(max-height:720px)]:text-sm [@media(max-height:720px)]:px-4",
              allVerified && !isSaving
                ? "bg-primary shadow-primary/20 hover:scale-105 active:scale-95"
                : "bg-muted text-muted-foreground shadow-none cursor-not-allowed",
            )}
          >
            {isSaving ? saveButtonLoadingLabel : saveButtonLabel}
          </Button>
        </>
      }
    >
        <Form {...form}>
          <div className="flex flex-col h-full bg-background rounded-default overflow-hidden">
            <div className="p-10 pb-2 border-b border-black/[0.03] [@media(max-height:720px)]:px-4 [@media(max-height:720px)]:py-2">
              <ReviewHeader
                sourceFileId={sourceFileId}
                getFormData={() => form.getValues()}
              />
            </div>

            <ScrollArea className="flex-1 [@media(max-height:720px)]:min-h-0">
              <div className="p-10 space-y-12 [@media(max-height:720px)]:px-4 [@media(max-height:720px)]:py-3 [@media(max-height:720px)]:space-y-4">
                <Accordion
                  type="multiple"
                  value={openSections}
                  onValueChange={(value) =>
                    setOpenSections(value as SectionId[])
                  }
                  className="w-full space-y-6"
                >
                  <TransactionDialogSummarySection
                    control={form.control}
                    verifiedSections={verifiedSections}
                    onToggleVerified={handleToggleVerified}
                    errors={sectionErrors[TRANSACTION_DIALOG_SECTION.SUMMARY]}
                    onDateCascade={handleDateCascade}
                  />
                  <TransactionDialogClientsSection
                    control={form.control}
                    verifiedSections={verifiedSections}
                    onToggleVerified={handleToggleVerified}
                    errors={sectionErrors[TRANSACTION_DIALOG_SECTION.CLIENTS]}
                  />
                  <TransactionDialogPropertySection
                    control={form.control}
                    verifiedSections={verifiedSections}
                    onToggleVerified={handleToggleVerified}
                    errors={sectionErrors[TRANSACTION_DIALOG_SECTION.PROPERTY]}
                  />
                  <TransactionDialogFormsSection
                    control={form.control}
                    verifiedSections={verifiedSections}
                    onToggleVerified={handleToggleVerified}
                    errors={sectionErrors[TRANSACTION_DIALOG_SECTION.FORMS]}
                    onTaskToggle={handleTaskToggle}
                    onTaskDateChange={handleTaskDateChange}
                    onTaskNoteChange={handleTaskNoteChange}
                    onChecklistIdChange={handleChecklistIdChange}
                    onChecklistTemplateIdChange={handleChecklistTemplateIdChange}
                  />
                </Accordion>
              </div>
            </ScrollArea>
          </div>
        </Form>
    </Modal>
  );
}
