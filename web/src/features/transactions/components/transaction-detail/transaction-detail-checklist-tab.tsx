"use client";

import { useTransactionTasks } from "@/features/tasks/hooks/use-transaction-tasks";
import { useActiveTeamId } from "@/features/team/hooks/use-active-team-id";
import { useTeam } from "@/features/team/hooks/use-team";
import { ChecklistCreationPanel } from "@/features/transactions/components/checklist-creation-panel";
import { ChecklistTemplateSaveDialog } from "@/features/transactions/components/checklist-template-save-dialog";
import { useChecklistActions } from "@/features/transactions/hooks/use-checklist-actions";
import { useChecklistGrouping } from "@/features/transactions/hooks/use-checklist-grouping";
import { useChecklistRoles } from "@/features/transactions/hooks/use-checklist-roles";
import { useChecklistTemplates } from "@/features/transactions/hooks/use-checklist-templates";
import type { Transaction } from "@/features/workspace/types";
import { useAuth } from "@/lib/auth/context";
import { Txt } from "@/shared/ui";
import { ChecklistActiveView } from "./checklist-active-view";

type TransactionDetailChecklistTabProps = {
  transaction: Transaction;
  highlightedTaskId?: string | null;
};

export function TransactionDetailChecklistTab({
  transaction,
  highlightedTaskId,
}: TransactionDetailChecklistTabProps) {
  const { user } = useAuth();
  const { selectedTeamId } = useActiveTeamId();
  const { team } = useTeam(selectedTeamId);
  const { data: checklistTemplates = [] } = useChecklistTemplates();
  const {
    data: transactionTasks = [],
    isLoading,
    isFetching,
  } = useTransactionTasks({
    transactionId: transaction.id,
  });

  const {
    checklistMode,
    setChecklistMode,
    checklistTasks,
    currentChecklist,
    checklistTaskMap,
    currentChecklistTemplate,
    openChecklistGroupIds,
    setOpenChecklistGroupIds,
    setIsApplyingChecklist,
  } = useChecklistGrouping({
    transaction,
    transactionTasks,
    checklistTemplates,
    isLoading,
    isFetching,
    highlightedTaskId,
  });

  const { state, actions } = useChecklistActions({
    transaction,
    checklistTasks,
    currentChecklistTemplate,
    setIsApplyingChecklist,
  });

  const { canAssignChecklistTasks, assigneeById, assignableMembers } =
    useChecklistRoles({ team, user });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {checklistMode === "selection" && (
        <ChecklistCreationPanel
          onChecklistReady={(checklist) =>
            actions.applyChecklistById(checklist.id)
          }
          enableSavedTemplatesOption
          onChecklistTemplateApply={actions.applyChecklistTemplateById}
          onReadyErrorTitle="Could not apply checklist"
        />
      )}

      {checklistMode === "active" &&
        (isLoading ? (
          <div className="glass-card rounded-[1.5rem] px-5 py-6">
            <Txt as="p" size="sm" tone="muted">
              Loading checklist...
            </Txt>
          </div>
        ) : currentChecklist.length === 0 ? (
          <div className="glass-card rounded-[1.5rem] px-5 py-6">
            <Txt as="p" size="sm" tone="muted">
              No checklist items found for this transaction.
            </Txt>
          </div>
        ) : (
          <ChecklistActiveView
            currentChecklist={currentChecklist}
            openChecklistGroupIds={openChecklistGroupIds}
            setOpenChecklistGroupIds={setOpenChecklistGroupIds}
            checklistTaskMap={checklistTaskMap}
            highlightedTaskId={highlightedTaskId}
            openNoteId={state.openNoteId}
            editingNoteText={state.editingNoteText}
            editingNameId={state.editingNameId}
            editingNameText={state.editingNameText}
            isMutatingTaskId={state.isMutatingTaskId}
            canAssignChecklistTasks={canAssignChecklistTasks}
            assignableMembers={assignableMembers}
            assigneeById={assigneeById}
            user={user}
            onSetTaskStatus={actions.handleSetTaskStatus}
            onOpenNoteEditor={actions.handleOpenNoteEditor}
            onDeleteTask={actions.deleteTaskItem}
            onSaveNote={actions.handleSaveNote}
            onCloseNote={() => actions.setOpenNoteId(null)}
            onNoteTextChange={actions.setEditingNoteText}
            onUpdateDueDate={actions.handleUpdateDueDate}
            onAssignTask={actions.handleAssignTask}
            onStartNameEdit={actions.handleStartNameEdit}
            onNameTextChange={actions.setEditingNameText}
            onSaveName={actions.handleSaveName}
            onCancelNameEdit={actions.handleCancelNameEdit}
            onCreateChecklistItem={actions.createChecklistItem}
            isCreatingChecklistItem={state.isCreatingChecklistItem}
          />
        ))}

      <ChecklistTemplateSaveDialog
        open={state.templateDialogOpen}
        onOpenChange={actions.setTemplateDialogOpen}
        templateName={state.templateName}
        templateNameError={state.templateNameError}
        isSaving={state.isSavingTemplate}
        onTemplateNameChange={(value) => {
          actions.setTemplateName(value);
        }}
        onSave={() => {
          void actions.handleSaveChecklistAsTemplate();
        }}
      />
    </div>
  );
}
