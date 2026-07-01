import React, { memo, useCallback, useMemo } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { DatePicker } from "@/components/DatePicker";
import { Divider } from "@/components/Divider";
import { PrimaryButton, buttonTokens } from "@/components/PrimaryButton";

import { taskCardStyles, taskCardTokens } from "./TaskCard.styles";
import type { TaskCardProps, TaskStatus } from "./TaskCard.types";

const DEFAULT_STATUS: TaskStatus = "pending";

function formatStatusLabel(status: TaskStatus): string {
  switch (status) {
    case "done":
      return "Done";
    case "skipped":
      return "Skipped";
    default:
      return "Pending";
  }
}

function TaskCardComponent({
  transactionName,
  taskName,
  dueDate,
  status = DEFAULT_STATUS,
  onDateChange,
  onEditPress,
  onSkipPress,
  onDonePress,
  onDocumentPress,
  onDeletePress,
  disabled = false,
  testID,
}: TaskCardProps) {
  const isInteractionDisabled = disabled;

  const cardAccessibilityLabel = useMemo(
    () =>
      `${transactionName}. ${taskName}. Status ${formatStatusLabel(status)}.`,
    [status, taskName, transactionName],
  );

  const cardStyle = useMemo(
    () => [
      taskCardStyles.card,
      status === "done" ? taskCardStyles.cardDone : null,
      status === "skipped" ? taskCardStyles.cardSkipped : null,
      isInteractionDisabled ? taskCardStyles.cardDisabled : null,
    ],
    [isInteractionDisabled, status],
  );

  const handleDateChange = useCallback(
    (date: Date) => {
      onDateChange?.(date);
    },
    [onDateChange],
  );

  const editIcon = useMemo(
    () => (
      <Icon
        name="edit"
        size={buttonTokens.sizes.xs.iconSize}
        color={buttonTokens.colors.textPrimary}
        accessible={false}
      />
    ),
    [],
  );

  const showDocumentAction = onDocumentPress != null;
  const showDeleteAction = onDeletePress != null;
  const showFooterActions =
    onEditPress != null || onSkipPress != null || onDonePress != null;

  const headerIconHitSlop = useMemo(
    () => ({
      top: taskCardTokens.sizing.headerIconHitSlop,
      bottom: taskCardTokens.sizing.headerIconHitSlop,
      left: taskCardTokens.sizing.headerIconHitSlop,
      right: taskCardTokens.sizing.headerIconHitSlop,
    }),
    [],
  );

  return (
    <View
      style={cardStyle}
      accessibilityLabel={cardAccessibilityLabel}
      testID={testID}
    >
      <Text style={taskCardStyles.transactionName}>{transactionName}</Text>

      <View style={taskCardStyles.taskHeader}>
        <Text style={taskCardStyles.taskName}>{taskName}</Text>

        {showDocumentAction || showDeleteAction ? (
          <View style={taskCardStyles.headerActions}>
            {showDocumentAction ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Open task document"
                disabled={isInteractionDisabled}
                hitSlop={headerIconHitSlop}
                onPress={onDocumentPress}
                style={taskCardStyles.headerActionButton}
                testID={testID ? `${testID}-document` : undefined}
              >
                <Icon
                  name="document"
                  size={taskCardTokens.sizing.headerIcon}
                  color={taskCardTokens.colors.headerIcon}
                  accessible={false}
                />
              </Pressable>
            ) : null}

            {showDeleteAction ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Delete task"
                disabled={isInteractionDisabled}
                hitSlop={headerIconHitSlop}
                onPress={onDeletePress}
                style={taskCardStyles.headerActionButton}
                testID={testID ? `${testID}-delete` : undefined}
              >
                <Icon
                  name="trash"
                  size={taskCardTokens.sizing.headerIcon}
                  color={taskCardTokens.colors.headerIconDestructive}
                  accessible={false}
                />
              </Pressable>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={taskCardStyles.datePicker}>
        <DatePicker
          value={dueDate ?? undefined}
          onChange={onDateChange ? handleDateChange : undefined}
          disabled={isInteractionDisabled || onDateChange == null}
          accessibilityLabel={`Due date for ${taskName}`}
          testID={testID ? `${testID}-due-date` : undefined}
        />
      </View>

      <View style={taskCardStyles.divider}>
        <Divider testID={testID ? `${testID}-divider` : undefined} />
      </View>

      {showFooterActions ? (
        <View style={taskCardStyles.actionRow}>
          {onEditPress ? (
            <PrimaryButton
              variant="tag"
              shape="tag"
              size="sm"
              leftIcon={editIcon}
              disabled={isInteractionDisabled}
              onPress={onEditPress}
              accessibilityLabel={`Edit ${taskName}`}
              testID={testID ? `${testID}-edit` : undefined}
            >
              Edit
            </PrimaryButton>
          ) : null}

          {onSkipPress ? (
            <PrimaryButton
              variant="tag"
              shape="tag"
              size="sm"
              disabled={isInteractionDisabled || status === "skipped"}
              onPress={onSkipPress}
              accessibilityLabel={`Skip ${taskName}`}
              testID={testID ? `${testID}-skip` : undefined}
            >
              Skip
            </PrimaryButton>
          ) : null}

          {onDonePress ? (
            <PrimaryButton
              variant="success-chip"
              shape="tag"
              size="sm"
              disabled={isInteractionDisabled || status === "done"}
              onPress={onDonePress}
              accessibilityLabel={`Mark ${taskName} done`}
              testID={testID ? `${testID}-done` : undefined}
            >
              Done
            </PrimaryButton>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export const TaskCard = memo(TaskCardComponent);
TaskCard.displayName = "TaskCard";
