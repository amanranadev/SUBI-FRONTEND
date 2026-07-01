"use client";

import * as React from "react";
import { Button } from "@/shared/ui/button";
import { RefreshCcw, X } from "lucide-react";
import {
  cancelTeamInvitation,
  resendTeamInvitation,
} from "@/features/team_invitations/api/team-invitation-service";
import type { ApiTeamInvitation } from "@/features/team_invitations/types";
import { useToast } from "@/shared/hooks/use-toast";

type TeamManagePendingInvitesProps = {
  invitations: ApiTeamInvitation[];
  onInvitationsUpdated: () => void;
};

export function TeamManagePendingInvites({
  invitations,
  onInvitationsUpdated,
}: TeamManagePendingInvitesProps) {
  const { toast } = useToast();
  const [resendingId, setResendingId] = React.useState<string | null>(null);
  const [cancellingId, setCancellingId] = React.useState<string | null>(null);

  const handleResend = React.useCallback(
    async (id: string, email: string) => {
      setResendingId(id);
      try {
        await resendTeamInvitation(id);
        toast({
          title: "Invitation resent",
          description: `A new invite email was sent to ${email}.`,
        });
      } catch {
        toast({
          title: "Failed to resend invitation",
          variant: "destructive",
        });
      } finally {
        setResendingId(null);
      }
    },
    [toast],
  );

  const handleCancel = React.useCallback(
    async (id: string) => {
      setCancellingId(id);
      try {
        await cancelTeamInvitation(id);
        toast({ title: "Invitation cancelled" });
        onInvitationsUpdated();
      } catch {
        toast({
          title: "Failed to cancel invitation",
          variant: "destructive",
        });
      } finally {
        setCancellingId(null);
      }
    },
    [onInvitationsUpdated, toast],
  );

  if (invitations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No pending invitations.</p>
    );
  }

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-muted/50 border-b border-border">
            <th className="text-left p-3 font-medium">Name</th>
            <th className="text-left p-3 font-medium">Email</th>
            <th className="text-left p-3 font-medium">Role</th>
            <th className="w-[132px] p-3" />
          </tr>
        </thead>
        <tbody>
          {invitations.map((inv) => {
            const fullName = [inv.first_name, inv.last_name]
              .filter(Boolean)
              .join(" ")
              .trim();

            return (
            <tr key={inv.id} className="border-b border-border last:border-b-0">
              <td className="p-3">{fullName || "—"}</td>
              <td className="p-3">{inv.email}</td>
              <td className="p-3 capitalize">{inv.role}</td>
              <td className="p-3">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={resendingId === inv.id || cancellingId === inv.id}
                    onClick={() => handleResend(inv.id, inv.email)}
                    aria-label={`Resend invitation to ${inv.email}`}
                  >
                    <RefreshCcw className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost-destructive"
                    size="icon"
                    disabled={cancellingId === inv.id || resendingId === inv.id}
                    onClick={() => handleCancel(inv.id)}
                    aria-label={`Cancel invitation to ${inv.email}`}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
