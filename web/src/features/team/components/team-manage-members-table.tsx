"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Button } from "@/shared/ui/button";
import { Trash2 } from "lucide-react";
import { ProfileAvatar } from "@/shared/ui/profile-avatar";
import type { TeamMember, TeamMemberRole } from "../types";
import {
  TEAM_MEMBER_ROLE_LABELS,
  TEAM_MEMBER_ROLES,
  TEAM_MEMBER_ROLE,
} from "../constants";
import { updateMemberRole, removeMember } from "../api/team-service";
import { useToast } from "@/shared/hooks/use-toast";
import {
  CONFIRM_MODAL_VARIANT,
  ConfirmModal,
  type ConfirmModalRef,
} from "@/shared/ui/confirm-modal";
import { cn } from "@/lib/utils";

type TeamManageMembersTableProps = {
  teamId: string;
  members: TeamMember[];
  currentUserId: string;
  onMemberUpdated: () => void;
};

function isLastOwner(members: TeamMember[], member: TeamMember): boolean {
  const owners = members.filter((m) => m.role === TEAM_MEMBER_ROLE.OWNER);
  return owners.length <= 1 && member.role === TEAM_MEMBER_ROLE.OWNER;
}

export function TeamManageMembersTable({
  teamId,
  members,
  currentUserId,
  onMemberUpdated,
}: TeamManageMembersTableProps) {
  const { toast } = useToast();
  const confirmModalRef = React.useRef<ConfirmModalRef>(null);
  const [updatingRole, setUpdatingRole] = React.useState<string | null>(null);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  const handleRoleChange = React.useCallback(
    async (userId: string, role: TeamMemberRole) => {
      setUpdatingRole(userId);
      try {
        await updateMemberRole(teamId, userId, role);
        toast({ title: "Role updated" });
        onMemberUpdated();
      } catch {
        toast({
          title: "Failed to update role",
          variant: "destructive",
        });
      } finally {
        setUpdatingRole(null);
      }
    },
    [teamId, onMemberUpdated, toast],
  );

  const handleRemove = React.useCallback(
    async (member: TeamMember) => {
      const displayName = [member.name, member.lastName].filter(Boolean).join(" ");
      const confirmed = await confirmModalRef.current?.confirm({
        title: "Remove this member from the team?",
        description: displayName
          ? `${displayName} will immediately lose access to this team and all related workspaces.`
          : "This member will immediately lose access to this team and all related workspaces.",
        confirmLabel: "Remove member",
        cancelLabel: "Keep member",
        variant: CONFIRM_MODAL_VARIANT.DANGER,
      });
      if (!confirmed) return;

      setRemovingId(member.id);
      try {
        await removeMember(teamId, member.id);
        toast({ title: "Member removed" });
        onMemberUpdated();
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to remove member";
        toast({ title: message, variant: "destructive" });
      } finally {
        setRemovingId(null);
      }
    },
    [teamId, onMemberUpdated, toast],
  );

  return (
    <div className="space-y-3">
      {members.map((member) => {
        const isCurrentUser = member.id === currentUserId;
        const cannotRemove = isCurrentUser || isLastOwner(members, member);
        const name = [member.name, member.lastName]
          .filter(Boolean)
          .join(" ");

        return (
          <div
            key={member.id}
            className={cn(
              "flex items-center gap-4 rounded-2xl border border-black/5 bg-black/[0.02] p-4 transition-colors hover:bg-black/[0.04]",
              isCurrentUser && "ring-1 ring-primary/20",
            )}
          >
            <ProfileAvatar
              name={name || member.email}
              picture={member.avatar}
              className="size-10 shrink-0"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm truncate">
                  {name || "—"}
                </span>
                {isCurrentUser && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary opacity-60">
                    You
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground truncate block">
                {member.email}
              </span>
            </div>

            <Select
              value={member.role}
              onValueChange={(value) =>
                handleRoleChange(member.id, value as TeamMemberRole)
              }
              disabled={isCurrentUser || updatingRole === member.id}
            >
              <SelectTrigger className="w-[130px] !rounded-xl h-9 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TEAM_MEMBER_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {TEAM_MEMBER_ROLE_LABELS[role]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              type="button"
              size="icon"
              variant="ghost-destructive"
              className="shrink-0 !rounded-xl"
              disabled={cannotRemove || removingId === member.id}
              onClick={() => handleRemove(member)}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      })}
      <ConfirmModal ref={confirmModalRef} />
    </div>
  );
}
