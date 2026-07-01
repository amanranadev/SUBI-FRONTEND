"use client";

import { useMemo } from "react";
import { ChevronRight, LogOut, User } from "lucide-react";
import {
  Avatar as AvatarPrimitive,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { SETTINGS_ROUTES } from "@/features/settings/routes";
import Link from "next/link";

const AVATAR_DROPDOWN_TRIGGER_ID = "workspace-avatar-dropdown-trigger";

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const second = parts[1]?.[0] ?? "";
  return `${first}${second}`.toUpperCase() || "SU";
}

function normalizePictureSrc(picture?: string | null): string | null {
  if (typeof picture !== "string") return null;
  const trimmed = picture.trim();
  if (!trimmed || trimmed === "null" || trimmed === "undefined") return null;
  return trimmed;
}

export interface ProfileAvatarProps {
  picture?: string | null;
  name: string;
  className?: string;
  fallbackClassName?: string;
}

export function ProfileAvatar({
  picture,
  name,
  className,
  fallbackClassName,
}: ProfileAvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const pictureSrc = useMemo(() => normalizePictureSrc(picture), [picture]);

  return (
    <AvatarPrimitive className={cn("size-10 bg-rf-gray-500", className)}>
      {pictureSrc ? (
        <AvatarImage
          key={pictureSrc}
          src={pictureSrc}
          alt={`${name}'s profile`}
          referrerPolicy="no-referrer"
          className="object-cover"
        />
      ) : null}
      <AvatarFallback
        className={cn(
          "bg-rf-gray-500 font-semibold text-primary",
          fallbackClassName,
        )}
      >
        {initials}
      </AvatarFallback>
    </AvatarPrimitive>
  );
}

export interface ProfileAvatarDropdownProps {
  name: string;
  email: string;
  picture?: string | null;
  isOpen?: boolean;
  avatarClassName?: string;
  onLogout: () => Promise<void> | void;
}

export function AvatarDropdown({
  name,
  email,
  picture,
  isOpen = true,
  avatarClassName,
  onLogout,
}: ProfileAvatarDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        id={AVATAR_DROPDOWN_TRIGGER_ID}
        className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-black/[0.03] outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0"
      >
        <ProfileAvatar
          name={name}
          picture={picture}
          className={avatarClassName}
        />
        {isOpen ? (
          <>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        side="right"
        className="min-w-[200px] min-h-[80px] rounded-lg"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
        }}
      >
        {!isOpen ? (
          <div className="mb-1 flex items-center gap-3 rounded-md bg-muted px-2 py-2">
            <ProfileAvatar picture={picture} name={name} />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {name}
              </p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>
        ) : null}
        <DropdownMenuItem asChild className="cursor-pointer rounded-lg">
          <Link href={SETTINGS_ROUTES.PROFILE}>
            <User className="size-4" />
            Profile
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem
          onSelect={() => {
            void onLogout();
          }}
          className="cursor-pointer rounded-lg"
        >
          <LogOut className="size-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
