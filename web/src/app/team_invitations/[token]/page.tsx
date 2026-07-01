"use client";

import { useParams } from "next/navigation";
import { TeamInvitationDetailsView } from "@/features/team_invitations/views/team-invitation-details-view";

export default function TeamInvitationDetailsPage() {
  const params = useParams<{ token: string }>();
  return <TeamInvitationDetailsView token={params.token} />;
}
