"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { Controller } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { useAuth } from "@/lib/auth/context";
import { useActiveTeamId } from "@/features/team/hooks/use-active-team-id";
import { getTeam } from "@/features/team/api/team-service";
import { listTeamInvitations } from "@/features/team_invitations/api/team-invitation-service";
import { TEAM_INVITATION_STATUS } from "@/features/team_invitations/constants";
import type { ApiTeamInvitation } from "@/features/team_invitations/types";
import { InviteAgentsForm } from "@/features/team_invitations/components/invite-agents-form";
import { TeamManageMembersTable } from "@/features/team/components/team-manage-members-table";
import { TeamManagePendingInvites } from "@/features/team/components/team-manage-pending-invites";
import { ImageUpload } from "@/shared/ui/image-upload";
import { Button, Card, Txt } from "@/shared/ui";
import { Modal } from "@/shared/ui/modal";
import { FormInputField } from "@/shared/ui/form-input-field";
import { Form } from "@/shared/ui/form";
import { FormTextareaField } from "@/shared/ui/form-textarea-field";
import { useToast } from "@/shared/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { updateTeam } from "@/features/team/api/team-service";

const teamProfileSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  contactEmail: z
    .string()
    .email("Enter a valid contact email")
    .or(z.literal("")),
  description: z
    .string()
    .max(500, "Description must be 500 characters or less"),
});

type TeamProfileFormValues = z.infer<typeof teamProfileSchema>;

export function ProfileSettingsTeamCard() {
  const { user } = useAuth();
  const { selectedTeamId } = useActiveTeamId();
  const { toast } = useToast();
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null);

  const teamId = selectedTeamId;
  const currentUserEmail = user?.email ?? "";
  const currentUserId = user?.id ?? "";

  const teamProfileForm = useForm<TeamProfileFormValues>({
    resolver: zodResolver(teamProfileSchema),
    mode: "onSubmit",
    defaultValues: { name: "", contactEmail: "", description: "" },
  });

  const {
    data: team,
    isLoading: teamLoading,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: ["team", "manage", teamId],
    queryFn: () => getTeam(teamId!),
    enabled: Boolean(teamId),
  });

  const { data: invitations = [], refetch: refetchInvitations } = useQuery({
    queryKey: ["team_invitations", teamId],
    queryFn: () => listTeamInvitations(teamId!),
    enabled: Boolean(teamId),
  });

  const pendingInvitations = React.useMemo(
    () =>
      (invitations as ApiTeamInvitation[]).filter(
        (i) => i.status === TEAM_INVITATION_STATUS.PENDING,
      ),
    [invitations],
  );

  React.useEffect(() => {
    if (!team) return;
    teamProfileForm.reset({
      name: team.name ?? "",
      contactEmail: team.contactEmail ?? "",
      description: team.description ?? "",
    });
    setLogoFile(null);
    setLogoPreview(null);
  }, [team, teamProfileForm]);

  React.useEffect(() => {
    if (!logoFile) {
      setLogoPreview(null);
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const updateTeamMutation = useMutation({
    mutationFn: async (values: TeamProfileFormValues) => {
      if (!team) throw new Error("Team not loaded");
      return updateTeam(team.id, {
        name: values.name.trim(),
        contactEmail: values.contactEmail.trim(),
        description: values.description.trim(),
        logoFile,
      });
    },
    onSuccess: async (_data, values) => {
      await refetchTeam();
      teamProfileForm.reset(values);
      toast({ title: "Team updated", description: "Team details saved." });
      setLogoFile(null);
      setLogoPreview(null);
    },
    onError: () => {
      toast({
        title: "Could not update team",
        description: "Please check the fields and try again.",
        variant: "destructive",
      });
    },
  });

  const hasChanges =
    teamProfileForm.formState.isDirty || Boolean(logoFile);

  if (!teamId) {
    return (
      <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10">
        <Txt as="p" size="sm" tone="muted">
          No team selected.
        </Txt>
      </Card>
    );
  }

  if (teamLoading || !team) {
    return (
      <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10">
        <Txt as="p" size="sm" tone="muted">
          Loading team...
        </Txt>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
              Team profile
            </Txt>
            <Modal
              open={inviteOpen}
              onOpenChange={setInviteOpen}
              title="Invite agents"
              trigger={
                <Button
                  onClick={() => setInviteOpen(true)}
                  className="gap-2 !rounded-2xl font-bold"
                >
                  <Plus className="size-4" />
                  Invite agents
                </Button>
              }
              contentClassName="max-w-2xl max-h-[90vh] overflow-y-auto rounded-[3rem] border-0 heavy-shadow p-8"
            >
              <InviteAgentsForm
                compact
                title=""
                teamId={teamId}
                currentUserEmail={currentUserEmail}
                onSuccess={() => {
                  setInviteOpen(false);
                  refetchTeam();
                  refetchInvitations();
                }}
                existingMembersCount={team.members.length}
                pendingInvitationsCount={pendingInvitations.length}
              />
            </Modal>
          </div>
          <Form {...teamProfileForm}>
            <form
              onSubmit={teamProfileForm.handleSubmit(async (values) => {
                await updateTeamMutation.mutateAsync(values);
              })}
              className="grid grid-cols-1 gap-8 md:grid-cols-3"
            >
              <div className="flex flex-col items-center gap-3 md:col-span-1">
                <ImageUpload
                  src={logoPreview || team.logo || null}
                  fallback={
                    <Txt as="span" size="3xl">
                      🏢
                    </Txt>
                  }
                  isBusy={updateTeamMutation.isPending}
                  onFileChange={setLogoFile}
                />
              </div>
              <div className="space-y-5 md:col-span-2">
                <FormInputField
                  control={teamProfileForm.control}
                  name="name"
                  label="Team name"
                  required
                  placeholder="Enter team name"
                  disabled={updateTeamMutation.isPending}
                />
                <Controller
                  control={teamProfileForm.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">Contact email</label>
                      <ContactEmailAutocomplete
                        value={field.value ?? ""}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        placeholder="team@example.com"
                        disabled={updateTeamMutation.isPending}
                      />
                    </div>
                  )}
                />
                <FormTextareaField
                  control={teamProfileForm.control}
                  name="description"
                  label="Description"
                  placeholder="Describe your team"
                  textareaClassName="min-h-32 resize-y"
                  disabled={updateTeamMutation.isPending}
                />
                <div className="flex justify-end border-t border-black/5 pt-6">
                  <Button
                    type="submit"
                    disabled={!hasChanges || updateTeamMutation.isPending}
                    className="h-16 px-16 !rounded-[2rem] text-xl font-bold shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95"
                  >
                    {updateTeamMutation.isPending
                      ? "Saving..."
                      : "Save team details"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </Card>

      <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-6">
        <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
          Members
        </Txt>
        <TeamManageMembersTable
          teamId={team.id}
          members={team.members}
          currentUserId={currentUserId}
          onMemberUpdated={() => refetchTeam()}
        />
      </Card>

      {pendingInvitations.length > 0 && (
        <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-6">
          <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
            Pending invitations
          </Txt>
          <TeamManagePendingInvites
            invitations={pendingInvitations}
            onInvitationsUpdated={refetchInvitations}
          />
        </Card>
      )}
    </div>
  );
}
