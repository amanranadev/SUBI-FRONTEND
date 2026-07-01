import { taskService } from "@/services/taskService";
import { transactionService } from "@/services/transactionService";
import type { TransactionResultState } from "@/components/TransactionResultDrawer";
import type { ApiError } from "@/types/auth";
import type { PSAFormData } from "@/types/transactionForm";
import { parseDateFromAPI } from "@/utils/dateFormatUtils";
import { normalizePSAFormData } from "@/utils/transactionFormUtils";
import { formatDateForAPI } from "@/utils/taskUtils";

import {
  buildTransactionPayloadFromDrawerState,
  type HomeTransactionSaveContext,
} from "@/utils/buildTransactionPayloadFromDrawerState";
import { validateTransactionDrawerState } from "@/utils/validateTransactionDrawerState";

export type SaveHomeTransactionResult =
  | { ok: true; transactionId: string }
  | { ok: false; kind: "validation" | "api"; errorMessage: string };

function resolveTransactionId(createdTransaction: {
  id?: string;
  transaction_id?: string;
  transactionId?: string;
}): string | null {
  return (
    createdTransaction.id ??
    createdTransaction.transaction_id ??
    createdTransaction.transactionId ??
    null
  );
}

async function createTasksForTransaction(
  transactionId: string,
  selectedTasks: PSAFormData["selectedTasks"],
): Promise<void> {
  if (!selectedTasks || selectedTasks.length === 0) {
    return;
  }

  const taskPromises = selectedTasks.map(async (task) => {
    let dueDate: Date | null = null;

    if (task.dueDate) {
      if (
        typeof task.dueDate === "object" &&
        task.dueDate !== null &&
        "normalized" in task.dueDate
      ) {
        dueDate = parseDateFromAPI((task.dueDate as { normalized: string }).normalized);
      } else if (task.dueDate instanceof Date) {
        dueDate = task.dueDate;
      } else if (typeof task.dueDate === "string") {
        dueDate = parseDateFromAPI(task.dueDate);
      }
    }

    if (!dueDate) {
      return null;
    }

    return taskService.createTask({
      name: task.name || "Untitled Task",
      description: task.description || "",
      information: task.information || "",
      dueDate: formatDateForAPI(dueDate),
      type: task.type === "FORM" ? "FORM" : "TASK",
      transactionId,
      status: "ON_TRACK",
    });
  });

  await Promise.allSettled(taskPromises);
}

/**
 * Validates drawer state, builds API payload, and creates the transaction + tasks.
 */
export async function saveHomeTransaction(
  state: TransactionResultState,
  context: HomeTransactionSaveContext,
): Promise<SaveHomeTransactionResult> {
  const validation = validateTransactionDrawerState(state, context);
  if (!validation.isValid) {
    const firstError = Object.values(validation.errors)[0];
    return {
      ok: false,
      kind: "validation",
      errorMessage: firstError || "Please review the required fields.",
    };
  }

  try {
    const formData = buildTransactionPayloadFromDrawerState(state, context);
    const normalizedData = normalizePSAFormData(formData);
    const createdTransaction = await transactionService.createTransaction(
      normalizedData as never,
    );
    const transactionId = resolveTransactionId(createdTransaction);

    if (!transactionId) {
      return {
        ok: false,
        kind: "api",
        errorMessage: "Transaction was created but no transaction ID was returned.",
      };
    }

    try {
      await createTasksForTransaction(transactionId, formData.selectedTasks);
    } catch (taskError) {
      console.error("Error creating tasks for Home transaction:", taskError);
    }

    return { ok: true, transactionId };
  } catch (error) {
    const apiError = error as ApiError;
    return {
      ok: false,
      kind: "api",
      errorMessage:
        apiError.message || "Failed to create transaction. Please try again.",
    };
  }
}
