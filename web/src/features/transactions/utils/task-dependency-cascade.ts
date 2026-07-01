import { parseDateToISO } from "@/shared/utils/format";
import type { TransactionFormTask } from "@/features/transactions/types";
import {
  parseCalculationTrigger,
  parseTaskDependencyTrigger,
  recalculateDate,
  resolveExpectedTrigger,
} from "./task-date-cascade";

export function recalculateTaskDate(
  task: TransactionFormTask,
  fieldName: "closeDate" | "mutualAcceptanceDate",
  newDateISO: string,
): TransactionFormTask {
  const parsed = parseCalculationTrigger(task.calculation);
  if (!parsed) return task;

  if (parsed.trigger !== resolveExpectedTrigger(fieldName)) return task;

  const nextDate = recalculateDate(parsed.daysOffset, newDateISO, parsed.dayType);
  if (task.date === nextDate) return task;
  return { ...task, date: nextDate };
}

export function normalizeTaskText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenizeTaskText(value: string): string[] {
  return normalizeTaskText(value)
    .split(" ")
    .filter((token) => token.length > 2);
}

export function resolveDependencyTaskId(
  triggerText: string,
  tasks: TransactionFormTask[],
  currentTaskId: string,
): string | null {
  const normalizedTrigger = normalizeTaskText(triggerText);
  if (!normalizedTrigger) return null;

  const triggerTokens = tokenizeTaskText(triggerText);
  let bestMatch: { taskId: string; score: number } | null = null;

  for (const task of tasks) {
    if (task.id === currentTaskId) continue;

    const normalizedTitle = normalizeTaskText(task.title);
    if (!normalizedTitle) continue;

    if (
      normalizedTitle.includes(normalizedTrigger) ||
      normalizedTrigger.includes(normalizedTitle)
    ) {
      return task.id;
    }

    if (triggerTokens.length === 0) continue;
    const titleTokens = new Set(tokenizeTaskText(task.title));
    const overlap = triggerTokens.filter((token) => titleTokens.has(token)).length;
    if (overlap === 0) continue;

    const score = overlap / triggerTokens.length;
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { taskId: task.id, score };
    }
  }

  return bestMatch && bestMatch.score >= 0.5 ? bestMatch.taskId : null;
}

export function cascadeDependentTaskDates(
  tasks: TransactionFormTask[],
  changedTaskId: string,
): TransactionFormTask[] {
  const nextTasks = tasks.map((task) => ({ ...task }));
  const queue = [changedTaskId];
  const queued = new Set(queue);

  while (queue.length > 0) {
    const sourceId = queue.shift();
    if (!sourceId) break;
    queued.delete(sourceId);

    const sourceTask = nextTasks.find((task) => task.id === sourceId);
    if (!sourceTask) continue;
    const sourceDateISO = sourceTask.date ? parseDateToISO(sourceTask.date) : null;

    for (const candidate of nextTasks) {
      if (candidate.id === sourceTask.id) continue;
      const dependency = parseTaskDependencyTrigger(candidate.calculation);
      if (!dependency) continue;

      const dependencyTaskId = resolveDependencyTaskId(
        dependency.triggerText,
        nextTasks,
        candidate.id,
      );
      if (!dependencyTaskId || dependencyTaskId !== sourceTask.id) continue;

      const nextDate = sourceDateISO
        ? recalculateDate(
            dependency.daysOffset,
            sourceDateISO,
            dependency.dayType,
          )
        : "";
      if (candidate.date === nextDate) continue;

      candidate.date = nextDate;
      if (!queued.has(candidate.id)) {
        queue.push(candidate.id);
        queued.add(candidate.id);
      }
    }
  }

  return nextTasks;
}
