"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppSidebar } from "@/features/workspace/components/app-sidebar";
import { TransactionDialog } from "@/features/transactions/components/transaction-dialog";
import { SETTINGS_ROUTES } from "@/features/settings/routes";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { WorkspaceProvider, useWorkspace } from "@/features/workspace/context";
import { ChatWidget } from "@/features/chat/components/chat-widget";
import { ChatWidgetProvider } from "@/features/chat/context";
import { toast } from "@/shared/hooks/use-toast";
import type { Transaction } from "@/features/workspace/types";
import type { TransactionFormData } from "@/features/transactions/types";
import { WORKSPACE_ROUTES } from "@/features/workspace/routes";
import { TRANSACTIONS_ROUTES } from "@/features/transactions/routes";
import { CALENDAR_ROUTES } from "@/features/calendar/routes";
import { TASKS_ROUTES } from "@/features/tasks/routes";
import { useWorkspaceAccessValidation } from "@/features/workspace/hooks/use-workspace-access-validation";
import { useAuth } from "@/lib/auth/context";

function shouldRedirectToBillingWhenStripeIsLive(input: {
  isBillingRoute: boolean;
  isProtectedWorkspaceRoute: boolean;
  shouldLockWorkspace: boolean;
}) {
  return (
    !input.isBillingRoute &&
    input.isProtectedWorkspaceRoute &&
    input.shouldLockWorkspace
  );
}

function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const isBillingRoute =
    pathname.startsWith(SETTINGS_ROUTES.BILLING) ||
    pathname.startsWith("/settings/subscription");
  const isProtectedWorkspaceRoute =
    pathname === WORKSPACE_ROUTES.ROOT ||
    pathname === WORKSPACE_ROUTES.HOME ||
    pathname.startsWith(TRANSACTIONS_ROUTES.ROOT) ||
    pathname.startsWith(CALENDAR_ROUTES.ROOT) ||
    pathname.startsWith(TASKS_ROUTES.ROOT);
  const {
    transactions,
    isDialogOpen,
    setIsDialogOpen,
    closeTransactionDialog,
    extractedData,
    dialogSourceFileId,
    handleSaveTransaction,
    selectedTeamId,
    availableTeams,
  } = useWorkspace();
  const isTeamSelectionReady =
    availableTeams.length === 0 || Boolean(selectedTeamId);
  const { shouldLockWorkspace } = useWorkspaceAccessValidation({
    user,
    selectedTeamId,
    queryKey: ["workspace-lock-status"],
    enabled: isTeamSelectionReady,
  });
  const [isSavingTransaction, setIsSavingTransaction] = React.useState(false);

  const currentView = pathname.startsWith(`${TRANSACTIONS_ROUTES.ROOT}/`)
    ? ("detail" as const)
    : pathname.startsWith(TRANSACTIONS_ROUTES.ROOT)
      ? ("transactions" as const)
      : ("home" as const);

  const activeTransactionId = (() => {
    if (currentView !== "detail") return undefined;
    return pathname.split("/").pop();
  })();

  const activeTransactionTitle = (() => {
    if (!activeTransactionId) return undefined;
    return transactions.find((t) => t.id === activeTransactionId)?.address;
  })();

  React.useEffect(() => {
    if (
      !shouldRedirectToBillingWhenStripeIsLive({
        isBillingRoute,
        isProtectedWorkspaceRoute,
        shouldLockWorkspace,
      })
    ) {
      return;
    }
    router.replace(SETTINGS_ROUTES.BILLING);
  }, [isBillingRoute, isProtectedWorkspaceRoute, router, shouldLockWorkspace]);

  React.useEffect(() => {
    if (
      isSavingTransaction &&
      pathname.startsWith(TRANSACTIONS_ROUTES.SUCCESS)
    ) {
      closeTransactionDialog();
      setIsSavingTransaction(false);
    }
  }, [closeTransactionDialog, isSavingTransaction, pathname]);

  const handleTransactionSave = React.useCallback(
    async (transaction: Transaction, formData?: TransactionFormData) => {
      setIsSavingTransaction(true);
      try {
        const saved = await handleSaveTransaction(transaction, {
          closeDialog: false,
          formData,
          sourceFileId: dialogSourceFileId,
        });
        router.push(
          `${TRANSACTIONS_ROUTES.SUCCESS}?transactionId=${encodeURIComponent(saved.id)}`,
        );
      } catch {
        setIsSavingTransaction(false);
        toast({
          title: "Error",
          description: "Could not save transaction. Please try again.",
          variant: "destructive",
        });
      }
    },
    [handleSaveTransaction, dialogSourceFileId, router],
  );

  return (
    <>
      <SidebarProvider defaultOpen>
        <AppSidebar />
        <SidebarInset className="bg-transparent h-svh overflow-hidden flex flex-col">
          <main className="flex-1 flex flex-col pt-8 px-12 pb-12 overflow-y-auto relative min-h-0">
            {children}
          </main>

          <TransactionDialog
            isOpen={isDialogOpen}
            onOpenChange={(open) => {
              if (!open && isSavingTransaction) return;
              setIsDialogOpen(open);
            }}
            onSave={handleTransactionSave}
            initialData={extractedData}
            sourceFileId={dialogSourceFileId}
            isSaving={isSavingTransaction}
          />
        </SidebarInset>
      </SidebarProvider>

      {!shouldLockWorkspace && (
        <ChatWidget
          currentView={currentView}
          transactionTitle={activeTransactionTitle}
          transactionId={activeTransactionId}
          onViewChange={(nextView) =>
            router.push(
              nextView === "home"
                ? WORKSPACE_ROUTES.HOME
                : TRANSACTIONS_ROUTES.ROOT,
            )
          }
        />
      )}
    </>
  );
}

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <ChatWidgetProvider>
        <WorkspaceShell>{children}</WorkspaceShell>
      </ChatWidgetProvider>
    </WorkspaceProvider>
  );
}
