import * as React from "react";
import { Star, X } from "lucide-react";
import { DialogClose, DialogDescription, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { cn } from "@/lib/utils";

interface ContactFormHeaderProps {
  isEdit: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onCancel?: () => void;
}

export function ContactFormHeader({
  isEdit,
  isFavorite,
  onToggleFavorite,
  onCancel,
}: ContactFormHeaderProps) {
  return (
    <div className="border-b border-black/[0.04] bg-gradient-to-br from-white via-background to-amber-50/40 px-6 py-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit Contact" : "Add Contact"}
          </DialogTitle>
          <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-foreground/55">
            {isEdit
              ? "Update the contact details and keep your vendor network current."
              : "Add a new vendor or service provider to your contacts."}
          </DialogDescription>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "rounded-full bg-black/[0.03] text-foreground/50 hover:bg-yellow-100 hover:text-yellow-600",
              isFavorite && "bg-yellow-100 text-yellow-600",
            )}
            onClick={onToggleFavorite}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={cn("size-4", isFavorite && "fill-current")} />
          </Button>

          {onCancel ? (
            <DialogClose asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="rounded-full text-foreground/60 hover:bg-black/[0.04] hover:text-foreground"
                aria-label="Close contact form"
              >
                <X className="size-5" />
              </Button>
            </DialogClose>
          ) : null}
        </div>
      </div>
    </div>
  );
}
