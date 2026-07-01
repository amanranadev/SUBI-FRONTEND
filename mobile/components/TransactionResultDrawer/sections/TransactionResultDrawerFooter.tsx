import React, { memo } from "react";
import { View } from "react-native";

import { PrimaryButton } from "@/components/PrimaryButton";

import {
  DISCARD_DRAFT_LABEL,
  SAVE_TRANSACTION_LABEL,
} from "../TransactionResultDrawer.constants";
import { transactionResultDrawerStyles } from "../TransactionResultDrawer.styles";

interface TransactionResultDrawerFooterProps {
  allSectionsDone: boolean;
  onDiscardDraft?: () => void;
  onSaveTransaction?: () => void;
  testID?: string;
}

export const TransactionResultDrawerFooter = memo(
  function TransactionResultDrawerFooter({
    allSectionsDone,
    onDiscardDraft = () => undefined,
    onSaveTransaction = () => undefined,
    testID,
  }: TransactionResultDrawerFooterProps) {
    return (
      <View style={transactionResultDrawerStyles.footer} testID={testID}>
        <View style={transactionResultDrawerStyles.footerButton}>
          <PrimaryButton
            variant="outline"
            size="lg"
            fullWidth
            onPress={onDiscardDraft}
            accessibilityLabel={DISCARD_DRAFT_LABEL}
            testID={testID ? `${testID}-discard` : undefined}
          >
            {DISCARD_DRAFT_LABEL}
          </PrimaryButton>
        </View>
        <View style={transactionResultDrawerStyles.footerButton}>
          <PrimaryButton
            variant={allSectionsDone ? "primary" : "muted"}
            size="lg"
            fullWidth
            disabled={!allSectionsDone}
            onPress={onSaveTransaction}
            accessibilityLabel={SAVE_TRANSACTION_LABEL}
            testID={testID ? `${testID}-save` : undefined}
          >
            {SAVE_TRANSACTION_LABEL}
          </PrimaryButton>
        </View>
      </View>
    );
  },
);

TransactionResultDrawerFooter.displayName = "TransactionResultDrawerFooter";
