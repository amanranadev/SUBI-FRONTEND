"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogTitle,
} from "@/shared/ui/modal-primitives";
import { Button } from "@/shared/ui/button";

export const MODAL_SIZE = {
  SM: "sm",
  MD: "md",
  LG: "lg",
  XL: "xl",
  FULL: "full",
} as const;

export const MODAL_RADIUS = {
  SOFT: "soft",
  ROUNDED: "rounded",
  PILL: "pill",
} as const;

export const MODAL_SPACING = {
  COMPACT: "compact",
  DEFAULT: "default",
  COMFORTABLE: "comfortable",
} as const;

export type ModalSize = (typeof MODAL_SIZE)[keyof typeof MODAL_SIZE];
export type ModalRadius = (typeof MODAL_RADIUS)[keyof typeof MODAL_RADIUS];
export type ModalSpacing = (typeof MODAL_SPACING)[keyof typeof MODAL_SPACING];

export type ModalAction = {
  label: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "outline-dark"
    | "outline-yellow"
    | "ghost"
    | "ghost-destructive";
  className?: string;
};

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  header?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  actions?: ModalAction[];
  hideHeader?: boolean;
  showCloseButton?: boolean;
  overlayClassName?: string;
  size?: ModalSize;
  radius?: ModalRadius;
  spacing?: ModalSpacing;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  onInteractOutside?: (event: Event) => void;
  ariaDescribedBy?: string;
};

export function Modal({
  open,
  onOpenChange,
  trigger,
  title,
  description,
  header,
  children,
  footer,
  actions,
  hideHeader = false,
  showCloseButton = true,
  overlayClassName = "bg-black/80 backdrop-blur-[1px]",
  size = MODAL_SIZE.MD,
  radius = MODAL_RADIUS.PILL,
  spacing = MODAL_SPACING.DEFAULT,
  contentClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  bodyClassName,
  footerClassName,
  onInteractOutside,
  ariaDescribedBy,
}: ModalProps) {
  const resolvedTitle = title ?? "Dialog";
  const resolvedDescription = description ?? "Dialog content";
  const resolvedFooter =
    footer ??
    (actions && actions.length > 0 ? (
      <>
        {actions.map((action, index) => (
          <Button
            // eslint-disable-next-line react/no-array-index-key
            key={`modal-action-${index}`}
            type="button"
            variant={action.variant}
            disabled={action.disabled || action.loading}
            className={action.className}
            onClick={action.onClick}
          >
            {action.loading ? "Loading..." : action.label}
          </Button>
        ))}
      </>
    ) : null);

  const sizeClassName =
    size === MODAL_SIZE.SM
      ? "max-w-sm"
      : size === MODAL_SIZE.LG
        ? "max-w-2xl"
        : size === MODAL_SIZE.XL
          ? "max-w-4xl"
          : size === MODAL_SIZE.FULL
            ? "w-[96vw] max-w-[96vw]"
            : "max-w-lg";

  const radiusClassName =
    radius === MODAL_RADIUS.SOFT
      ? "rounded-2xl sm:rounded-2xl"
      : radius === MODAL_RADIUS.ROUNDED
        ? "rounded-3xl sm:rounded-3xl"
        : "rounded-[3rem] sm:rounded-[3rem]";

  const spacingClassName =
    spacing === MODAL_SPACING.COMPACT
      ? "p-6"
      : spacing === MODAL_SPACING.COMFORTABLE
        ? "p-10"
        : "p-8";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        aria-describedby={ariaDescribedBy}
        overlayClassName={overlayClassName}
        showCloseButton={showCloseButton}
        onInteractOutside={onInteractOutside as never}
        className={cn(
          "border-black/5",
          sizeClassName,
          radiusClassName,
          spacingClassName,
          contentClassName,
        )}
      >
        {hideHeader ? (
          <DialogHeader className="sr-only">
            <DialogTitle>{resolvedTitle}</DialogTitle>
            <DialogDescription>{resolvedDescription}</DialogDescription>
          </DialogHeader>
        ) : null}
        {hideHeader ? null : header ? (
          header
        ) : (
          <DialogHeader
            className={cn(
              "text-left",
              title || description ? "space-y-2" : "sr-only",
              headerClassName,
            )}
          >
            <DialogTitle
              className={cn(
                !(title || description) && "sr-only",
                "text-xl font-bold tracking-tight",
                titleClassName,
              )}
            >
              {resolvedTitle}
            </DialogTitle>
            <DialogDescription
              className={cn(!(title || description) && "sr-only", descriptionClassName)}
            >
              {resolvedDescription}
            </DialogDescription>
          </DialogHeader>
        )}

        {bodyClassName ? <div className={bodyClassName}>{children}</div> : children}
        {resolvedFooter ? (
          <DialogFooter className={footerClassName}>{resolvedFooter}</DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
