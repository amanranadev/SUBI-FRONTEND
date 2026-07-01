import React, { memo } from "react";
import { View } from "react-native";

import { Divider } from "@/components/Divider";

import { transactionResultDrawerStyles } from "../TransactionResultDrawer.styles";

interface TransactionResultSectionDividerProps {
  testID?: string;
}

export const TransactionResultSectionDivider = memo(
  function TransactionResultSectionDivider({
    testID,
  }: TransactionResultSectionDividerProps) {
    return (
      <View style={transactionResultDrawerStyles.sectionDivider} testID={testID}>
        <Divider />
      </View>
    );
  },
);

TransactionResultSectionDivider.displayName = "TransactionResultSectionDivider";
