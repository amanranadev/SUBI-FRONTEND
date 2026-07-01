"use client"

import {
  Building2,
  Edit3,
  MoreVertical,
  Star,
  Trash2,
  UserRound,
} from "lucide-react"
import { CONTACT_VIEW_MODES } from "@/features/contacts/constants"
import type { ContactResult } from "@/features/contacts/types"
import {
  getContactBadgeLabel,
  getContactDisplayName,
  getContactSubtitle,
} from "@/features/contacts/utils"
import { cn } from "@/lib/utils"
import { Button } from "@/shared/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"

interface ContactCardProps {
  contact: ContactResult
  viewMode: (typeof CONTACT_VIEW_MODES)[keyof typeof CONTACT_VIEW_MODES]
  onEdit: (contact: ContactResult) => void
  onDelete: (contact: ContactResult) => void
  onToggleFavorite: (contactId: string) => void
  isBusy?: boolean
}

export function ContactCard({
  contact,
  viewMode,
  onEdit,
  onDelete,
  onToggleFavorite,
  isBusy = false,
}: ContactCardProps) {
  const displayName = getContactDisplayName(contact)
  const subtitle = getContactSubtitle(contact)
  const vendorLabel = getContactBadgeLabel(contact)
  const isList = viewMode === CONTACT_VIEW_MODES.LIST

  return (
    <div
      className={cn(
        "glass-card group relative overflow-hidden rounded-[2rem] border-white/60 p-5 shadow-default transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg",
        isList && "flex items-center gap-5",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-foreground/5 to-foreground/10 text-foreground/60",
          isList ? "h-14 w-14 shrink-0" : "mb-5 h-16 w-16",
        )}
      >
        {contact.company_name ? (
          <Building2 className="size-6" />
        ) : (
          <UserRound className="size-6" />
        )}
      </div>

      <div className={cn("min-w-0", isList ? "flex-1" : "space-y-4")}>
        <div className="space-y-1">
          <h3 className="truncate text-lg font-bold tracking-tight">
            {displayName}
          </h3>
          <p className="truncate text-sm text-foreground/50">{subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            {vendorLabel}
          </span>
          {contact.company_name && contact.company_name !== displayName ? (
            <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/55">
              {contact.company_name}
            </span>
          ) : null}
          {contact.provider_display_name ? (
            <span className="rounded-full bg-black/[0.04] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-foreground/55">
              {contact.provider_display_name}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "flex items-center gap-2",
          isList ? "shrink-0 self-start" : "absolute right-4 top-4",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={isBusy}
          onClick={() => onToggleFavorite(contact.id)}
          className={cn(
            "rounded-full",
            contact.is_favorite
              ? "text-yellow-500 hover:text-yellow-600"
              : "text-foreground/35 hover:text-yellow-500",
          )}
        >
          <Star className={cn("size-4", contact.is_favorite && "fill-current")} />
        </Button>

        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-foreground/40 hover:text-foreground"
            >
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onSelect={() => onEdit(contact)}>
              <Edit3 className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => onDelete(contact)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
