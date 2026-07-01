import type { Dispatch } from "react";

import {
  createDefaultTransactionResultState,
} from "./TransactionResultDrawer.constants";
import type {
  ReviewStatus,
  ReviewStatusState,
  SectionKey,
  TransactionResultAction,
  TransactionResultState,
} from "./TransactionResultDrawer.types";

export function createPersonId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function areAllSectionsDone(reviewStatus: ReviewStatusState): boolean {
  return Object.values(reviewStatus).every((status) => status === "done");
}

export function transactionResultReducer(
  state: TransactionResultState,
  action: TransactionResultAction,
): TransactionResultState {
  switch (action.type) {
    case "UPDATE_TRANSACTION_SUMMARY":
      return {
        ...state,
        transactionSummary: {
          ...state.transactionSummary,
          ...action.payload,
        },
      };
    case "UPDATE_CLIENT_INFORMATION":
      return {
        ...state,
        clientInformation: {
          ...state.clientInformation,
          ...action.payload,
        },
      };
    case "UPDATE_PROPERTY_INFORMATION":
      return {
        ...state,
        propertyInformation: {
          ...state.propertyInformation,
          ...action.payload,
        },
      };
    case "UPDATE_FORMS_AND_TASKS":
      return {
        ...state,
        formsAndTasks: {
          ...state.formsAndTasks,
          ...action.payload,
        },
      };
    case "SET_SECTION_REVIEW_STATUS":
      return {
        ...state,
        reviewStatus: {
          ...state.reviewStatus,
          [action.section]: action.status,
        },
      };
    case "REPLACE_STATE":
      return action.payload;
    default:
      return state;
  }
}

export function createInitialTransactionResultState(
  initialState?: TransactionResultState,
): TransactionResultState {
  return initialState ?? createDefaultTransactionResultState();
}

export function setSectionReviewStatus(
  dispatch: Dispatch<TransactionResultAction>,
  section: SectionKey,
  status: ReviewStatus,
): void {
  dispatch({
    type: "SET_SECTION_REVIEW_STATUS",
    section,
    status,
  });
}
