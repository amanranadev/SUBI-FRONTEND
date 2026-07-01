"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, LogIn, UserPlus, X } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { authStorage } from "@/lib/auth/storage";
import {
  TEAM_INVITATION_STATUS,
  acceptTeamInvitation,
  getTeamInvitation,
  rejectTeamInvitation,
} from "@/features/team_invitations";
import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  SubiTextLogo,
  Txt,
} from "@/shared/ui";
import { SubiLoading } from "@/shared/ui/subi-loading";
import { useToast } from "@/shared/hooks/use-toast";

const INVITATION_QUERY_KEY = "team_invitation";

function getInvitationErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;

  const data = error.response?.data;
  if (data && typeof data === "object") {
    const payload = data as {
      error?: string;
      message?: string;
      errors?: string[];
    };
    if (payload.error) return payload.error;
    if (payload.message) return payload.message;
    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      return payload.errors[0];
    }
  }

  if (error.response?.status === 404) return "Invitation not found or expired.";
  if (error.response?.status === 403)
    return "You are not allowed to use this invitation.";
  if (error.response?.status === 401)
    return "Please sign in to process this invitation.";

  return fallback;
}

type TeamInvitationDetailsViewProps = {
  token: string;
};

export function TeamInvitationDetailsView({
  token,
}: TeamInvitationDetailsViewProps) {
  const pathname = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const invitationQuery = useQuery({
    queryKey: [INVITATION_QUERY_KEY, token],
    queryFn: () => getTeamInvitation(token),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptTeamInvitation(token),
    onSuccess: (invitation) => {
      if (invitation.team?.id) {
        authStorage.setTeamId(invitation.team.id);
      }
      queryClient.setQueryData([INVITATION_QUERY_KEY, token], invitation);
      toast({ title: "Invitation accepted" });
      router.replace("/");
    },
    onError: (error) => {
      toast({
        title: getInvitationErrorMessage(error, "Could not accept invitation."),
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectTeamInvitation(token),
    onSuccess: (invitation) => {
      queryClient.setQueryData([INVITATION_QUERY_KEY, token], invitation);
      toast({ title: "Invitation declined" });
    },
    onError: (error) => {
      toast({
        title: getInvitationErrorMessage(
          error,
          "Could not decline invitation.",
        ),
        variant: "destructive",
      });
    },
  });

  const isProcessing = acceptMutation.isPending || rejectMutation.isPending;

  const returnTo = pathname || `/team_invitations/${token}`;
  const loginHref = `/login?returnTo=${encodeURIComponent(returnTo)}`;
  const signupHref = `/signup?returnTo=${encodeURIComponent(returnTo)}`;

  if (invitationQuery.isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-card p-4">
        <SubiLoading />
      </div>
    );
  }

  if (invitationQuery.isError || !invitationQuery.data) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-card p-4">
        <Card className="w-full max-w-xl rounded-2xl border-border/70 shadow-xl">
          <CardContent className="flex flex-col gap-4 p-8">
            <div className="mb-2 flex justify-center">
              <div className="rounded-full border border-border bg-background px-4 py-2">
                <SubiTextLogo className="h-6 w-auto" />
              </div>
            </div>
            <Txt as="h1" size="2xl" weight="bold">
              Invitation unavailable
            </Txt>
            <Alert variant="danger">
              <AlertDescription>
                {getInvitationErrorMessage(
                  invitationQuery.error,
                  "This invitation could not be loaded.",
                )}
              </AlertDescription>
            </Alert>
            <div className="flex justify-end">
              <Button asChild>
                <Link href={isAuthenticated ? "/" : "/login"}>
                  {isAuthenticated ? "Go to workspace" : "Go to login"}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const invitation = invitationQuery.data;
  const teamLogo = invitation.team?.logo;
  const teamName = invitation.team?.name ?? "Subi Workspace";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-card p-4">
      <Card className="w-full max-w-2xl rounded-2xl border-border/70 shadow-xl">
        <CardContent className="space-y-6 p-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-xl bg-muted/30 p-3">
              <SubiTextLogo className="h-7 w-auto" />
              <Txt
                as="span"
                size="xs"
                tone="muted"
                className="rounded-full bg-background px-3 py-1"
              >
                Team invitation
              </Txt>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-4">
              {teamLogo ? (
                <img
                  src={teamLogo}
                  alt={`${teamName} logo`}
                  className="size-14 rounded-lg border border-border object-cover"
                />
              ) : (
                <div className="flex size-14 items-center justify-center rounded-lg border border-border bg-muted">
                  <Txt as="span" size="lg">
                    🏢
                  </Txt>
                </div>
              )}

              <div className="flex flex-col">
                <Txt as="span" size="lg" weight="semibold">
                  {teamName}
                </Txt>
                <Txt as="span" size="sm" tone="muted">
                  {invitation.team?.description ||
                    "Collaborate with your team on Subi."}
                </Txt>
              </div>
            </div>

            <div className="space-y-2">
              <Txt as="h1" size="2xl" weight="bold">
                You&apos;ve been invited to a workspace
              </Txt>
              <Txt as="p" tone="muted">
                <Txt as="span" weight="medium">
                  {invitation.inviter?.name ?? "A teammate"}
                </Txt>{" "}
                invited you to join{" "}
                <Txt as="span" weight="medium">
                  {invitation.team?.name ?? "a Subi workspace"}
                </Txt>
                .
              </Txt>
              <Txt as="p" size="sm" tone="muted">
                Invitation email: <Txt as="span">{invitation.email}</Txt>
              </Txt>
            </div>
          </div>

          {invitation.status === TEAM_INVITATION_STATUS.PENDING &&
          !isAuthenticated ? (
            <Alert variant="warning">
              <AlertDescription className="flex flex-col gap-4">
                <Txt as="p" size="sm" className="text-center">
                  You need to sign in (or create an account) to accept this
                  invitation.
                </Txt>
                <div className="flex gap-3 justify-end">
                  <Button asChild variant="outline">
                    <Link href={loginHref}>
                      <LogIn />
                      Log in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link href={signupHref}>
                      <UserPlus />
                      Create account
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          ) : null}

          {invitation.status === TEAM_INVITATION_STATUS.PENDING &&
          isAuthenticated ? (
            <div className="flex flex-wrap justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isProcessing}
                onClick={() => rejectMutation.mutate()}
              >
                <X />
                Decline
              </Button>
              <Button
                type="button"
                disabled={isProcessing}
                onClick={() => acceptMutation.mutate()}
              >
                <Check />
                {isProcessing ? "Processing..." : "Accept invitation"}
              </Button>
            </div>
          ) : null}

          {invitation.status !== TEAM_INVITATION_STATUS.PENDING ? (
            <Alert
              variant={
                invitation.status === TEAM_INVITATION_STATUS.ACCEPTED
                  ? "success"
                  : "info"
              }
            >
              <AlertDescription className="flex items-center justify-between gap-4">
                <Txt as="p" size="sm">
                  This invitation has been {invitation.status}.
                </Txt>
                <Button asChild size="sm">
                  <Link href={isAuthenticated ? "/" : "/login"}>
                    {isAuthenticated ? "Go to workspace" : "Go to login"}
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
