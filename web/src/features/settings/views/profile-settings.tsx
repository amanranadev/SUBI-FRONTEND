"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ProfileSettingsAccountDeletionCard } from "@/features/settings/components/profile-settings-account-deletion-card";
import { ProfileSettingsAvatarPanel } from "@/features/settings/components/profile-settings-avatar-panel";
import { ProfileSettingsCalendarSyncCard } from "@/features/settings/components/profile-settings-calendar-sync-card";
import { ProfileSettingsConnectedAccountsCard } from "@/features/settings/components/profile-settings-connected-accounts-card";
import { ProfileSettingsFormCard } from "@/features/settings/components/profile-settings-form-card";
import { ProfileSettingsPhoneNumbersCard } from "@/features/settings/components/profile-settings-phone-numbers-card";
import { ProfileSettingsPasswordCard } from "@/features/settings/components/profile-settings-password-card";
import { ProfileSettingsSecondaryEmailsCard } from "@/features/settings/components/profile-settings-secondary-emails-card";
import { ProfileSettingsThirdPartyIntegrationsCard } from "@/features/settings/components/profile-settings-third-party-integrations-card";
import { ProfileSettingsTeamCard } from "@/features/settings/components/profile-settings-team-card";
import { useCurrentSubscriptionAccess } from "@/features/settings/hooks/use-current-subscription-access";
import {
  normalizeSubscriptionPlanName,
  SUBSCRIPTION_PLAN,
} from "@/features/settings/api/profile-billing-service";
import { useProfileSettingsForm } from "@/features/settings/hooks/use-profile-settings-form";
import { useAgentTeamMembership } from "@/features/team/hooks/use-agent-team-membership";
import { getTeam } from "@/features/team/api/team-service";
import { TEAM_MEMBER_ROLE } from "@/features/team/constants";
import { useAuth } from "@/lib/auth/context";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui";

export function ProfileSettings() {
  const { logout } = useAuth();
  const { hasMultipleTeams, invitedTeamId, isSoloAgentAccount } =
    useAgentTeamMembership();
  const [activeTab, setActiveTab] = useState("personal");
  const {
    userId,
    form,
    onSubmit,
    fullName,
    primaryEmail,
    primaryPhoneNumber,
    avatarPreview,
    isLoadingProfile,
    isSaving,
    isUploadingAvatar,
    isProfileStatusLoading,
    isProfileComplete,
    completionPercentage,
    uploadAvatar,
    setAvatarFile,
    setAvatarPreview,
  } = useProfileSettingsForm();
  const avatarObjectUrlRef = useRef<string | null>(null);
  const { data: invitedTeam } = useQuery({
    queryKey: ["settings", "invited-team", invitedTeamId],
    queryFn: () => getTeam(invitedTeamId!),
    enabled: hasMultipleTeams && Boolean(invitedTeamId),
  });
  const canManageInvitedTeam = invitedTeam?.role === TEAM_MEMBER_ROLE.OWNER;
  const { data: subscriptionData } = useCurrentSubscriptionAccess({
    queryKey: ["settings", "profile", "subscription-access"],
    enabled: Boolean(userId),
  });
  const normalizedCurrentPlan = normalizeSubscriptionPlanName(
    subscriptionData?.currentPlan?.name,
  );
  const normalizedStripePlan = normalizeSubscriptionPlanName(
    subscriptionData?.stripeSubscription?.planName,
  );
  const isIndividualAgentOnly =
    normalizedCurrentPlan === SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT ||
    normalizedStripePlan === SUBSCRIPTION_PLAN.INDIVIDUAL_AGENT;
  const shouldShowTeamTab =
    !isIndividualAgentOnly && (isSoloAgentAccount || canManageInvitedTeam);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (shouldShowTeamTab) return;
    if (activeTab !== "team") return;
    setActiveTab("personal");
  }, [activeTab, shouldShowTeamTab]);

  const handleAvatarFileChange = useCallback(
    (file: File | null) => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
        avatarObjectUrlRef.current = null;
      }

      setAvatarFile(file);
      if (!file) return;

      const previousPreview = avatarPreview;
      const nextObjectUrl = URL.createObjectURL(file);
      avatarObjectUrlRef.current = nextObjectUrl;
      setAvatarPreview(nextObjectUrl);

      void (async () => {
        try {
          await uploadAvatar(file);
        } catch {
          setAvatarPreview(previousPreview);
          if (avatarObjectUrlRef.current === nextObjectUrl) {
            URL.revokeObjectURL(nextObjectUrl);
            avatarObjectUrlRef.current = null;
          }
        }
      })();
    },
    [avatarPreview, setAvatarFile, setAvatarPreview, uploadAvatar],
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProfileSettingsAvatarPanel
            fullName={fullName}
            avatarPreview={avatarPreview}
            isProfileStatusLoading={isProfileStatusLoading}
            isProfileComplete={isProfileComplete}
            completionPercentage={completionPercentage}
            isBusy={isSaving || isLoadingProfile || isUploadingAvatar}
            onAvatarFileChange={handleAvatarFileChange}
            onLogout={logout}
          />
        </div>
        <div className="lg:col-span-2 ">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-5 "
          >
            <TabsList className="h-auto p-1.5 rounded-2xl bg-white/70 border border-black/5">
              <TabsTrigger value="personal" className="rounded-xl px-4 py-2">
                Personal info
              </TabsTrigger>
              {shouldShowTeamTab ? (
                <TabsTrigger
                  value="team"
                  className="rounded-xl px-4 py-2"
                >
                  Team
                </TabsTrigger>
              ) : null}
              <TabsTrigger
                value="contact-methods"
                className="rounded-xl px-4 py-2"
              >
                Contact methods
              </TabsTrigger>
              <TabsTrigger value="security" className="rounded-xl px-4 py-2">
                Security
              </TabsTrigger>
              <TabsTrigger
                value="connected-accounts"
                className="rounded-xl px-4 py-2"
              >
                Connected accounts
              </TabsTrigger>
              <TabsTrigger
                value="calendar-syncing"
                className="rounded-xl px-4 py-2"
              >
                Calendar
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-0">
              <ProfileSettingsFormCard
                form={form}
                onSubmit={onSubmit}
                isBusy={isSaving}
                isLoadingProfile={isLoadingProfile}
              />
            </TabsContent>

            <TabsContent value="contact-methods" className="mt-0 space-y-8">
              <ProfileSettingsSecondaryEmailsCard
                userId={userId}
                primaryEmail={primaryEmail}
              />
              <ProfileSettingsPhoneNumbersCard
                userId={userId}
                primaryPhoneNumber={primaryPhoneNumber}
              />
            </TabsContent>

            <TabsContent value="security" className="mt-0 space-y-8">
              <ProfileSettingsPasswordCard />
              <ProfileSettingsAccountDeletionCard userId={userId} />
            </TabsContent>

            <TabsContent value="connected-accounts" className="mt-0 space-y-8">
              <ProfileSettingsConnectedAccountsCard userId={userId} />
              <ProfileSettingsThirdPartyIntegrationsCard />
            </TabsContent>

            <TabsContent value="calendar-syncing" className="mt-0">
              <ProfileSettingsCalendarSyncCard userId={userId} />
            </TabsContent>

            {shouldShowTeamTab ? (
              <TabsContent value="team" className="mt-0">
                <ProfileSettingsTeamCard />
              </TabsContent>
            ) : null}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
