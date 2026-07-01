import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/shared/hooks/use-toast";
import { draftService, type EditDraftPayload } from "../api/draft-service";
import { deleteEmailTemplate, saveGeneratedEmailTemplate, type EmailTemplateSource } from "@/features/settings/api/email-template-service";
import { updateTask } from "@/features/tasks/api/task-service";
import { TASK_QUERY_KEYS } from "@/features/tasks/constants";
import { apiClient } from "@/lib/api/client";
import { captureApiError } from "@/lib/sentry";
import type { 
  MessageDraft, 
  TemplateSelectionRequest, 
  EmailTemplatePreview, 
  TaskDependencyClarification, 
  TaskDependencyRemoval,
  Message,
  MessageDraftSentVia
} from "../types";
import { MESSAGE_DRAFT_SENT_VIA, MESSAGE_DRAFT_STATUS } from "../types";

const COMMUNICATION_SENT_EVENT = "subi:communication-sent";

export function useChatFlows(
  chatId: string | null,
  appendMessage: (msg: Message) => void,
  sendMessage: (payload?: string | { text?: string; displayText?: string; hideUserBubble?: boolean }) => Promise<void>
) {
  const [pendingDrafts, setPendingDrafts] = React.useState<MessageDraft[]>([]);
  const [pendingTemplateSelections, setPendingTemplateSelections] = React.useState<TemplateSelectionRequest[]>([]);
  const [pendingTemplatePreviews, setPendingTemplatePreviews] = React.useState<EmailTemplatePreview[]>([]);
  const [pendingDependencies, setPendingDependencies] = React.useState<TaskDependencyClarification[]>([]);
  const [pendingRemovals, setPendingRemovals] = React.useState<TaskDependencyRemoval[]>([]);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const resetFlows = React.useCallback(() => {
    setPendingDrafts([]);
    setPendingTemplateSelections([]);
    setPendingTemplatePreviews([]);
    setPendingDependencies([]);
    setPendingRemovals([]);
  }, []);

  const sendDraft = React.useCallback(async (draftId: string) => {
    try {
      const result = await draftService.sendDraft(draftId, { chat_id: chatId });
      const sentVia = (result.sent_via ?? result.draft?.sent_via) as MessageDraftSentVia | undefined;
      const isSent = result.draft?.status === MESSAGE_DRAFT_STATUS.SENT;

      setPendingDrafts((prev) =>
        prev.map((d) =>
          d.id === draftId
            ? {
                ...d,
                status: isSent ? MESSAGE_DRAFT_STATUS.SENT : MESSAGE_DRAFT_STATUS.FAILED,
                sentVia: sentVia ?? (d.messageType === "sms" && isSent ? MESSAGE_DRAFT_SENT_VIA.SMS : d.sentVia),
                sentAt: result.draft?.sent_at ? new Date(result.draft.sent_at) : d.sentAt,
              }
            : d,
        ),
      );

      if (isSent) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent(COMMUNICATION_SENT_EVENT, {
              detail: { transactionId: result.draft?.transaction_id, draftId },
            }),
          );
        }

        toast({
          title: "Message Sent",
          description:
            sentVia === MESSAGE_DRAFT_SENT_VIA.GMAIL
              ? "Sent from your Gmail account."
              : sentVia === MESSAGE_DRAFT_SENT_VIA.SMS
                ? "Text sent via Subi SMS."
                : "Sent from Subi.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Send Incomplete",
          description: "The message was not confirmed as sent. Please try again.",
        });
      }
    } catch {
      setPendingDrafts((prev) =>
        prev.map((d) =>
          d.id === draftId
            ? {
                ...d,
                status: MESSAGE_DRAFT_STATUS.FAILED,
              }
            : d,
        ),
      );
      toast({ variant: "destructive", title: "Send Failed", description: "Could not send the message. Please try again." });
    }
  }, [chatId, toast]);

  const cancelDraft = React.useCallback(async (draftId: string) => {
    try {
      await draftService.cancelDraft(draftId);
      setPendingDrafts((prev) =>
        prev.map((d) => (d.id === draftId ? { ...d, status: MESSAGE_DRAFT_STATUS.CANCELLED } : d)),
      );
      toast({ title: "Draft Cancelled", description: "The draft has been cancelled." });
    } catch {
      toast({ variant: "destructive", title: "Cancel Failed", description: "Could not cancel the draft. Please try again." });
    }
  }, [toast]);

  const editDraft = React.useCallback(async (draftId: string, payload: EditDraftPayload) => {
    try {
      const updated = await draftService.editDraft(draftId, payload);
      setPendingDrafts((prev) => prev.map((d) => d.id === draftId ? {
        ...d,
        recipient: { name: updated.recipient_name, email: updated.recipient_email, phone: updated.recipient_phone },
        messageType: updated.message_type,
        subject: updated.subject,
        body: updated.body,
        ccEmails: updated.cc_emails,
        status: updated.status ?? d.status,
        sentVia: updated.sent_via ?? d.sentVia,
      } : d));
      toast({ title: "Draft Updated", description: "Your changes have been saved." });
    } catch {
      toast({ variant: "destructive", title: "Edit Failed", description: "Could not update the draft. Please try again." });
    }
  }, [toast]);

  const applyTemplateSelection = React.useCallback(async (requestId: string, templateId: string, messages: Message[]) => {
    const request = pendingTemplateSelections.find((item) => item.id === requestId);
    setPendingTemplateSelections((prev) => prev.filter((item) => item.id !== requestId));
    if (!chatId) return;

    const promptText = request?.promptText?.trim();
    const fallbackPromptText = [...messages].reverse().find((msg) => !msg.isAi && !msg.hidden && msg.text.trim().length > 0)?.text.trim();
    const effectivePromptText = promptText || fallbackPromptText;

    const messagePayload = effectivePromptText
      ? `template_id: ${templateId}\nUse this selected template for the email draft and do not ask to choose a template again.\n\nOriginal request:\n${effectivePromptText}`
      : `template_id: ${templateId}\nUse this selected template for the email draft and do not ask to choose a template again.`;

    appendMessage({
      id: `template-selected-${Date.now()}`,
      text: effectivePromptText ? `Template selected. Continuing with your draft.\n\nOriginal request:\n${effectivePromptText}` : "Template selected. Continuing with your draft.",
      isAi: false,
      timestamp: new Date(),
    });

    await sendMessage({ text: messagePayload, hideUserBubble: true });
  }, [chatId, pendingTemplateSelections, appendMessage, sendMessage]);

  const dismissTemplateSelection = React.useCallback((requestId: string) => {
    setPendingTemplateSelections((prev) => prev.filter((item) => item.id !== requestId));
  }, []);

  const createNewTemplateFromSelection = React.useCallback(async (requestId: string) => {
    const request = pendingTemplateSelections.find((item) => item.id === requestId);
    setPendingTemplateSelections((prev) => prev.filter((item) => item.id !== requestId));
    if (!chatId) return;

    const promptText = request?.promptText?.trim();
    const createMessage = promptText ? `force_template_create: true\ninstruction_text: ${promptText}` : "force_template_create: true\ninstruction_text: Create a professional follow-up email template for a buyer.";
    await sendMessage({
      text: createMessage,
      displayText: promptText ? `Create a new template for this request.\n\nOriginal request:\n${promptText}` : "Create a new professional follow-up template for a buyer.",
    });
  }, [chatId, pendingTemplateSelections, sendMessage]);

  const deleteTemplateFromSelection = React.useCallback(async (requestId: string, templateId: string) => {
    try {
      await deleteEmailTemplate(templateId);
      setPendingTemplateSelections((prev) => prev.map((request) => request.id !== requestId ? request : { ...request, templates: request.templates.filter((t) => t.id !== templateId) }));
      toast({ title: "Template deleted", description: "The template was removed successfully." });
    } catch {
      toast({ variant: "destructive", title: "Delete failed", description: "Could not delete this template." });
    }
  }, [toast]);

  const saveTemplatePreview = React.useCallback(async (previewId: string, payload: { name: string; content: string; description?: string; source?: EmailTemplateSource }) => {
    try {
      const response = await saveGeneratedEmailTemplate(payload);
      if (!response.duplicated) {
        setPendingTemplatePreviews((prev) => prev.filter((item) => item.id !== previewId));
      }
      toast({ title: response.duplicated ? "Template already exists" : "Template saved", description: response.message, variant: response.duplicated ? "destructive" : "default" });
    } catch {
      toast({ variant: "destructive", title: "Save failed", description: "Could not save the generated template." });
    }
  }, [toast]);

  const dismissTemplatePreview = React.useCallback((previewId: string) => {
    setPendingTemplatePreviews((prev) => prev.filter((item) => item.id !== previewId));
  }, []);

  const confirmDependency = React.useCallback(async (depId: string, childTaskId: string, parentTaskId: string, daysAfterParent: number) => {
    try {
      await updateTask(childTaskId, { parent_task_id: parentTaskId, days_after_parent: daysAfterParent });
      setPendingDependencies((prev) => prev.filter((d) => d.id !== depId));
      await queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      toast({ title: "Dependency Saved", description: "Task dependency has been saved." });
    } catch (error: unknown) {
      const isValidationError = (error as any).response?.status === 422;
      toast({
        variant: "destructive",
        title: "Failed to Set Dependency",
        description: isValidationError ? "A circular dependency was detected." : "Could not save dependency.",
      });
    }
  }, [queryClient, toast]);

  const dismissDependency = React.useCallback((id: string) => {
    setPendingDependencies((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const confirmRemoval = React.useCallback(async (removalId: string, childTaskId: string) => {
    try {
      await apiClient.patch(`/transaction_tasks/${childTaskId}`, { parent_task_id: null, days_after_parent: null });
      setPendingRemovals((prev) => prev.filter((r) => r.id !== removalId));
      await queryClient.invalidateQueries({ queryKey: TASK_QUERY_KEYS.all });
      toast({ title: "Dependency Removed", description: "Task dependency has been removed successfully." });
    } catch (error) {
      captureApiError(error, { operation: "patch:transaction_tasks/remove_dependency" });
      toast({ variant: "destructive", title: "Failed to Remove Dependency", description: "Could not remove dependency." });
    }
  }, [queryClient, toast]);

  const dismissRemoval = React.useCallback((id: string) => {
    setPendingRemovals((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return {
    pendingDrafts, setPendingDrafts,
    pendingTemplateSelections, setPendingTemplateSelections,
    pendingTemplatePreviews, setPendingTemplatePreviews,
    pendingDependencies, setPendingDependencies,
    pendingRemovals, setPendingRemovals,
    resetFlows,
    sendDraft, cancelDraft, editDraft,
    applyTemplateSelection, dismissTemplateSelection, createNewTemplateFromSelection, deleteTemplateFromSelection,
    saveTemplatePreview, dismissTemplatePreview,
    confirmDependency, dismissDependency,
    confirmRemoval, dismissRemoval
  };
}
