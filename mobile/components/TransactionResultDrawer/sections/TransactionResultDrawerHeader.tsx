import React, { memo } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { Divider } from "@/components/Divider";
import { PrimaryButton, buttonTokens } from "@/components/PrimaryButton";

import {
  AI_RESULT_LABEL,
  DRAWER_HEADING,
  DRAWER_SUBHEADING,
  DRAWER_TITLE,
  REPORT_ISSUE_LABEL,
} from "../TransactionResultDrawer.constants";
import {
  transactionResultDrawerStyles,
  transactionResultDrawerTokens,
} from "../TransactionResultDrawer.styles";

interface TransactionResultDrawerHeaderProps {
  onClose?: () => void;
  onAiResultPress?: () => void;
  onReportIssuePress?: () => void;
  testID?: string;
}

export const TransactionResultDrawerHeader = memo(
  function TransactionResultDrawerHeader({
    onClose,
    onAiResultPress = () => undefined,
    onReportIssuePress = () => undefined,
    testID,
  }: TransactionResultDrawerHeaderProps) {
    return (
      <View style={transactionResultDrawerStyles.content} testID={testID}>
        <View style={transactionResultDrawerStyles.topRow}>
          <Text style={transactionResultDrawerStyles.pageTitle}>{DRAWER_TITLE}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close drawer"
            onPress={onClose}
            style={transactionResultDrawerStyles.closeButton}
            testID={testID ? `${testID}-close` : undefined}
          >
            <Icon
              name="close"
              size={transactionResultDrawerTokens.spacing.closeIconSize}
              color={transactionResultDrawerTokens.colors.closeIcon}
              accessible={false}
            />
          </Pressable>
        </View>

        <View style={transactionResultDrawerStyles.introBlock}>
          <Text style={transactionResultDrawerStyles.groupHeading}>
            {DRAWER_HEADING}
          </Text>
          <Text style={transactionResultDrawerStyles.groupSubheading}>
            {DRAWER_SUBHEADING}
          </Text>
        </View>

        <View style={transactionResultDrawerStyles.topActions}>
          <PrimaryButton
            variant="chip"
            size="sm"
            shape="chip"
            leftIcon={
              <Icon
                name="star"
                size={buttonTokens.sizes.sm.iconSize}
                color={buttonTokens.colors.textPrimary}
                accessible={false}
              />
            }
            onPress={onAiResultPress}
            accessibilityLabel={AI_RESULT_LABEL}
            style={transactionResultDrawerStyles.topHeaderActionButton}
            testID={testID ? `${testID}-ai-result` : undefined}
          >
            {AI_RESULT_LABEL}
          </PrimaryButton>
          <PrimaryButton
            variant="chip"
            size="sm"
            shape="chip"
            leftIcon={
              <Icon
                name="settings"
                size={buttonTokens.sizes.sm.iconSize}
                color={buttonTokens.colors.textPrimary}
                accessible={false}
              />
            }
            onPress={onReportIssuePress}
            accessibilityLabel={REPORT_ISSUE_LABEL}
            style={transactionResultDrawerStyles.topHeaderActionButton}
            testID={testID ? `${testID}-report-issue` : undefined}
          >
            {REPORT_ISSUE_LABEL}
          </PrimaryButton>
        </View>

        <Divider />
      </View>
    );
  },
);

TransactionResultDrawerHeader.displayName = "TransactionResultDrawerHeader";
