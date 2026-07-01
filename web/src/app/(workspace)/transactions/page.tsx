"use client";

import * as React from "react";
import Link from "next/link";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/lib/auth/context";

import { TransactionsPageHeader } from "@/features/transactions/components/transactions-page-header";
import { TransactionsToolbar } from "@/features/transactions/components/transactions-toolbar";
import { TransactionsListContent } from "@/features/transactions/components/transactions-list-content";
import { TransactionsListSkeleton } from "@/features/transactions/components/transactions-list-skeleton";
import { InviteAgentsForm } from "@/features/team_invitations/components/invite-agents-form";
import { Button, Card } from "@/shared/ui";
import { Skeleton } from "@/shared/ui/skeleton";
import { useTransactionsPageViewState } from "@/features/transactions/hooks/use-transactions-page-view-state";

export default function TransactionsPage() {
  const { user } = useAuth();

  const {
    transactions,
    isTransactionsLoading,
    transactionsError,
    refetchTransactions,
    handleTransactionStatusChanged,
    userRole,
    brokerInvited,
    team,
    isTeamLoading,
    refetchTeam,
    viewMode,
    sortBy,
    transactionsFilter,
    setBrokerInvited,
    setUserRole,
    setViewMode,
    setSortBy,
    setTransactionsFilter,
    selectedTeamId,
    canUseBrokerMode,
  } = useWorkspace();
  const {
    effectiveUserRole,
    pendingInvitationsCount,
    showInviteScreen,
    showManageTeamButton,
    myTransactions,
    teamTransactions,
    handleInviteComplete,
    getAgentDisplayName,
    getAgentGroup,
  } = useTransactionsPageViewState({
    user,
    userId: user?.id,
    userEmail: user?.email,
    userType: user?.userType,
    selectedTeamId,
    canUseBrokerMode,
    brokerInvited,
    isTeamLoading,
    team,
    transactions,
    sortBy,
    setBrokerInvited,
    refetchTeam,
  });

  React.useEffect(() => {
    if (!effectiveUserRole) return;
    if (userRole === effectiveUserRole) return;
    setUserRole(effectiveUserRole);
  }, [effectiveUserRole, setUserRole, userRole]);

  if (effectiveUserRole === null) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        <div className="flex items-end justify-between border-b border-black/[0.03] pb-6">
          <Skeleton className="h-12 w-80 rounded-2xl" />
        </div>
        <TransactionsListSkeleton viewMode={viewMode} />
      </div>
    );
  }

  if (showInviteScreen && selectedTeamId) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-32">
        <TransactionsPageHeader userRole={effectiveUserRole} />
        <Card className="glass-card rounded-[3rem] p-8 md:p-10 heavy-shadow border-0">
          <InviteAgentsForm
            teamId={selectedTeamId}
            currentUserEmail={user?.email ?? ""}
            onSuccess={handleInviteComplete}
            existingMembersCount={team?.members.length ?? 0}
            pendingInvitationsCount={pendingInvitationsCount}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto h-full min-h-0 flex flex-col gap-8 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="shrink-0 space-y-8">
        <TransactionsPageHeader userRole={effectiveUserRole} />
        {showManageTeamButton ? (
          <div className="flex justify-end -mt-4">
            <Button asChild className="h-12 !rounded-2xl px-6 font-bold">
              <Link href="/transactions/team">Manage Team</Link>
            </Button>
          </div>
        ) : null}

        <TransactionsToolbar
          sortBy={sortBy}
          viewMode={viewMode}
          transactionsFilter={transactionsFilter}
          onSortChange={setSortBy}
          onTransactionsFilterChange={setTransactionsFilter}
          onViewModeChange={setViewMode}
        />
      </div>

      <div className="subtle-scrollbar flex-1 min-h-0 overflow-y-auto pr-4 pb-32">
        <div className="space-y-8">
          <TransactionsListContent
            viewMode={viewMode}
            isLoading={isTransactionsLoading}
            error={transactionsError}
            transactions={myTransactions}
            groupByAgent={false}
            getAgentDisplayName={getAgentDisplayName}
            getAgentGroup={getAgentGroup}
            onRetry={refetchTransactions}
            onStatusChanged={handleTransactionStatusChanged}
          />

          {teamTransactions.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-black/[0.03]">
              <TransactionsListContent
                viewMode={viewMode}
                isLoading={false}
                error={null}
                transactions={teamTransactions}
                groupByAgent
                getAgentDisplayName={getAgentDisplayName}
                getAgentGroup={getAgentGroup}
                onRetry={refetchTransactions}
                onStatusChanged={handleTransactionStatusChanged}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
