"use client";

import { LogOut } from "lucide-react";
import { Button, Card, Separator, Txt } from "@/shared/ui";
import { ProfileSettingsAvatarUpload } from "@/features/settings/components/profile-settings-avatar-upload";
import { ProfileSettingsStatus } from "@/features/settings/components/profile-settings-status";

type ProfileSettingsAvatarPanelProps = {
  fullName: string;
  avatarPreview: string;
  isProfileStatusLoading: boolean;
  isProfileComplete: boolean;
  completionPercentage: number;
  isBusy: boolean;
  onAvatarFileChange: (file: File | null) => void;
  onLogout: () => void;
};

export function ProfileSettingsAvatarPanel({
  fullName,
  avatarPreview,
  isProfileStatusLoading,
  isProfileComplete,
  completionPercentage,
  isBusy,
  onAvatarFileChange,
  onLogout,
}: ProfileSettingsAvatarPanelProps) {
  return (
    <div className="space-y-8">
      <Card className="rounded-[3rem] border-0 heavy-shadow glass-card p-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <ProfileSettingsAvatarUpload
            fullName={fullName}
            avatarPreview={avatarPreview}
            isBusy={isBusy}
            onAvatarFileChange={onAvatarFileChange}
          />

          <div className="space-y-1">
            <Txt as="h2" size="3xl" weight="bold" className="tracking-tight">
              {fullName}
            </Txt>
          </div>

          <Separator className="bg-black/10" />

          <ProfileSettingsStatus
            isLoading={isProfileStatusLoading}
            isComplete={isProfileComplete}
            completionPercentage={completionPercentage}
          />
        </div>
      </Card>

      <Button
        type="button"
        variant="dark"
        size="md"
        className="relative z-[1] w-full !rounded-2xl font-bold gap-2"
        onClick={onLogout}
      >
        <LogOut className="size-4" />
        Logout
      </Button>
    </div>
  );
}
