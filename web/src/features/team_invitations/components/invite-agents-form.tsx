"use client";

import * as React from "react";
import { Plus, Send, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { Button } from "@/shared/ui/button";
import { Form, FormInputField, Txt } from "@/shared/ui";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { ContactPhoneAutocomplete } from "@/features/contacts/components/contact-autocomplete";
import { cn } from "@/lib/utils";
import { useToast } from "@/shared/hooks/use-toast";
import type { InviteAgentRow } from "@/features/team_invitations";
import { getInviteErrorMessage } from "@/features/team_invitations/utils/get-invite-error-message";
import {
  BROKER_INVITE_MAX_AGENTS,
  createTeamInvitation,
  validateBrokerInvite,
} from "@/features/team_invitations";

const createEmptyRow = (): InviteAgentRow => ({
  id: crypto.randomUUID?.() ?? Math.random().toString(),
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
});

export type InviteAgentsFormProps = {
  teamId: string | null;
  currentUserEmail: string;
  compact?: boolean;
  title?: string;
  existingMembersCount?: number;
  pendingInvitationsCount?: number;
  onSuccess: () => void;
};

type InviteAgentsFormValues = {
  agents: InviteAgentRow[];
};

export function InviteAgentsForm({
  teamId,
  currentUserEmail,
  onSuccess,
  compact = false,
  title = "Invite your Agents",
  existingMembersCount = 0,
  pendingInvitationsCount = 0,
}: InviteAgentsFormProps) {
  const { toast } = useToast();
  const maxNewInvites = Math.max(
    0,
    BROKER_INVITE_MAX_AGENTS - existingMembersCount - pendingInvitationsCount,
  );
  const form = useForm<InviteAgentsFormValues>({
    defaultValues: {
      agents: maxNewInvites > 0 ? [createEmptyRow()] : [],
    },
    mode: "onSubmit",
  });
  const { control, handleSubmit, clearErrors, setError } = form;
  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "agents",
  });
  const { isSubmitting, errors } = form.formState;

  React.useEffect(() => {
    replace(maxNewInvites > 0 ? [createEmptyRow()] : []);
    clearErrors();
  }, [maxNewInvites, replace, clearErrors]);

  const usedSeats =
    existingMembersCount + pendingInvitationsCount + fields.length;
  const canAddRow = fields.length < maxNewInvites;

  const addAgent = React.useCallback(() => {
    if (!canAddRow) return;
    append(createEmptyRow());
    clearErrors("root");
  }, [append, canAddRow, clearErrors]);

  const removeAgent = React.useCallback(
    (index: number) => {
      if (fields.length <= 1) return;
      remove(index);
      clearErrors("root");
    },
    [fields.length, remove, clearErrors],
  );

  const onSubmit = handleSubmit(async (values) => {
    if (!teamId) {
      toast({
        title: "Cannot send invites",
        description: "No team selected. Please sign in again or select a team.",
        variant: "destructive",
      });
      return;
    }

    const validation = validateBrokerInvite(values.agents, currentUserEmail);
    if (!validation.valid) {
      setError("root", { type: "manual", message: validation.message });
      toast({
        title: "Check your entries",
        description: validation.message,
        variant: "destructive",
      });
      return;
    }

    if (validation.emailsToInvite.length > maxNewInvites) {
      const message = `You can invite only ${maxNewInvites} more agent(s).`;
      setError("root", { type: "manual", message });
      toast({
        title: "Seat limit reached",
        description: message,
        variant: "destructive",
      });
      return;
    }

    clearErrors("root");
    const errorsList: string[] = [];

    const inviteRowsByEmail = new Map(
      values.agents.map((agent) => [
        agent.email.trim().toLowerCase(),
        {
          firstName: agent.firstName,
          lastName: agent.lastName,
          phone: agent.phone,
        },
      ]),
    );

    await Promise.all(
      validation.emailsToInvite.map(async (email) => {
        const row = inviteRowsByEmail.get(email);
        try {
          await createTeamInvitation({
            teamId,
            email,
            firstName: row?.firstName,
            lastName: row?.lastName,
            phone: row?.phone,
          });
        } catch (err) {
          errorsList.push(getInviteErrorMessage(err, email));
        }
      }),
    );

    if (errorsList.length > 0) {
      const failedCount = errorsList.length;
      const sentCount = validation.emailsToInvite.length - failedCount;
      const message =
        failedCount === validation.emailsToInvite.length
          ? "All invites failed. Please try again."
          : `${failedCount} invite(s) failed.`;

      setError("root", { type: "manual", message });
      toast({
        title:
          failedCount === validation.emailsToInvite.length
            ? "Invites failed"
            : "Some invites failed",
        description:
          failedCount === validation.emailsToInvite.length
            ? errorsList[0]
            : `${sentCount} sent. ${errorsList.slice(0, 2).join(" ")}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Invites sent",
      description:
        validation.emailsToInvite.length === 1
          ? "Invitation sent successfully."
          : `${validation.emailsToInvite.length} invitations sent successfully.`,
    });
    onSuccess();
  });

  const cardClass = compact
    ? "flex min-h-0 flex-1 flex-col gap-4"
    : "w-full max-w-5xl glass-card rounded-[4rem] p-12 heavy-shadow space-y-10 border-white/60";
  const rowClass = compact
    ? "rounded-2xl border border-black/5 bg-black/[0.02] p-5 grid grid-cols-1 gap-4 md:grid-cols-2"
    : "grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4";

  return (
    <div
      className={
        compact
          ? "flex min-h-0 flex-1 flex-col"
          : "flex flex-col items-center justify-center py-12 space-y-12"
      }
    >
      {title && (
        <div className={compact ? "" : "text-center space-y-4 max-w-2xl"}>
          <Txt
            as="h2"
            className={
              compact
                ? "text-lg font-semibold"
                : "text-4xl font-bold tracking-tighter"
            }
          >
            {title}
          </Txt>
        </div>
      )}
      <Form {...form}>
        <form className={cardClass} onSubmit={onSubmit}>
          {errors.root?.message && (
            <Txt className="text-sm text-destructive font-medium" role="alert">
              {errors.root.message}
            </Txt>
          )}
          {maxNewInvites === 0 ? (
            <Txt className="text-sm text-muted-foreground">
              All {BROKER_INVITE_MAX_AGENTS} seats are already used (members +
              pending invites).
            </Txt>
          ) : (
            <div
              className={cn(
                "space-y-4",
                compact &&
                  "min-h-0 flex-1 overflow-y-auto subtle-scrollbar pr-1 -mr-1",
              )}
            >
              {fields.map((field, index) => (
                <div key={field.id} className={`relative ${rowClass}`}>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost-destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-8 !rounded-xl z-10"
                      onClick={() => removeAgent(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                    <FormInputField
                      control={control}
                      name={`agents.${index}.firstName`}
                      label="First Name"
                      placeholder="First Name"
                      showMessage={false}
                      autoComplete="given-name"
                      disabled={isSubmitting}
                    />

                    <FormInputField
                      control={control}
                      name={`agents.${index}.lastName`}
                      label="Last Name"
                      placeholder="Last Name"
                      showMessage={false}
                      autoComplete="family-name"
                      disabled={isSubmitting}
                    />

                    <Controller
                      control={control}
                      name={`agents.${index}.email`}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Email</label>
                          <ContactEmailAutocomplete
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            placeholder="agent@example.com"
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`agents.${index}.phone`}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Phone</label>
                          <ContactPhoneAutocomplete
                            value={field.value ?? ""}
                            onChange={(val) => {
                              field.onChange(val);
                              clearErrors("root");
                            }}
                            onBlur={field.onBlur}
                            disabled={isSubmitting}
                          />
                        </div>
                      )}
                    />
                </div>
              ))}
            </div>
          )}
          <div
            className={cn(
              "flex items-center justify-between border-t border-black/5 pt-4",
              compact && "shrink-0 bg-background",
            )}
          >
            <Button
              type="button"
              variant="outline"
              onClick={addAgent}
              disabled={!canAddRow || isSubmitting || maxNewInvites === 0}
              className="h-12 px-6 !rounded-2xl font-bold gap-2"
            >
              <Plus className="size-4" /> Add Seat ({usedSeats}/
              {BROKER_INVITE_MAX_AGENTS})
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || maxNewInvites === 0}
              className="h-12 px-10 !rounded-2xl font-bold gap-2"
            >
              <Send className="size-4" />
              {isSubmitting ? "Sending…" : "Send Invites"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
