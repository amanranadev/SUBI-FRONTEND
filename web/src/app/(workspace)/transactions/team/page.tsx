"use client";

import * as React from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import { z } from "zod";
import { ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Modal } from "@/shared/ui/modal";
import { Card } from "@/shared/ui/card";
import { useAuth } from "@/lib/auth/context";
import { useActiveTeamId } from "@/features/team/hooks/use-active-team-id";
import { getTeam, updateTeam } from "@/features/team/api/team-service";
import { listTeamInvitations } from "@/features/team_invitations/api/team-invitation-service";
import { TEAM_INVITATION_STATUS } from "@/features/team_invitations/constants";
import type { ApiTeamInvitation } from "@/features/team_invitations/types";
import { InviteAgentsForm } from "@/features/team_invitations/components/invite-agents-form";
import { TeamManageMembersTable } from "@/features/team/components/team-manage-members-table";
import { TeamManagePendingInvites } from "@/features/team/components/team-manage-pending-invites";
import { Txt } from "@/shared/ui";
import { useToast } from "@/shared/hooks/use-toast";
import { FormInputField } from "@/shared/ui/form-input-field";
import { Form } from "@/shared/ui/form";
import { FormTextareaField } from "@/shared/ui/form-textarea-field";
import { ImageUpload } from "@/shared/ui/image-upload";

const TEAM_QUERY_KEY = ["team", "manage"] as const;
const INVITATIONS_QUERY_KEY = ["team_invitations"] as const;
const TEAM_PROFILE_DESCRIPTION_MAX_LENGTH = 500;

const teamProfileSchema = z.object({
  name: z.string().min(1, "Team name is required"),
  contactEmail: z
    .string()
    .email("Enter a valid contact email")
    .or(z.literal("")),
  description: z
    .string()
    .max(
      TEAM_PROFILE_DESCRIPTION_MAX_LENGTH,
      `Description must be ${TEAM_PROFILE_DESCRIPTION_MAX_LENGTH} characters or less`,
    ),
});

type TeamProfileFormValues = z.infer<typeof teamProfileSchema>;

export default function TeamManagePage() {
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
    defaultValues: {
      name: "",
      contactEmail: "",
      description: "",
    },
  });

  const {
    data: team,
    isLoading: teamLoading,
    refetch: refetchTeam,
  } = useQuery({
    queryKey: [...TEAM_QUERY_KEY, teamId],
    queryFn: () => getTeam(teamId!),
    enabled: Boolean(teamId),
  });

  const { data: invitations = [], refetch: refetchInvitations } = useQuery({
    queryKey: [...INVITATIONS_QUERY_KEY, teamId],
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

    const objectUrl = URL.createObjectURL(logoFile);
    setLogoPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [logoFile]);

  const handleInviteSuccess = React.useCallback(() => {
    setInviteOpen(false);
    refetchTeam();
    refetchInvitations();
  }, [refetchTeam, refetchInvitations]);

  const handleMemberUpdated = React.useCallback(() => {
    refetchTeam();
  }, [refetchTeam]);

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
      toast({
        title: "Team updated",
        description: "Team details were saved successfully.",
      });
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

  const hasTeamDetailsChanges =
    teamProfileForm.formState.isDirty || Boolean(logoFile);

  const handleSaveTeamDetails = teamProfileForm.handleSubmit(
    async (values) => {
      await updateTeamMutation.mutateAsync(values);
    },
  );

  if (!teamId) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 px-4">
        <p className="text-muted-foreground">No team selected.</p>
        <Button variant="link" asChild className="mt-2 pl-0">
          <Link href="/transactions">Back to Transactions</Link>
        </Button>
      </div>
    );
  }

  if (teamLoading || !team) {
    return (
      <div className="w-full max-w-5xl mx-auto py-12 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-32 bg-muted rounded" />
          <div className="h-32 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="flex items-center justify-between gap-4">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href="/transactions">
            <ArrowLeft className="size-4" />
            Back to Transactions
          </Link>
        </Button>
        <Modal
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          title="Invite agents"
          trigger={
            <Button className="gap-2 !rounded-2xl font-bold">
              <Plus className="size-5" />
              Invite agents
            </Button>
          }
          contentClassName="max-w-2xl max-h-[90vh] !flex !flex-col overflow-hidden rounded-[3rem] border-0 heavy-shadow p-8"
          bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <InviteAgentsForm
            compact
            title=""
            teamId={teamId}
            currentUserEmail={currentUserEmail}
            onSuccess={handleInviteSuccess}
            existingMembersCount={team.members.length}
            pendingInvitationsCount={pendingInvitations.length}
          />
        </Modal>
      </div>

      <div className="space-y-8 max-w-4xl mx-auto">
          <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10">
            <div className="space-y-8">
              <div className="space-y-1">
                <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
                  Team profile
                </Txt>
              </div>
              <Form {...teamProfileForm}>
                <form
                  onSubmit={handleSaveTeamDetails}
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
                        disabled={
                          !hasTeamDetailsChanges || updateTeamMutation.isPending
                        }
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
              onMemberUpdated={handleMemberUpdated}
            />
          </Card>

          {pendingInvitations.length > 0 ? (
            <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 md:p-10 space-y-6">
              <Txt as="h2" size="2xl" weight="bold" className="tracking-tight">
                Pending invitations
              </Txt>
              <TeamManagePendingInvites
                invitations={pendingInvitations}
                onInvitationsUpdated={refetchInvitations}
              />
            </Card>
          ) : null}
      </div>
    </div>
  );
}
