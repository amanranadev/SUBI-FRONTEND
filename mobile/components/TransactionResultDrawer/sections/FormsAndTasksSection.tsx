import React, { memo, useCallback } from "react";
import { Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { ActionCard } from "@/components/ActionCard";
import { actionCardTokens } from "@/components/ActionCard/ActionCard.styles";
import { CollapsibleSection } from "@/components/CollapsibleSection";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TaskCard } from "@/components/TaskCard";

import {
  CHECKLIST_ACTIONS,
  CHECKLIST_SUBHEADING,
  LOOKS_GOOD_LABEL,
  SECTION_TITLES,
} from "../TransactionResultDrawer.constants";
import { transactionResultDrawerStyles } from "../TransactionResultDrawer.styles";
import type {
  FormsAndTasksData,
  ReviewStatus,
  TransactionTask,
} from "../TransactionResultDrawer.types";
import { useCollapsibleSectionLooksGood } from "../useCollapsibleSectionLooksGood";
import { ReviewStatusBadge } from "./ReviewStatusBadge";

interface FormsAndTasksSectionProps {
  data: FormsAndTasksData;
  reviewStatus: ReviewStatus;
  onChange: (payload: Partial<FormsAndTasksData>) => void;
  onLooksGood: () => void;
  testID?: string;
}

interface TaskCardItemProps {
  task: TransactionTask;
  onTaskChange: (taskId: string, payload: Partial<TransactionTask>) => void;
  onTaskDelete: (taskId: string) => void;
  testID?: string;
}

const TaskCardItem = memo(function TaskCardItem({
  task,
  onTaskChange,
  onTaskDelete,
  testID,
}: TaskCardItemProps) {
  const handleDateChange = useCallback(
    (date: Date | null) => {
      onTaskChange(task.id, { dueDate: date });
    },
    [onTaskChange, task.id],
  );

  const handleSkipPress = useCallback(() => {
    onTaskChange(task.id, { status: "skipped" });
  }, [onTaskChange, task.id]);

  const handleDonePress = useCallback(() => {
    onTaskChange(task.id, { status: "done" });
  }, [onTaskChange, task.id]);

  const handleDeletePress = useCallback(() => {
    onTaskDelete(task.id);
  }, [onTaskDelete, task.id]);

  return (
    <TaskCard
      transactionName={task.transactionName}
      taskName={task.taskName}
      dueDate={task.dueDate}
      status={task.status}
      onDateChange={handleDateChange}
      onEditPress={() => undefined}
      onSkipPress={handleSkipPress}
      onDonePress={handleDonePress}
      onDocumentPress={() => undefined}
      onDeletePress={handleDeletePress}
      testID={testID}
    />
  );
});

TaskCardItem.displayName = "TaskCardItem";

export const FormsAndTasksSection = memo(function FormsAndTasksSection({
  data,
  reviewStatus,
  onChange,
  onLooksGood,
  testID,
}: FormsAndTasksSectionProps) {
  const { expanded, onExpandedChange, handleLooksGood } =
    useCollapsibleSectionLooksGood(onLooksGood);

  const handleSelectChecklist = useCallback(
    (checklistId: string) => {
      onChange({ selectedChecklistId: checklistId });
    },
    [onChange],
  );

  const handleTaskChange = useCallback(
    (taskId: string, payload: Partial<TransactionTask>) => {
      onChange({
        tasks: data.tasks.map((task) =>
          task.id === taskId ? { ...task, ...payload } : task,
        ),
      });
    },
    [data.tasks, onChange],
  );

  const handleTaskDelete = useCallback(
    (taskId: string) => {
      onChange({
        tasks: data.tasks.filter((task) => task.id !== taskId),
      });
    },
    [data.tasks, onChange],
  );

  return (
    <CollapsibleSection
      title={SECTION_TITLES.formsAndTasks}
      badge={<ReviewStatusBadge status={reviewStatus} />}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      footerStyle={transactionResultDrawerStyles.looksGoodFooter}
      footer={
        <PrimaryButton
          size="sm"
          onPress={handleLooksGood}
          accessibilityLabel={LOOKS_GOOD_LABEL}
          testID={testID ? `${testID}-looks-good` : undefined}
        >
          {LOOKS_GOOD_LABEL}
        </PrimaryButton>
      }
      testID={testID}
    >
      <View style={transactionResultDrawerStyles.formsAndTasksContent}>
        {data.tasks.length > 0 ? (
          <View
            style={transactionResultDrawerStyles.taskList}
            accessibilityLabel="Transaction tasks"
          >
            {data.tasks.map((task, index) => (
              <TaskCardItem
                key={task.id}
                task={task}
                onTaskChange={handleTaskChange}
                onTaskDelete={handleTaskDelete}
                testID={testID ? `${testID}-task-${index}` : undefined}
              />
            ))}
          </View>
        ) : null}

        <Text style={transactionResultDrawerStyles.sectionSubheading}>
          {CHECKLIST_SUBHEADING}
        </Text>

        <View
          style={transactionResultDrawerStyles.actionCardGrid}
          accessibilityLabel="Checklist options"
        >
          {CHECKLIST_ACTIONS.map((action) => (
            <View
              key={action.id}
              style={transactionResultDrawerStyles.actionCardGridItem}
            >
              <ActionCard
                title={action.title}
                description={action.description}
                selected={data.selectedChecklistId === action.id}
                onPress={() => handleSelectChecklist(action.id)}
                icon={
                  <Icon
                    name={action.iconName}
                    size={actionCardTokens.sizing.iconSize}
                    color={actionCardTokens.colors.title}
                    accessible={false}
                  />
                }
                testID={testID ? `${testID}-action-${action.id}` : undefined}
              />
            </View>
          ))}
        </View>
      </View>
    </CollapsibleSection>
  );
});

FormsAndTasksSection.displayName = "FormsAndTasksSection";
