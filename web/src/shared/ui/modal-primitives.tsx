"use client";

import * as React from "react";
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

const DIALOG_MODE = {
  DEFAULT: "default",
  CONFIRM: "confirm",
} as const;

type DialogMode = (typeof DIALOG_MODE)[keyof typeof DIALOG_MODE];

const DialogModeContext = React.createContext<DialogMode>(DIALOG_MODE.DEFAULT);

function useDialogMode() {
  return React.useContext(DialogModeContext);
}

type BaseDialogProps = {
  mode?: DialogMode;
} & Omit<React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>, "modal">;

function BaseDialog({ mode = DIALOG_MODE.DEFAULT, ...props }: BaseDialogProps) {
  const Root =
    mode === DIALOG_MODE.CONFIRM
      ? AlertDialogPrimitive.Root
      : DialogPrimitive.Root;

  return (
    <DialogModeContext.Provider value={mode}>
      <Root {...props} />
    </DialogModeContext.Provider>
  );
}

const DialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(function DialogTrigger(props, ref) {
  const mode = useDialogMode();
  const Trigger =
    mode === DIALOG_MODE.CONFIRM
      ? AlertDialogPrimitive.Trigger
      : DialogPrimitive.Trigger;

  return <Trigger ref={ref as never} {...props} />;
});

const DialogPortal = (
  props: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>,
) => {
  const mode = useDialogMode();
  const Portal =
    mode === DIALOG_MODE.CONFIRM
      ? AlertDialogPrimitive.Portal
      : DialogPrimitive.Portal;

  return <Portal {...props} />;
};

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  const mode = useDialogMode();
  const Overlay =
    mode === DIALOG_MODE.CONFIRM
      ? AlertDialogPrimitive.Overlay
      : DialogPrimitive.Overlay;

  const modeClassName =
    mode === DIALOG_MODE.CONFIRM
      ? "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      : "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0";

  return (
    <Overlay ref={ref as never} className={cn(modeClassName, className)} {...props} />
  );
});

type DialogContentProps = React.ComponentPropsWithoutRef<
  typeof DialogPrimitive.Content
> & {
  mode?: DialogMode;
  overlayClassName?: string;
  showCloseButton?: boolean;
};

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  DialogContentProps
>(function DialogContent(
  {
    className,
    children,
    mode: contentMode,
    overlayClassName,
    showCloseButton = true,
    ...props
  },
  ref,
) {
  const contextMode = useDialogMode();
  const mode = contentMode ?? contextMode;
  const Content =
    mode === DIALOG_MODE.CONFIRM
      ? AlertDialogPrimitive.Content
      : DialogPrimitive.Content;

  const modeClassName =
    mode === DIALOG_MODE.CONFIRM
      ? "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"
      : "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:pointer-events-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-[3rem]";

  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      <Content ref={ref as never} className={cn(modeClassName, className)} {...props}>
        {children}
        {mode === DIALOG_MODE.DEFAULT && showCloseButton ? (
          <DialogPrimitive.Close className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="size-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        ) : null}
      </Content>
    </DialogPortal>
  );
});

const DialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(function DialogClose(props, ref) {
  const mode = useDialogMode();
  const Close =
    mode === DIALOG_MODE.CONFIRM
      ? AlertDialogPrimitive.Cancel
      : DialogPrimitive.Close;

  return <Close ref={ref as never} {...props} />;
});

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const mode = useDialogMode();
  const spacing = mode === DIALOG_MODE.CONFIRM ? "space-y-2" : "space-y-1.5";

  return (
    <div
      className={cn(`flex flex-col text-center sm:text-left ${spacing}`, className)}
      {...props}
    />
  );
};

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className,
    )}
    {...props}
  />
);

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  const mode = useDialogMode();

  if (mode === DIALOG_MODE.CONFIRM) {
    return (
      <AlertDialogPrimitive.Title
        ref={ref as never}
        className={cn("text-lg font-semibold", className)}
        {...props}
      />
    );
  }

  return (
    <DialogPrimitive.Title
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  const mode = useDialogMode();

  if (mode === DIALOG_MODE.CONFIRM) {
    return (
      <AlertDialogPrimitive.Description
        ref={ref as never}
        className={cn("text-sm text-muted-foreground", className)}
        {...props}
      />
    );
  }

  return (
    <DialogPrimitive.Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(function AlertDialogAction({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Action
      ref={ref}
      className={cn(buttonVariants(), className)}
      {...props}
    />
  );
});

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(function AlertDialogCancel({ className, ...props }, ref) {
  return (
    <AlertDialogPrimitive.Cancel
      ref={ref}
      className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
      {...props}
    />
  );
});

const Dialog = BaseDialog;
function AlertDialog(props: Omit<BaseDialogProps, "mode">) {
  return <BaseDialog mode={DIALOG_MODE.CONFIRM} {...props} />;
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  AlertDialog,
  DialogPortal as AlertDialogPortal,
  DialogOverlay as AlertDialogOverlay,
  DialogTrigger as AlertDialogTrigger,
  DialogContent as AlertDialogContent,
  DialogHeader as AlertDialogHeader,
  DialogFooter as AlertDialogFooter,
  DialogTitle as AlertDialogTitle,
  DialogDescription as AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
