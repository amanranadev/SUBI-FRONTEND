import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";

import { Icon } from "../../../assets/icon-system";
import {
  Badge,
  Chip,
  chipsBadgesTokens,
} from "../../../components/ChipsBadges";
import {
  DocCodeBlock,
  DocGalleryGrid,
  DocGalleryItem,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import {
  BADGE_PROP_DEFINITIONS,
  CHIP_PROP_DEFINITIONS,
  CHIPS_BADGES_DOCS_DESCRIPTION,
} from "./chipsBadgesArgTypes";
import { ChipsBadgesShowcase } from "./ChipsBadgesShowcase";

const { colors } = chipsBadgesTokens;

const USAGE_BADGE = `<Badge label="Verified" variant="success" size="sm" />`;

const USAGE_FILTER = `<Chip
  label="Most Recent"
  selected
  rightIcon={<Ionicons name="checkmark" />}
/>`;

const USAGE_ACTION = `<Chip
  label="Edit"
  size="md"
  leftIcon={<Icon name="edit" />}
  onPress={handleEdit}
/>`;

export function ChipsBadgesDocsPage() {
  return (
    <DocScreen>
      <DocTitle>ChipsBadges</DocTitle>
      <DocSubtitle>{CHIPS_BADGES_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use Badge for passive status labels. Use Chip for filter, date, and
          compact action controls.
        </DocParagraph>
        <DocPreviewCard label="Figma set">
          <View style={{ gap: 10 }}>
            <Badge label="Verified" variant="success" size="sm" />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Chip
                label="Edit"
                size="md"
                leftIcon={
                  <Icon
                    name="edit"
                    size={12}
                    color={colors.textPrimary}
                    accessible={false}
                  />
                }
              />
              <Chip label="Skip" size="md" />
              <Chip label="Done" size="md" variant="success" />
            </View>
          </View>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Chip props">
        <DocPropsTable rows={[...CHIP_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Badge props">
        <DocPropsTable rows={[...BADGE_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_BADGE} />
        <DocCodeBlock code={USAGE_FILTER} />
        <DocCodeBlock code={USAGE_ACTION} />
        <DocGalleryGrid>
          <DocGalleryItem label="Status badge">
            <Badge label="Verified" variant="success" size="sm" />
          </DocGalleryItem>
          <DocGalleryItem label="Filter chip">
            <Chip
              label="Active"
              selected
              rightIcon={
                <Ionicons name="checkmark" size={12} color={colors.brand} />
              }
            />
          </DocGalleryItem>
          <DocGalleryItem label="Date chip">
            <Chip
              label="09-Apr-2026"
              variant="muted"
              uppercase={false}
              leftIcon={
                <Ionicons
                  name="calendar-outline"
                  size={12}
                  color={colors.textMuted}
                />
              }
            />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by Figma references, badges, filters, actions, and
          sizes.
        </DocParagraph>
        <ChipsBadgesShowcase />
      </DocSection>
    </DocScreen>
  );
}
