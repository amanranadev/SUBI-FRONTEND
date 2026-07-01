import type { TransactionResultState } from "@/components/TransactionResultDrawer";
import type { ValidationResult } from "@/types/transactionForm";
import { validatePSAFormData } from "@/utils/transactionFormUtils";

import {
  buildTransactionPayloadFromDrawerState,
  type HomeTransactionSaveContext,
} from "@/utils/buildTransactionPayloadFromDrawerState";

/**
 * Validates editable drawer state using existing PSA form rules.
 */
export function validateTransactionDrawerState(
  state: TransactionResultState,
  context: HomeTransactionSaveContext,
): ValidationResult {
  const formData = buildTransactionPayloadFromDrawerState(state, context);
  return validatePSAFormData(formData);
}
