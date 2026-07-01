import React, { memo, useCallback, useMemo, useReducer } from "react";
import { View } from "react-native";

import { BottomDrawer } from "@/components/BottomDrawer";

import { DRAWER_BACKGROUND_COLOR } from "./TransactionResultDrawer.constants";
import { transactionResultDrawerStyles } from "./TransactionResultDrawer.styles";
import type {
  ClientInformationData,
  FormsAndTasksData,
  PropertyInformationData,
  TransactionResultDrawerProps,
  TransactionSummaryData,
} from "./TransactionResultDrawer.types";
import {
  areAllSectionsDone,
  createInitialTransactionResultState,
  setSectionReviewStatus,
  transactionResultReducer,
} from "./TransactionResultDrawer.utils";
import { ClientInformationSection } from "./sections/ClientInformationSection";
import { FormsAndTasksSection } from "./sections/FormsAndTasksSection";
import { PropertyInformationSection } from "./sections/PropertyInformationSection";
import { TransactionResultDrawerFooter } from "./sections/TransactionResultDrawerFooter";
import { TransactionResultDrawerHeader } from "./sections/TransactionResultDrawerHeader";
import { TransactionResultSectionDivider } from "./sections/TransactionResultSectionDivider";
import { TransactionSummarySection } from "./sections/TransactionSummarySection";

function TransactionResultDrawerComponent({
  open,
  onClose,
  initialState,
  onDiscardDraft,
  onSaveTransaction,
  testID,
}: TransactionResultDrawerProps) {
  const [state, dispatch] = useReducer(
    transactionResultReducer,
    initialState,
    createInitialTransactionResultState,
  );

  const allSectionsDone = useMemo(
    () => areAllSectionsDone(state.reviewStatus),
    [state.reviewStatus],
  );

  const handleTransactionSummaryChange = useCallback(
    (payload: Partial<TransactionSummaryData>) => {
      dispatch({ type: "UPDATE_TRANSACTION_SUMMARY", payload });
    },
    [],
  );

  const handleClientInformationChange = useCallback(
    (payload: Partial<ClientInformationData>) => {
      dispatch({ type: "UPDATE_CLIENT_INFORMATION", payload });
    },
    [],
  );

  const handlePropertyInformationChange = useCallback(
    (payload: Partial<PropertyInformationData>) => {
      dispatch({ type: "UPDATE_PROPERTY_INFORMATION", payload });
    },
    [],
  );

  const handleFormsAndTasksChange = useCallback(
    (payload: Partial<FormsAndTasksData>) => {
      dispatch({ type: "UPDATE_FORMS_AND_TASKS", payload });
    },
    [],
  );

  const handleTransactionSummaryReview = useCallback(() => {
    setSectionReviewStatus(dispatch, "transactionSummary", "done");
  }, []);

  const handleClientInformationReview = useCallback(() => {
    setSectionReviewStatus(dispatch, "clientInformation", "done");
  }, []);

  const handlePropertyInformationReview = useCallback(() => {
    setSectionReviewStatus(dispatch, "propertyInformation", "done");
  }, []);

  const handleFormsAndTasksReview = useCallback(() => {
    setSectionReviewStatus(dispatch, "formsAndTasks", "done");
  }, []);

  const handleDiscardDraft = useCallback(() => {
    onDiscardDraft?.();
  }, [onDiscardDraft]);

  const handleSaveTransaction = useCallback(() => {
    if (!allSectionsDone) {
      return;
    }
    onSaveTransaction?.(state);
  }, [allSectionsDone, onSaveTransaction, state]);

  const footer = useMemo(
    () => (
      <TransactionResultDrawerFooter
        allSectionsDone={allSectionsDone}
        onDiscardDraft={handleDiscardDraft}
        onSaveTransaction={handleSaveTransaction}
        testID={testID ? `${testID}-footer` : undefined}
      />
    ),
    [allSectionsDone, handleDiscardDraft, handleSaveTransaction, testID],
  );

  return (
    <BottomDrawer
      open={open}
      size="full"
      footerBehavior="sticky"
      backgroundColor={DRAWER_BACKGROUND_COLOR}
      onClose={onClose}
      footer={footer}
      testID={testID}
    >
      <View style={transactionResultDrawerStyles.content}>
        <TransactionResultDrawerHeader
          onClose={onClose}
          testID={testID ? `${testID}-header` : undefined}
        />

        <View
          style={transactionResultDrawerStyles.sections}
          accessibilityLabel="Transaction review sections"
        >
          <TransactionSummarySection
            data={state.transactionSummary}
            reviewStatus={state.reviewStatus.transactionSummary}
            onChange={handleTransactionSummaryChange}
            onLooksGood={handleTransactionSummaryReview}
            testID={testID ? `${testID}-transaction-summary` : undefined}
          />
          <TransactionResultSectionDivider
            testID={testID ? `${testID}-divider-transaction-summary` : undefined}
          />

          <ClientInformationSection
            data={state.clientInformation}
            reviewStatus={state.reviewStatus.clientInformation}
            onChange={handleClientInformationChange}
            onLooksGood={handleClientInformationReview}
            testID={testID ? `${testID}-client-information` : undefined}
          />
          <TransactionResultSectionDivider
            testID={testID ? `${testID}-divider-client-information` : undefined}
          />

          <PropertyInformationSection
            data={state.propertyInformation}
            reviewStatus={state.reviewStatus.propertyInformation}
            onChange={handlePropertyInformationChange}
            onLooksGood={handlePropertyInformationReview}
            testID={testID ? `${testID}-property-information` : undefined}
          />
          <TransactionResultSectionDivider
            testID={testID ? `${testID}-divider-property-information` : undefined}
          />

          <FormsAndTasksSection
            data={state.formsAndTasks}
            reviewStatus={state.reviewStatus.formsAndTasks}
            onChange={handleFormsAndTasksChange}
            onLooksGood={handleFormsAndTasksReview}
            testID={testID ? `${testID}-forms-and-tasks` : undefined}
          />
          <TransactionResultSectionDivider
            testID={testID ? `${testID}-divider-forms-and-tasks` : undefined}
          />
        </View>
      </View>
    </BottomDrawer>
  );
}

export const TransactionResultDrawer = memo(TransactionResultDrawerComponent);
TransactionResultDrawer.displayName = "TransactionResultDrawer";
