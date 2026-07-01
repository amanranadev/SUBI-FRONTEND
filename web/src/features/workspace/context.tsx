"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type {
  TransactionFormData,
  ProcessingProgress,
  PendingUpload,
} from "@/features/transactions/types";
import type { Transaction } from "@/features/workspace/types";
import type { Team, UserRole } from "@/features/team/types";
import { WORKSPACE_DEFAULT_AGENT_NAME } from "@/features/workspace/constants";
import { useWorkspaceProcessing } from "@/features/workspace/hooks/use-workspace-processing";
import { useWorkspaceTransactions } from "@/features/workspace/hooks/use-workspace-transactions";
import { useTeam } from "@/features/team/hooks/use-team";
import { useAuth } from "@/lib/auth/context";
import { useActiveTeamId } from "@/features/team/hooks/use-active-team-id";
import { TEAM_MEMBER_ROLE, USER_ROLE } from "../team/constants";
import type { ActiveTeamOption } from "@/features/team/hooks/use-active-team-id";
import {
  FETCH_USER_TRANSACTIONS_FILTER,
  type FetchUserTransactionsFilter,
} from "@/features/transactions/constants";
import type { TransactionStatus } from "@/features/workspace/status";

type WorkspaceContextValue = {
  transactions: Transaction[];
  isTransactionsLoading: boolean;
  transactionsError: Error | null;
  refetchTransactions: () => void;
  userRole: UserRole;
  brokerInvited: boolean;
  selectedTeamId: string | null;
  availableTeams: ActiveTeamOption[];
  canUseBrokerMode: boolean;
  team: Team | undefined;
  isTeamLoading: boolean;
  refetchTeam: () => void;
  viewMode: "grid" | "list";
  sortBy: "recent" | "status";
  transactionsFilter: FetchUserTransactionsFilter;
  isDialogOpen: boolean;
  isProcessingFile: boolean;
  processingProgress: ProcessingProgress;
  processingError: string | null;
  extractedData: TransactionFormData | null;
  dialogSourceFileId: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  drafts: PendingUpload[];
  isDraftsLoading: boolean;
  draftsHasMore: boolean;
  draftsLoadMore: () => void;
  draftsLoadingMore: boolean;
  draftsTotalCount?: number;
  setUserRole: (role: UserRole) => void;
  setBrokerInvited: (value: boolean) => void;
  setSelectedTeamId: (teamId: string | null) => void;
  setViewMode: (mode: "grid" | "list") => void;
  setSortBy: (sort: "recent" | "status") => void;
  setTransactionsFilter: (filter: FetchUserTransactionsFilter) => void;
  setIsDialogOpen: (open: boolean) => void;
  closeTransactionDialog: () => void;
  handleOpenDialogFromDropzone: () => void;
  handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveTransaction: (
    transaction: Transaction,
    options?: {
      closeDialog?: boolean;
      formData?: TransactionFormData;
      sourceFileId?: string | null;
    },
  ) => Promise<Transaction>;
  handleUpdateTransaction: (transaction: Transaction) => Promise<void>;
  handleDeleteTransaction: (id: string) => Promise<void>;
  handleTransactionStatusChanged: (transactionId: string, newStatus: TransactionStatus) => void;
  handleOpenDraft: (draft: PendingUpload) => void;
  handleDeleteDraft: (id: string) => void;
  isDeletingDraft: boolean;
  cancelProcessing: () => void;
  retryProcessing: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { selectedTeamId, setSelectedTeamId, availableTeams } =
    useActiveTeamId();
  const [userRole, setUserRole] = useState<UserRole>(USER_ROLE.AGENT);
  const [brokerInvited, setBrokerInvited] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recent" | "status">("recent");
  const [transactionsFilter, setTransactionsFilter] =
    useState<FetchUserTransactionsFilter>(
      FETCH_USER_TRANSACTIONS_FILTER.ACTIVE,
    );
  const processingState = useWorkspaceProcessing();
  const { team, isTeamLoading, refetchTeam } = useTeam(selectedTeamId);
  const hasBrokerPrivileges =
    team?.role === TEAM_MEMBER_ROLE.OWNER ||
    team?.role === TEAM_MEMBER_ROLE.MANAGER;
  const canUseBrokerMode = hasBrokerPrivileges;

  useEffect(() => {
    if (canUseBrokerMode) return;
    if (userRole !== USER_ROLE.BROKER) return;
    setUserRole(USER_ROLE.AGENT);
  }, [canUseBrokerMode, userRole]);

  const onAfterSave = useCallback(
    (shouldCloseDialog: boolean) => {
      processingState.resetProcessingState(shouldCloseDialog);
    },
    [processingState],
  );

  const useTeamScope = Boolean(selectedTeamId);
  const {
    transactions,
    isTransactionsLoading,
    transactionsError,
    refetchTransactions,
    handleSaveTransaction,
    handleUpdateTransaction,
    handleDeleteTransaction,
    handleTransactionStatusChanged,
  } = useWorkspaceTransactions({
    onAfterSave,
    currentAgentName: user?.name || user?.email || WORKSPACE_DEFAULT_AGENT_NAME,
    userId: user?.id ?? null,
    teamId: selectedTeamId,
    useTeamScope,
    transactionsFilter,
  });

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      transactions,
      isTransactionsLoading,
      transactionsError,
      refetchTransactions,
      userRole,
      brokerInvited,
      selectedTeamId,
      availableTeams,
      canUseBrokerMode,
      team,
      isTeamLoading: isTeamLoading,
      refetchTeam,
      viewMode,
      sortBy,
      transactionsFilter,
      isDialogOpen: processingState.isDialogOpen,
      isProcessingFile: processingState.isProcessingFile,
      processingProgress: processingState.processingProgress,
      processingError: processingState.processingError,
      extractedData: processingState.extractedData,
      dialogSourceFileId: processingState.dialogSourceFileId,
      fileInputRef: processingState.fileInputRef,
      drafts: processingState.drafts,
      isDraftsLoading: processingState.isDraftsLoading,
      draftsHasMore: processingState.draftsHasMore,
      draftsLoadMore: processingState.draftsLoadMore,
      draftsLoadingMore: processingState.draftsLoadingMore,
      draftsTotalCount: processingState.draftsTotalCount,
      setUserRole,
      setBrokerInvited,
      setSelectedTeamId,
      setViewMode,
      setSortBy,
      setTransactionsFilter,
      setIsDialogOpen: processingState.setIsDialogOpen,
      closeTransactionDialog: processingState.closeTransactionDialog,
      handleOpenDialogFromDropzone:
        processingState.handleOpenDialogFromDropzone,
      handleFileSelect: processingState.handleFileSelect,
      handleSaveTransaction,
      handleUpdateTransaction,
      handleDeleteTransaction,
      handleTransactionStatusChanged,
      handleOpenDraft: processingState.handleOpenDraft,
      handleDeleteDraft: processingState.handleDeleteDraft,
      isDeletingDraft: processingState.isDeletingDraft,
      cancelProcessing: processingState.cancelProcessing,
      retryProcessing: processingState.retryProcessing,
    }),
    [
      transactions,
      isTransactionsLoading,
      transactionsError,
      refetchTransactions,
      userRole,
      brokerInvited,
      selectedTeamId,
      availableTeams,
      canUseBrokerMode,
      team,
      isTeamLoading,
      refetchTeam,
      viewMode,
      sortBy,
      transactionsFilter,
      processingState,
      handleSaveTransaction,
      handleUpdateTransaction,
      handleDeleteTransaction,
      handleTransactionStatusChanged,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace must be used within WorkspaceProvider");
  }
  return context;
}
