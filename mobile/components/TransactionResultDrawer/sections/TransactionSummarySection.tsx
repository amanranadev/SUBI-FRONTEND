import React, { memo, useCallback } from "react";
import { Text, View } from "react-native";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import { DatePicker } from "@/components/DatePicker";
import { FormFieldInput } from "@/components/FormFieldInput";
import { PrimaryButton } from "@/components/PrimaryButton";

import {
  LOOKS_GOOD_LABEL,
  SECTION_TITLES,
} from "../TransactionResultDrawer.constants";
import { transactionResultDrawerStyles } from "../TransactionResultDrawer.styles";
import type {
  ReviewStatus,
  TransactionSummaryData,
} from "../TransactionResultDrawer.types";
import { useCollapsibleSectionLooksGood } from "../useCollapsibleSectionLooksGood";
import { ReviewStatusBadge } from "./ReviewStatusBadge";

interface TransactionSummarySectionProps {
  data: TransactionSummaryData;
  reviewStatus: ReviewStatus;
  onChange: (payload: Partial<TransactionSummaryData>) => void;
  onLooksGood: () => void;
  testID?: string;
}

export const TransactionSummarySection = memo(function TransactionSummarySection({
  data,
  reviewStatus,
  onChange,
  onLooksGood,
  testID,
}: TransactionSummarySectionProps) {
  const handlePropertyAddressChange = useCallback(
    (value: string) => onChange({ propertyAddress: value }),
    [onChange],
  );
  const handlePurchasePriceChange = useCallback(
    (value: string) => onChange({ purchasePrice: value }),
    [onChange],
  );
  const handlePsaTypeChange = useCallback(
    (value: string) => onChange({ psaType: value }),
    [onChange],
  );
  const handleEarnestMoneyChange = useCallback(
    (value: string) => onChange({ earnestMoney: value }),
    [onChange],
  );
  const handleClosingDateChange = useCallback(
    (value: Date) => onChange({ closingDate: value }),
    [onChange],
  );
  const handleMutualAcceptanceChange = useCallback(
    (value: Date) => onChange({ mutualAcceptance: value }),
    [onChange],
  );

  const { expanded, onExpandedChange, handleLooksGood } =
    useCollapsibleSectionLooksGood(onLooksGood);

  return (
    <CollapsibleSection
      title={SECTION_TITLES.transactionSummary}
      badge={<ReviewStatusBadge status={reviewStatus} />}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
      footerStyle={transactionResultDrawerStyles.looksGoodFooter}
      footer={
        <PrimaryButton
          size="sm"
          onPress={handleLooksGood}
          accessibilityLabel={LOOKS_GOOD_LABEL}
          testID={testID ? `${testID}-looks-good` : undefined}
        >
          {LOOKS_GOOD_LABEL}
        </PrimaryButton>
      }
      testID={testID}
    >
      <View style={transactionResultDrawerStyles.sectionContent}>
        <FormFieldInput
          label="PROPERTY ADDRESS"
          value={data.propertyAddress}
          onChangeText={handlePropertyAddressChange}
          required
          optionalText=""
          placeholder="Property address"
          testID={testID ? `${testID}-property-address` : undefined}
        />

        <FormFieldInput
          label="PURCHASE PRICE"
          value={data.purchasePrice}
          onChangeText={handlePurchasePriceChange}
          required
          optionalText=""
          placeholder="Purchase price"
          testID={testID ? `${testID}-purchase-price` : undefined}
        />

        <FormFieldInput
          label="PSA TYPE"
          value={data.psaType}
          onChangeText={handlePsaTypeChange}
          optionalText=""
          placeholder="PSA type"
          testID={testID ? `${testID}-psa-type` : undefined}
        />

        <FormFieldInput
          label="EARNEST MONEY"
          value={data.earnestMoney}
          onChangeText={handleEarnestMoneyChange}
          optionalText=""
          placeholder="Earnest money"
          testID={testID ? `${testID}-earnest-money` : undefined}
        />

        <View style={transactionResultDrawerStyles.dateField}>
          <Text style={transactionResultDrawerStyles.dateLabel}>
            CLOSING DATE *
          </Text>
          <DatePicker
            value={data.closingDate}
            onChange={handleClosingDateChange}
            accessibilityLabel="Closing date"
            testID={testID ? `${testID}-closing-date` : undefined}
          />
        </View>

        <View style={transactionResultDrawerStyles.dateField}>
          <Text style={transactionResultDrawerStyles.dateLabel}>
            MUTUAL ACCEPTANCE *
          </Text>
          <DatePicker
            value={data.mutualAcceptance}
            onChange={handleMutualAcceptanceChange}
            accessibilityLabel="Mutual acceptance date"
            testID={testID ? `${testID}-mutual-acceptance` : undefined}
          />
        </View>
      </View>
    </CollapsibleSection>
  );
});

TransactionSummarySection.displayName = "TransactionSummarySection";
