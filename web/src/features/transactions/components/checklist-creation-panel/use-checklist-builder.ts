import * as React from "react";
import type { BuilderCategory } from "./types";
import { createLocalId } from "./utils";
import type { ChecklistDraftItem } from "./template-draft";

type UseChecklistBuilderParams = {
  validateChecklistText: (value: string, type: "TASK_NAME" | "TASK_LABEL") => string | null;
};

export function useChecklistBuilder({ validateChecklistText }: UseChecklistBuilderParams) {
  const [builderData, setBuilderData] = React.useState<BuilderCategory[]>([]);
  const [builderErrors, setBuilderErrors] = React.useState<Record<string, string>>({});

  const resetBuilder = React.useCallback(() => {
    setBuilderErrors({});
    setBuilderData([
      {
        id: createLocalId("cat"),
        label: "",
        subtasks: [{ id: createLocalId("task"), label: "" }],
      },
    ]);
  }, []);

  const handleCategoryChange = React.useCallback(
    (categoryIndex: number, value: string) => {
      const message = validateChecklistText(value, "TASK_NAME");
      setBuilderData((previous) =>
        previous.map((item, index) =>
          index === categoryIndex ? { ...item, label: value } : item,
        ),
      );
      const categoryId = builderData[categoryIndex]?.id;
      if (!categoryId) return;
      setBuilderErrors((previous) => {
        const nextErrors = { ...previous };
        const key = `category:${categoryId}`;
        if (message) nextErrors[key] = message;
        else delete nextErrors[key];
        return nextErrors;
      });
    },
    [builderData, validateChecklistText],
  );

  const handleTaskChange = React.useCallback(
    (categoryIndex: number, taskIndex: number, value: string) => {
      const taskId = builderData[categoryIndex]?.subtasks?.[taskIndex]?.id;
      const message = validateChecklistText(value, "TASK_LABEL");
      setBuilderData((previous) =>
        previous.map((item, index) => {
          if (index !== categoryIndex) return item;
          const nextSubtasks = item.subtasks.map((subtask, subtaskIndex) =>
            subtaskIndex === taskIndex ? { ...subtask, label: value } : subtask,
          );
          return { ...item, subtasks: nextSubtasks };
        }),
      );
      if (!taskId) return;
      setBuilderErrors((previous) => {
        const nextErrors = { ...previous };
        const key = `task:${taskId}`;
        if (message) nextErrors[key] = message;
        else delete nextErrors[key];
        return nextErrors;
      });
    },
    [builderData, validateChecklistText],
  );

  const handleRemoveTask = React.useCallback((categoryIndex: number, taskIndex: number) => {
    setBuilderData((previous) =>
      previous.map((item, index) => {
        if (index !== categoryIndex) return item;
        return {
          ...item,
          subtasks: item.subtasks.filter((_, subtaskIndex) => subtaskIndex !== taskIndex),
        };
      }),
    );
  }, []);

  const handleAddTask = React.useCallback((categoryIndex: number) => {
    setBuilderData((previous) =>
      previous.map((item, index) =>
        index === categoryIndex
          ? {
              ...item,
              subtasks: [...item.subtasks, { id: createLocalId("task"), label: "" }],
            }
          : item,
      ),
    );
  }, []);

  const handleAddCategory = React.useCallback(() => {
    setBuilderData((previous) => [
      ...previous,
      {
        id: createLocalId("cat"),
        label: "",
        subtasks: [{ id: createLocalId("task"), label: "" }],
      },
    ]);
  }, []);

  const customDraftItems = React.useMemo<ChecklistDraftItem[]>(() => {
    return builderData.flatMap((category) => {
      const normalizedCategory = category.label.trim();
      return category.subtasks
        .map((task) => ({
          category: normalizedCategory || undefined,
          task: task.label.trim(),
        }))
        .filter((item) => item.task.length > 0);
    });
  }, [builderData]);

  const validateBuilderBeforeSave = React.useCallback(() => {
    const nextErrors: Record<string, string> = {};

    builderData.forEach((category) => {
      const categoryError = validateChecklistText(category.label, "TASK_NAME");
      if (categoryError) nextErrors[`category:${category.id}`] = categoryError;

      category.subtasks.forEach((task) => {
        const taskError = validateChecklistText(task.label, "TASK_LABEL");
        if (taskError) nextErrors[`task:${task.id}`] = taskError;
      });
    });

    setBuilderErrors(nextErrors);
    return {
      hasErrors: Object.keys(nextErrors).length > 0,
    };
  }, [builderData, validateChecklistText]);

  return {
    builderData,
    builderErrors,
    customDraftItems,
    resetBuilder,
    validateBuilderBeforeSave,
    handleCategoryChange,
    handleTaskChange,
    handleRemoveTask,
    handleAddTask,
    handleAddCategory,
  };
}
