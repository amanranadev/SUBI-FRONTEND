import React, { memo, useCallback } from "react";
import { Text, View } from "react-native";

import { CollapsibleSection } from "@/components/CollapsibleSection";
import { PersonInfoList, type PersonInfo } from "@/components/PersonInfoList";
import { PrimaryButton } from "@/components/PrimaryButton";

import {
  CLIENT_SUBHEADINGS,
  LOOKS_GOOD_LABEL,
  SECTION_TITLES,
} from "../TransactionResultDrawer.constants";
import { transactionResultDrawerStyles } from "../TransactionResultDrawer.styles";
import type {
  ClientInformationData,
  ReviewStatus,
} from "../TransactionResultDrawer.types";
import { useCollapsibleSectionLooksGood } from "../useCollapsibleSectionLooksGood";
import { ReviewStatusBadge } from "./ReviewStatusBadge";

interface ClientInformationSectionProps {
  data: ClientInformationData;
  reviewStatus: ReviewStatus;
  onChange: (payload: Partial<ClientInformationData>) => void;
  onLooksGood: () => void;
  testID?: string;
}

export const ClientInformationSection = memo(function ClientInformationSection({
  data,
  reviewStatus,
  onChange,
  onLooksGood,
  testID,
}: ClientInformationSectionProps) {
  const handleBuyersChange = useCallback(
    (buyers: PersonInfo[]) => onChange({ buyers }),
    [onChange],
  );
  const handleBuyerAgentChange = useCallback(
    (buyerAgent: PersonInfo[]) => onChange({ buyerAgent }),
    [onChange],
  );
  const handleSellerAgentChange = useCallback(
    (sellerAgent: PersonInfo[]) => onChange({ sellerAgent }),
    [onChange],
  );

  const { expanded, onExpandedChange, handleLooksGood } =
    useCollapsibleSectionLooksGood(onLooksGood);

  return (
    <CollapsibleSection
      title={SECTION_TITLES.clientInformation}
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
      <View
        style={[
          transactionResultDrawerStyles.sectionContent,
          transactionResultDrawerStyles.clientSubsectionList,
        ]}
      >
        <View style={transactionResultDrawerStyles.subsection}>
          <Text style={transactionResultDrawerStyles.sectionSubheading}>
            {CLIENT_SUBHEADINGS.buyers}
          </Text>
          <PersonInfoList
            people={data.buyers}
            onChange={handleBuyersChange}
            addButtonLabel="Add Buyer"
            showImportButton
            onImportPress={() => undefined}
            minItems={1}
            testID={testID ? `${testID}-buyers` : undefined}
          />
        </View>

        <View style={transactionResultDrawerStyles.subsection}>
          <Text style={transactionResultDrawerStyles.sectionSubheading}>
            {CLIENT_SUBHEADINGS.buyerAgent}
          </Text>
          <PersonInfoList
            people={data.buyerAgent}
            onChange={handleBuyerAgentChange}
            addButtonLabel="Add Agent"
            minItems={1}
            testID={testID ? `${testID}-buyer-agent` : undefined}
          />
        </View>

        <View style={transactionResultDrawerStyles.subsection}>
          <Text style={transactionResultDrawerStyles.sectionSubheading}>
            {CLIENT_SUBHEADINGS.sellerAgent}
          </Text>
          <PersonInfoList
            people={data.sellerAgent}
            onChange={handleSellerAgentChange}
            addButtonLabel="Add Agent"
            minItems={1}
            testID={testID ? `${testID}-seller-agent` : undefined}
          />
        </View>
      </View>
    </CollapsibleSection>
  );
});

ClientInformationSection.displayName = "ClientInformationSection";
