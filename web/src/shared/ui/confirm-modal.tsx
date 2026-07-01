"use client";

import * as React from "react";
import { AlertTriangle, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import { MODAL_RADIUS, MODAL_SIZE, MODAL_SPACING, Modal } from "@/shared/ui/modal";
import { Txt } from "@/shared/ui/txt";

export const CONFIRM_MODAL_VARIANT = {
  DEFAULT: "default",
  WARNING: "warning",
  DANGER: "danger",
  DESTRUCTIVE: "destructive",
} as const;

export type ConfirmModalVariant =
  (typeof CONFIRM_MODAL_VARIANT)[keyof typeof CONFIRM_MODAL_VARIANT];

export type ConfirmModalOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmModalVariant;
  confirmButtonClassName?: string;
  cancelButtonClassName?: string;
  contentClassName?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
};

export type ConfirmModalRef = {
  open: (options: ConfirmModalOptions) => void;
  close: () => void;
  confirm: (options: ConfirmModalOptions) => Promise<boolean>;
};

const DEFAULT_OPTIONS: Required<
  Omit<
    ConfirmModalOptions,
    | "title"
    | "description"
    | "confirmButtonClassName"
    | "cancelButtonClassName"
    | "contentClassName"
    | "onConfirm"
    | "onCancel"
  >
> = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
  variant: CONFIRM_MODAL_VARIANT.DEFAULT,
};

type ConfirmModalProps = Partial<ConfirmModalOptions> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  isConfirming?: boolean;
  trigger?: React.ReactNode;
};

export const ConfirmModal = React.forwardRef<ConfirmModalRef, ConfirmModalProps>(
  function ConfirmModal(
    {
      open: controlledOpen,
      onOpenChange: controlledOnOpenChange,
      title,
      description,
      confirmLabel,
      cancelLabel,
      variant,
      confirmButtonClassName,
      cancelButtonClassName,
      contentClassName,
      onConfirm,
      onCancel,
      isConfirming = false,
      trigger,
    },
    ref,
  ) {
    const isControlled = typeof controlledOpen === "boolean";
    const [internalOpen, setInternalOpen] = React.useState(false);
    const [internalOptions, setInternalOptions] = React.useState<ConfirmModalOptions>({
      title: "",
    });
    const resolverRef = React.useRef<((value: boolean) => void) | null>(null);

    const resolvedOpen = isControlled ? controlledOpen : internalOpen;

    const close = React.useCallback(() => {
      if (isControlled) {
        controlledOnOpenChange?.(false);
        return;
      }
      setInternalOpen(false);
    }, [controlledOnOpenChange, isControlled]);

    const settle = React.useCallback((value: boolean) => {
      resolverRef.current?.(value);
      resolverRef.current = null;
    }, []);

    React.useImperativeHandle(
      ref,
      () => ({
        open(nextOptions) {
          resolverRef.current = null;
          setInternalOptions(nextOptions);
          if (isControlled) {
            controlledOnOpenChange?.(true);
            return;
          }
          setInternalOpen(true);
        },
        close,
        confirm(nextOptions) {
          setInternalOptions(nextOptions);
          if (isControlled) {
            controlledOnOpenChange?.(true);
          } else {
            setInternalOpen(true);
          }
          return new Promise<boolean>((resolve) => {
            resolverRef.current = resolve;
          });
        },
      }),
      [close, controlledOnOpenChange, isControlled],
    );

    const mergedOptions = React.useMemo(
      () => ({
        ...DEFAULT_OPTIONS,
        ...internalOptions,
        title: title ?? internalOptions.title,
        description: description ?? internalOptions.description,
        confirmLabel: confirmLabel ?? internalOptions.confirmLabel ?? DEFAULT_OPTIONS.confirmLabel,
        cancelLabel: cancelLabel ?? internalOptions.cancelLabel ?? DEFAULT_OPTIONS.cancelLabel,
        variant: variant ?? internalOptions.variant ?? DEFAULT_OPTIONS.variant,
        confirmButtonClassName:
          confirmButtonClassName ?? internalOptions.confirmButtonClassName,
        cancelButtonClassName:
          cancelButtonClassName ?? internalOptions.cancelButtonClassName,
        contentClassName: contentClassName ?? internalOptions.contentClassName,
        onConfirm: onConfirm ?? internalOptions.onConfirm,
        onCancel: onCancel ?? internalOptions.onCancel,
      }),
      [
        cancelButtonClassName,
        cancelLabel,
        confirmButtonClassName,
        confirmLabel,
        contentClassName,
        description,
        internalOptions,
        onCancel,
        onConfirm,
        title,
        variant,
      ],
    );

    const isDestructive =
      mergedOptions.variant === CONFIRM_MODAL_VARIANT.DESTRUCTIVE ||
      mergedOptions.variant === CONFIRM_MODAL_VARIANT.DANGER;
    const isWarning = mergedOptions.variant === CONFIRM_MODAL_VARIANT.WARNING;
    const Icon = isDestructive ? ShieldAlert : AlertTriangle;
    const iconContainerClasses = isDestructive
      ? "bg-destructive/12 text-destructive ring-1 ring-destructive/20"
      : isWarning
        ? "bg-yellow-500/12 text-yellow-700 ring-1 ring-yellow-500/25"
        : "bg-primary/12 text-primary ring-1 ring-primary/20";
    const confirmVariant = isDestructive ? "destructive" : "outline-yellow";

    const handleOpenChange = (nextOpen: boolean) => {
      if (!isControlled) {
        setInternalOpen(nextOpen);
      }
      controlledOnOpenChange?.(nextOpen);
      if (!nextOpen) {
        if (resolverRef.current) {
          settle(false);
        }
      }
    };

    const handleCancel = () => {
      close();
      mergedOptions.onCancel?.();
      settle(false);
    };

    const handleConfirm = async () => {
      if (isConfirming) return;

      close();
      await mergedOptions.onConfirm?.();
      settle(true);
    };

    return (
      <Modal
        open={resolvedOpen}
        onOpenChange={handleOpenChange}
        title={mergedOptions.title}
        description={mergedOptions.description ?? "Confirmation dialog"}
        trigger={trigger}
        size={MODAL_SIZE.SM}
        radius={MODAL_RADIUS.SOFT}
        spacing={MODAL_SPACING.COMPACT}
        contentClassName={cn(
          "max-w-[460px] gap-6 border-border/70 pt-7 [&>button]:right-5 [&>button]:top-5 [&>button]:size-9",
          mergedOptions.contentClassName,
        )}
        headerClassName="sr-only"
        footerClassName="gap-2"
        showCloseButton
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              className={mergedOptions.cancelButtonClassName}
              onClick={handleCancel}
              disabled={isConfirming}
            >
              {mergedOptions.cancelLabel}
            </Button>
            <Button
              type="button"
              variant={confirmVariant}
              className={mergedOptions.confirmButtonClassName}
              onClick={() => void handleConfirm()}
              disabled={isConfirming}
            >
              {isConfirming ? "Processing..." : mergedOptions.confirmLabel}
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-full",
              iconContainerClasses,
            )}
          >
            <Icon className="size-5" />
          </div>
          <div className="flex flex-1 flex-col gap-1.5 pr-12">
            <Txt
              as="h2"
              family="clean"
              size="xl"
              weight="bold"
              className="text-foreground"
            >
              {mergedOptions.title}
            </Txt>
            {mergedOptions.description ? (
              <Txt
                as="p"
                family="clean"
                size="sm"
                tone="muted"
                className="text-sm/6"
              >
                {mergedOptions.description}
              </Txt>
            ) : null}
          </div>
        </div>
      </Modal>
    );
  },
);
