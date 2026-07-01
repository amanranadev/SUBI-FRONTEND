"use client";

import * as React from "react";
import type { Transaction } from "@/features/workspace/types";
import type { Team, UserRole } from "@/features/team/types";
import { TEAM_MEMBER_ROLE, USER_ROLE } from "@/features/team/constants";
import { listTeamInvitations } from "@/features/team_invitations/api/team-invitation-service";
import {
  TEAM_INVITATION_STATUS,
  type TeamInvitationStatus,
} from "@/features/team_invitations/constants";
import { getStatusRank } from "@/features/transactions/utils/transaction-status";
import {
  COMPLETE_PROFILE_USER_TYPE,
  parseCompleteProfileUserTypeFromApi,
} from "@/features/complete-profile/constants";
import { useWorkspaceAccessValidation } from "@/features/workspace/hooks/use-workspace-access-validation";
import type { User } from "@/lib/auth/types";
import { useQuery } from "@tanstack/react-query";

const PENDING_INVITATIONS_QUERY_KEY = [
  "team_invitations",
  "transactions",
] as const;

type UseTransactionsPageViewStateInput = {
  user: User | null | undefined;
  userId: string | null | undefined;
  userEmail: string | null | undefined;
  userType: string | null | undefined;
  selectedTeamId: string | null;
  canUseBrokerMode: boolean;
  brokerInvited: boolean;
  isTeamLoading: boolean;
  team: Team | undefined;
  transactions: Transaction[];
  sortBy: "recent" | "status";
  setBrokerInvited: (value: boolean) => void;
  refetchTeam: () => void;
};

export function useTransactionsPageViewState({
  user,
  userId,
  userEmail,
  userType,
  selectedTeamId,
  canUseBrokerMode,
  brokerInvited,
  isTeamLoading,
  team,
  transactions,
  sortBy,
  setBrokerInvited,
  refetchTeam,
}: UseTransactionsPageViewStateInput) {
  const {
    hasActivePaidTeamSubscription,
    isInvitedTeamContext,
    subscriptionQuery,
  } = useWorkspaceAccessValidation({
    user,
    selectedTeamId,
    queryKey: ["transactions", "current-subscription-role-source"],
  });

  const { data: invitations = [], isLoading: isInvitationsLoading } = useQuery({
    queryKey: [...PENDING_INVITATIONS_QUERY_KEY, selectedTeamId],
    queryFn: () => listTeamInvitations(selectedTeamId!),
    enabled: Boolean(selectedTeamId) && userEmail != null,
  });

  const pendingInvitationsCount = React.useMemo(
    () =>
      (invitations as { status?: TeamInvitationStatus }[]).filter(
        (i) => i.status === TEAM_INVITATION_STATUS.PENDING,
      ).length,
    [invitations],
  );

  const normalizedUserType = parseCompleteProfileUserTypeFromApi(userType);
  const isTcUserType =
    normalizedUserType === COMPLETE_PROFILE_USER_TYPE.TRANSACTION_COORDINATOR ||
    normalizedUserType === COMPLETE_PROFILE_USER_TYPE.BOTH;
  const isInvitedTeamMember = isInvitedTeamContext;

  const hasSelectedTeamSubscriptionResult =
    !selectedTeamId ||
    subscriptionQuery.isSuccess ||
    subscriptionQuery.isError;
  const isRoleDataResolved = hasSelectedTeamSubscriptionResult;

  const shouldUseBrokerageView =
    isTcUserType &&
    canUseBrokerMode &&
    team?.role === TEAM_MEMBER_ROLE.OWNER &&
    hasActivePaidTeamSubscription;

  const effectiveUserRole: UserRole | null =
    isRoleDataResolved
      ? (
          shouldUseBrokerageView && !isInvitedTeamMember ?
            USER_ROLE.BROKER
          : USER_ROLE.AGENT
        )
      : null;

  const isRoleResolved = effectiveUserRole !== null;
  const hasPendingInvitations = pendingInvitationsCount > 0;
  const hasOtherMembers = Boolean(team && team.members.length > 1);

  const showInviteScreen =
    canUseBrokerMode &&
    effectiveUserRole === USER_ROLE.BROKER &&
    !brokerInvited &&
    !isTeamLoading &&
    !isInvitationsLoading &&
    !hasPendingInvitations &&
    (!team || team.members.length <= 1);

  const showManageTeamButton =
    canUseBrokerMode &&
    effectiveUserRole === USER_ROLE.BROKER &&
    !isInvitationsLoading &&
    (brokerInvited || hasOtherMembers || hasPendingInvitations);

  const filteredTransactions = React.useMemo(() => {
    if (!isRoleResolved) return [];
    // Backend handles permission filtering — returns only transactions the user can see
    return transactions;
  }, [transactions, isRoleResolved]);

  const sortList = React.useCallback(
    (list: typeof transactions) => {
      const sorted = [...list];
      if (sortBy === "recent") {
        return sorted.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );
      }
      return sorted.sort(
        (a, b) => getStatusRank(a.status) - getStatusRank(b.status),
      );
    },
    [sortBy],
  );

  const myTransactions = React.useMemo(
    () => sortList(filteredTransactions.filter((t) => !t.userId || String(t.userId) === String(userId))),
    [filteredTransactions, userId, sortList],
  );

  const teamTransactions = React.useMemo(
    () => sortList(filteredTransactions.filter((t) => t.userId && String(t.userId) !== String(userId))),
    [filteredTransactions, userId, sortList],
  );

  const sortedTransactions = React.useMemo(
    () => sortList(filteredTransactions),
    [filteredTransactions, sortList],
  );

  const handleInviteComplete = React.useCallback(() => {
    setBrokerInvited(true);
    refetchTeam();
  }, [setBrokerInvited, refetchTeam]);

  const getAgentDisplayName = React.useCallback(
    (transaction: (typeof transactions)[number]) => {
      const member = team?.members.find(
        (teamMember) =>
          transaction.userId && teamMember.id === String(transaction.userId),
      );

      if (member) {
        return [member.name, member.lastName].filter(Boolean).join(" ").trim();
      }

      return transaction.agentName?.trim() || null;
    },
    [team?.members],
  );

  const getAgentGroup = React.useCallback(
    (transaction: (typeof transactions)[number]) => {
      const transactionUserId = transaction.userId?.trim();
      if (!transactionUserId) return null;
      if (transactionUserId === userId) return null;

      const member = team?.members.find(
        (teamMember) => teamMember.id === transactionUserId,
      );
      const fullName = member
        ? [member.name, member.lastName].filter(Boolean).join(" ").trim()
        : transaction.agentName?.trim();

      if (!fullName) return null;

      return {
        key: transactionUserId,
        label: fullName,
      };
    },
    [team?.members, userId],
  );

  return {
    effectiveUserRole,
    isRoleResolved,
    pendingInvitationsCount,
    showInviteScreen,
    showManageTeamButton,
    sortedTransactions,
    myTransactions,
    teamTransactions,
    handleInviteComplete,
    getAgentDisplayName,
    getAgentGroup,
  };
}
