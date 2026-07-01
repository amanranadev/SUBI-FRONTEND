import React, { memo, useCallback } from "react";
import { View } from "react-native";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import { FormFieldInput } from "@/components/FormFieldInput";
import { ItemListEditor } from "@/components/ItemListEditor";
import { PrimaryButton } from "@/components/PrimaryButton";

import {
  LOOKS_GOOD_LABEL,
  SECTION_TITLES,
} from "../TransactionResultDrawer.constants";
import { transactionResultDrawerStyles } from "../TransactionResultDrawer.styles";
import type {
  PropertyInformationData,
  ReviewStatus,
} from "../TransactionResultDrawer.types";
import { useCollapsibleSectionLooksGood } from "../useCollapsibleSectionLooksGood";
import { ReviewStatusBadge } from "./ReviewStatusBadge";

interface PropertyInformationSectionProps {
  data: PropertyInformationData;
  reviewStatus: ReviewStatus;
  onChange: (payload: Partial<PropertyInformationData>) => void;
  onLooksGood: () => void;
  testID?: string;
}

export const PropertyInformationSection = memo(
  function PropertyInformationSection({
    data,
    reviewStatus,
    onChange,
    onLooksGood,
    testID,
  }: PropertyInformationSectionProps) {
    const handleCityChange = useCallback(
      (value: string) => onChange({ city: value }),
      [onChange],
    );
    const handleStateChange = useCallback(
      (value: string) => onChange({ state: value }),
      [onChange],
    );
    const handleCountryChange = useCallback(
      (value: string) => onChange({ country: value }),
      [onChange],
    );
    const handleParcelNumberChange = useCallback(
      (value: string) => onChange({ parcelNumber: value }),
      [onChange],
    );
    const handleTitleCompanyChange = useCallback(
      (value: string) => onChange({ titleCompany: value }),
      [onChange],
    );
    const handleClosingAgentChange = useCallback(
      (value: string) => onChange({ closingAgent: value }),
      [onChange],
    );
    const handleEscrowEmailChange = useCallback(
      (value: string) => onChange({ escrowEmail: value }),
      [onChange],
    );
    const handleLenderChange = useCallback(
      (value: string) => onChange({ lender: value }),
      [onChange],
    );
    const handleItemsThatStayChange = useCallback(
      (itemsThatStay: string[]) => onChange({ itemsThatStay }),
      [onChange],
    );

    const { expanded, onExpandedChange, handleLooksGood } =
      useCollapsibleSectionLooksGood(onLooksGood);

    return (
      <CollapsibleSection
        title={SECTION_TITLES.propertyInformation}
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
            label="CITY"
            value={data.city}
            onChangeText={handleCityChange}
            optionalText=""
            placeholder="City"
            testID={testID ? `${testID}-city` : undefined}
          />

          <FormFieldInput
            label="STATE"
            value={data.state}
            onChangeText={handleStateChange}
            optionalText=""
            placeholder="State"
            testID={testID ? `${testID}-state` : undefined}
          />

          <FormFieldInput
            label="COUNTRY"
            value={data.country}
            onChangeText={handleCountryChange}
            optionalText=""
            placeholder="Country"
            testID={testID ? `${testID}-country` : undefined}
          />

          <FormFieldInput
            label="PARCEL NUMBER"
            value={data.parcelNumber}
            onChangeText={handleParcelNumberChange}
            optionalText=""
            placeholder="Parcel number"
            testID={testID ? `${testID}-parcel-number` : undefined}
          />

          <FormFieldInput
            label="TITLE COMPANY"
            value={data.titleCompany}
            onChangeText={handleTitleCompanyChange}
            optionalText=""
            placeholder="Title company"
            testID={testID ? `${testID}-title-company` : undefined}
          />

          <FormFieldInput
            label="CLOSING AGENT"
            value={data.closingAgent}
            onChangeText={handleClosingAgentChange}
            optionalText=""
            placeholder="Closing agent"
            testID={testID ? `${testID}-closing-agent` : undefined}
          />

          <FormFieldInput
            label="ESCROW EMAIL"
            value={data.escrowEmail}
            onChangeText={handleEscrowEmailChange}
            required
            optionalText=""
            placeholder="escrow@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            testID={testID ? `${testID}-escrow-email` : undefined}
          />

          <FormFieldInput
            label="LENDER"
            value={data.lender}
            onChangeText={handleLenderChange}
            optionalText=""
            placeholder="Lender"
            testID={testID ? `${testID}-lender` : undefined}
          />

          <ItemListEditor
            items={data.itemsThatStay}
            onChange={handleItemsThatStayChange}
            label="ITEMS THAT STAY"
            placeholder="Add item that stays"
            testID={testID ? `${testID}-items-that-stay` : undefined}
          />
        </View>
      </CollapsibleSection>
    );
  },
);

PropertyInformationSection.displayName = "PropertyInformationSection";
