"use client";

import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Modal } from "@/shared/ui/modal";
import { Textarea } from "@/shared/ui/textarea";
import { Mail, MessageSquare, Loader2 } from "lucide-react";
import * as React from "react";
import type { EditDraftPayload } from "../api/draft-service";
import type { MessageDraft } from "../types";

type DraftEditDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: MessageDraft;
  isSaving?: boolean;
  onSave: (payload: EditDraftPayload) => Promise<void>;
};

type DraftEditFormValues = {
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  subject: string;
  body: string;
};

export function DraftEditDialog({
  open,
  onOpenChange,
  draft,
  isSaving = false,
  onSave,
}: DraftEditDialogProps) {
  const isEmail = draft.messageType === "email";
  const Icon = isEmail ? Mail : MessageSquare;
  const [values, setValues] = React.useState<DraftEditFormValues>(() =>
    buildInitialValues(draft),
  );

  React.useEffect(() => {
    if (!open) return;
    setValues(buildInitialValues(draft));
  }, [draft, open]);

  const handleChange =
    (field: keyof DraftEditFormValues) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setValues((prev) => ({ ...prev, [field]: nextValue }));
    };

  const canSave = getCanSave(draft.messageType, values);

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    await onSave(buildEditPayload(draft.messageType, values));
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      hideHeader
      contentClassName="max-w-3xl gap-0 overflow-hidden border-0 p-0 shadow-default"
      overlayClassName="bg-black/80"
      onInteractOutside={(event) => event.preventDefault()}
      footerClassName="border-t border-black/[0.05] px-6 py-4 sm:px-8"
      footer={
        <>
          <Button
            type="button"
            variant="ghost"
            disabled={isSaving}
            onClick={() => onOpenChange(false)}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSave || isSaving}
            onClick={() => void handleSave()}
            className="rounded-xl"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </>
      }
    >
      <div className="border-b border-black/[0.05] bg-primary/5 px-6 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-4" />
          </div>
          <div className="space-y-1 text-left">
            <h2 className="text-xl font-bold tracking-tight">
              Edit {isEmail ? "Email" : "SMS"} Draft
            </h2>
            <p className="text-sm text-muted-foreground">
              Update the recipient details and message content before sending.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 px-6 py-6 sm:px-8">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={values.recipientName}
            onChange={handleChange("recipientName")}
            placeholder="Recipient name"
            disabled={isSaving}
            className="h-11 rounded-xl"
          />
          {isEmail ? (
            <Input
              value={values.recipientEmail}
              onChange={handleChange("recipientEmail")}
              placeholder="Recipient email"
              type="email"
              disabled={isSaving}
              className="h-11 rounded-xl"
            />
          ) : (
            <Input
              value={values.recipientPhone}
              onChange={handleChange("recipientPhone")}
              placeholder="Phone number"
              disabled={isSaving}
              className="h-11 rounded-xl"
            />
          )}
        </div>

        {isEmail ? (
          <Input
            value={values.subject}
            onChange={handleChange("subject")}
            placeholder="Subject"
            disabled={isSaving}
            className="h-11 rounded-xl"
          />
        ) : null}

        <Textarea
          value={values.body}
          onChange={handleChange("body")}
          disabled={isSaving}
          className="min-h-[320px] rounded-2xl border-border/50 text-sm"
          placeholder="Write your message"
        />

        {draft.ccEmails && draft.ccEmails.length > 0 ? (
          <div className="rounded-2xl border border-black/[0.05] bg-black/[0.02] px-4 py-3 text-sm">
            <span className="font-medium text-muted-foreground">CC:</span>{" "}
            <span className="text-muted-foreground">
              {draft.ccEmails.join(", ")}
            </span>{" "}
            <span className="text-muted-foreground/60">(auto-calculated)</span>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

function buildInitialValues(draft: MessageDraft): DraftEditFormValues {
  return {
    recipientName: draft.recipient.name ?? "",
    recipientEmail: draft.recipient.email ?? "",
    recipientPhone: draft.recipient.phone ?? "",
    subject: draft.subject ?? "",
    body: draft.body ?? "",
  };
}

function buildEditPayload(
  messageType: MessageDraft["messageType"],
  values: DraftEditFormValues,
): EditDraftPayload {
  const payload: EditDraftPayload = {
    recipient_name: values.recipientName.trim(),
    body: values.body,
  };

  if (messageType === "email") {
    payload.recipient_email = values.recipientEmail.trim();
    payload.subject = values.subject.trim();
  } else {
    payload.recipient_phone = values.recipientPhone.trim();
  }

  return payload;
}

function getCanSave(
  messageType: MessageDraft["messageType"],
  values: DraftEditFormValues,
) {
  if (!values.recipientName.trim() || !values.body.trim()) return false;
  if (messageType === "email") return Boolean(values.recipientEmail.trim());
  return Boolean(values.recipientPhone.trim());
}
