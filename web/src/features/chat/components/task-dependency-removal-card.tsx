"use client"

import type { TaskDependencyRemoval } from "../types"
import { TaskDependencyRemovePrompt } from "./task-dependency-remove-prompt"

interface TaskDependencyRemovalCardProps {
  removal: TaskDependencyRemoval
  onConfirm: (removalId: string, childTaskId: string) => Promise<void>
  onDismiss: (id: string) => void
  compact?: boolean
}

export function TaskDependencyRemovalCard({
  removal,
  onConfirm,
  onDismiss,
  compact,
}: TaskDependencyRemovalCardProps) {
  const { id, message, childTaskId, childTaskName, parentTaskName } = removal

  return (
    <TaskDependencyRemovePrompt
      message={message}
      childTaskName={childTaskName}
      parentTaskName={parentTaskName}
      childTaskId={childTaskId}
      compact={compact}
      onConfirm={() => onConfirm(id, childTaskId)}
      onDismiss={() => onDismiss(id)}
    />
  )
}
