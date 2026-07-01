"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Controller } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatPinpointCommand } from "@/features/cadet/lib/pinpoint-command";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { CheckCircle2, CreditCard, Home, User } from "lucide-react";
import type { Transaction } from "@/features/workspace/types";
import { TASK_QUERY_KEYS } from "@/features/tasks/constants";
import type { TaskListItem } from "@/features/tasks/types";
import { parseDateToISO } from "@/shared/utils/format";
import {
  recalculateDate,
  resolveExpectedTrigger,
} from "@/features/transactions/utils/task-date-cascade";
import { TransactionDetailClientSection } from "@/features/transactions/components/transaction-detail/transaction-detail-client-section";
import { TransactionDetailDeleteDialog } from "@/features/transactions/components/transaction-detail/transaction-detail-delete-dialog";
import { TransactionDetailSummaryHighlight } from "@/features/transactions/components/transaction-detail/transaction-detail-summary-highlight";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  ConfirmModal,
  Form,
  FormSectionField,
  FormTextareaField,
  Txt,
} from "@/shared/ui";
import { DatePickerInput } from "@/shared/ui/date-picker-input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { cn } from "@/lib/utils";
import { ItemsThatStayEditor } from "@/features/transactions/components/transaction-dialog/items-that-stay-editor";
import { TransactionDetailFormsAndTasksSection } from "@/features/transactions/components/transaction-detail/transaction-detail-forms-and-tasks-section";
import { useTransactionDetailsForm } from "../../hooks/use-transaction-details-form";

type PendingDateChange = {
  name: "closeDate" | "mutualAcceptanceDate";
  value: string;
};

type TransactionDetailDetailsTabProps = {
  transaction: Transaction;
  onSave: (next: Transaction) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function TransactionDetailDetailsTab({
  transaction,
  onSave,
  onDelete,
}: TransactionDetailDetailsTabProps) {
  const { form, onSubmit, handleContactsClick, isSaving } = useTransactionDetailsForm({
    transaction,
    onSave,
  });
  const queryClient = useQueryClient();
  const [pendingDate, setPendingDate] = useState<PendingDateChange | null>(null);

  const handleDateChange = useCallback(
    (name: "closeDate" | "mutualAcceptanceDate") => (newValue: string) => {
      setPendingDate({ name, value: newValue });
    },
    [],
  );

  const handleConfirmDateChange = useCallback(() => {
    if (!pendingDate) return;

    form.setValue(pendingDate.name, pendingDate.value, {
      shouldDirty: true,
      shouldValidate: true,
    });

    const newDateISO = parseDateToISO(pendingDate.value);
    if (newDateISO) {
      const expectedTrigger = resolveExpectedTrigger(pendingDate.name);

      const queryKey = TASK_QUERY_KEYS.byTransaction(transaction.id);
      queryClient.setQueryData<TaskListItem[]>(queryKey, (old) => {
        if (!old) return old;
        return old.map((task) => {
          if (task.daysOffset == null) return task;
          if (task.triggerEvent !== expectedTrigger) return task;
          return {
            ...task,
            dueDate: recalculateDate(task.daysOffset, newDateISO),
          };
        });
      });
    }

    setPendingDate(null);
  }, [form, pendingDate, queryClient, transaction.id]);

  const handleCancelDateChange = useCallback(() => {
    setPendingDate(null);
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 space-y-12 duration-500">
      <Form {...form}>
        <form className="space-y-10" onSubmit={onSubmit} noValidate>
          <TransactionDetailSummaryHighlight
            transaction={transaction}
            onContactsClick={handleContactsClick}
          />

          <section className="rounded-[3rem] bg-white/70 px-6 py-7 shadow-default backdrop-blur-3xl dark:bg-white/[0.04] md:px-8 md:py-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="mt-0.5 flex size-8 items-center justify-center rounded-lg bg-black/[0.05] text-foreground/70 dark:bg-white/[0.08]">
                <CheckCircle2 className="size-4" strokeWidth={2} />
              </div>
              <div className="space-y-1">
                <Txt as="h2" size="lg" weight="bold" className="tracking-tight">
                  Tasks
                </Txt>
                <Txt size="sm" tone="muted" className="m-0">
                  Forms and tasks linked to this transaction.
                </Txt>
              </div>
            </div>

            <TransactionDetailFormsAndTasksSection transaction={transaction} />
          </section>

          <Accordion
            type="multiple"
            defaultValue={["summary", "clients", "property"]}
            className="w-full space-y-10"
          >
            <DetailSection
              value="summary"
              title="Transaction summary"
              icon={
                <CreditCard className="size-4 opacity-40" strokeWidth={2} />
              }
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormSectionField
                  control={form.control}
                  name="address"
                  label="Property Address"
                  required
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="price"
                  label="Purchase Price"
                  kind="currency"
                  required
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="psaType"
                  label="PSA Type"
                  readOnly
                  subtleHighlight
                  showMessage={false}
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="earnestMoney"
                  label="Earnest Money"
                  kind="currency"
                  disabled={isSaving}
                />
                <FormField
                  control={form.control}
                  name="closeDate"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-2 rounded-[2rem] border border-orange-200 bg-orange-50/60 p-3">
                      <FormLabel
                        className="ml-4 flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-widest text-orange-700 opacity-90"
                        required
                      >
                        Closing Date
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[9px] font-bold tracking-wider text-orange-700">
                          Important
                        </span>
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <DatePickerInput
                            value={String(field.value ?? "")}
                            onValueChange={handleDateChange("closeDate")}
                            onBlur={field.onBlur}
                            disabled={isSaving}
                            className={cn(
                              "h-14 rounded-[1.75rem] border-black/[0.05] bg-white px-6 pr-12 text-base font-bold",
                              "border-orange-300 bg-orange-50/40",
                              fieldState.error && "border-red-400 bg-red-50/50",
                            )}
                            iconClassName="size-4 opacity-40"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="ml-4" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mutualAcceptanceDate"
                  render={({ field, fieldState }) => (
                    <FormItem className="space-y-2 p-0.5">
                      <FormLabel
                        className="ml-4 flex flex-wrap items-center gap-1 text-xs font-bold uppercase tracking-widest opacity-40"
                        required
                      >
                        Mutual Acceptance
                      </FormLabel>
                      <div className="relative">
                        <FormControl>
                          <DatePickerInput
                            value={String(field.value ?? "")}
                            onValueChange={handleDateChange("mutualAcceptanceDate")}
                            onBlur={field.onBlur}
                            disabled={isSaving}
                            className={cn(
                              "h-14 rounded-[1.75rem] border-black/[0.05] bg-white px-6 pr-12 text-base font-bold",
                              fieldState.error && "border-red-400 bg-red-50/50",
                            )}
                            iconClassName="size-4 opacity-40"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="ml-4" />
                    </FormItem>
                  )}
                />
              </div>
            </DetailSection>

            <DetailSection
              value="clients"
              sectionId="client-information"
              title="Client information"
              icon={<User className="size-4 opacity-40" strokeWidth={2} />}
            >
              <TransactionDetailClientSection
                control={form.control}
                isSaving={isSaving}
                setValue={form.setValue}
                getValues={form.getValues}
              />
            </DetailSection>

            <DetailSection
              value="property"
              title="Property information"
              icon={<Home className="size-4 opacity-40" strokeWidth={2} />}
            >
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <FormSectionField
                  control={form.control}
                  name="city"
                  label="City"
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="state"
                  label="State"
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="county"
                  label="County"
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="parcelNumber"
                  label="Parcel Number"
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="titleCompany"
                  label="Title Company"
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="closingAgent"
                  label="Closing Agent"
                  disabled={isSaving}
                />
                <Controller
                  control={form.control}
                  name="escrowEmail"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                        Escrow Email <span className="text-destructive">*</span>
                      </label>
                      <ContactEmailAutocomplete
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="Escrow email"
                        className="border-primary/20 bg-primary/[0.02] font-bold"
                        disabled={isSaving}
                      />
                    </div>
                  )}
                />
                <FormSectionField
                  control={form.control}
                  name="lender"
                  label="Lender"
                  disabled={isSaving}
                />
                <FormSectionField
                  control={form.control}
                  name="nwmlsNumber"
                  label="NWMLS Number"
                  disabled={isSaving}
                />
              </div>

              <ItemsThatStayEditor
                control={form.control}
                setValue={form.setValue}
                getValues={form.getValues}
                disabled={isSaving}
              />

              <FormTextareaField
                control={form.control}
                name="description"
                label="Description"
                optional
                disabled={isSaving}
                rows={4}
                placeholder="Optional notes about the property or transaction"
                className="px-1 pt-2"
                textareaClassName="min-h-[120px] resize-y rounded-[1.75rem] border-black/[0.05] bg-white px-6 py-4 text-base font-medium"
              />

              {formatPinpointCommand(transaction.address) ? (
                <div className="space-y-1.5 rounded-[1.75rem] border border-primary/15 bg-primary/5 px-6 py-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    SUBI chat command
                  </p>
                  <p className="text-base font-semibold text-foreground">
                    {formatPinpointCommand(transaction.address)}
                  </p>
                  <Txt size="xs" className="text-muted-foreground">
                    Say this in SUBI chat with a Dotloop tab open to fill and save via CADET.
                  </Txt>
                </div>
              ) : null}
            </DetailSection>

          </Accordion>

          <div className="flex justify-between items-center border-t border-black/5 pt-6">
            <Txt size="xs" className="text-muted-foreground m-0">
              Changes are saved only after you click{" "}
              <span className="font-semibold text-foreground">
                Save changes
              </span>
              .
            </Txt>

            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-2xl px-10 font-bold"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </Form>

      <TransactionDetailDeleteDialog
        address={transaction.address}
        onConfirmDelete={async () => onDelete(transaction.id)}
      />

      <ConfirmModal
        open={pendingDate !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDate(null);
        }}
        title="Update transaction dates?"
        description="Changing the closing date or pending date will automatically recalculate the due dates for all linked tasks."
        confirmLabel="Yes, update dates"
        cancelLabel="Cancel"
        variant="warning"
        onConfirm={handleConfirmDateChange}
        onCancel={handleCancelDateChange}
      />
    </div>
  );
}

function DetailSection({
  value,
  sectionId,
  title,
  children,
  icon,
}: {
  value: string;
  sectionId?: string;
  title: string;
  children: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <AccordionItem
      id={sectionId}
      value={value}
      className="glass-card rounded-[3rem] border-0 px-10 py-6 shadow-default"
    >
      <AccordionTrigger className="py-2 hover:no-underline">
        <div className="flex items-center gap-4">
          {icon}
          <span className="text-xl font-bold uppercase tracking-tighter opacity-30">
            {title}
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="space-y-8 px-1 pb-4 pt-8">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}
