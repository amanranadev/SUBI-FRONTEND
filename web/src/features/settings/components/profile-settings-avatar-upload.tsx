"use client"

import { ProfileAvatar } from "@/shared/ui"
import { ImageUpload } from "@/shared/ui/image-upload"

type ProfileSettingsAvatarUploadProps = {
  fullName: string
  avatarPreview: string
  isBusy: boolean
  onAvatarFileChange: (file: File | null) => void
}

export function ProfileSettingsAvatarUpload({
  fullName,
  avatarPreview,
  isBusy,
  onAvatarFileChange,
}: ProfileSettingsAvatarUploadProps) {
  return (
    <ImageUpload
      src={avatarPreview || null}
      fallback={
        <ProfileAvatar
          name={fullName}
          picture={avatarPreview}
          className="h-full w-full rounded-none bg-transparent"
          fallbackClassName="text-4xl font-bold text-primary bg-primary/5"
        />
      }
      isBusy={isBusy}
      onFileChange={onAvatarFileChange}
    />
  )
}
