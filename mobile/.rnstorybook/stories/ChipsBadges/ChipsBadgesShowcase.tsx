import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "../../../assets/icon-system";
import {
  Badge,
  Chip,
  chipsBadgesTokens,
} from "../../../components/ChipsBadges";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type ChipsBadgesShowcaseSection =
  | "all"
  | "figma"
  | "badges"
  | "filters"
  | "actions"
  | "sizes";

export interface ChipsBadgesShowcaseProps {
  section?: ChipsBadgesShowcaseSection;
}

const { colors } = chipsBadgesTokens;

export function ChipsBadgesShowcase({
  section = "all",
}: ChipsBadgesShowcaseProps) {
  const show = (key: Exclude<ChipsBadgesShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("figma") ? (
        <GallerySection
          title="1. Figma Examples"
          description="Direct mobile references: verified badge, task actions, filters, and transaction status."
        >
          <GalleryItem label="Verified">
            <Badge label="Verified" variant="success" size="sm" />
          </GalleryItem>
          <GalleryItem label="Task actions" wide>
            <View style={styles.row}>
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
                onPress={() => {}}
              />
              <Chip label="Skip" size="md" onPress={() => {}} />
              <Chip
                label="Done"
                size="md"
                variant="success"
                onPress={() => {}}
              />
            </View>
          </GalleryItem>
          <GalleryItem label="Filters" wide>
            <View style={styles.row}>
              <Chip
                label="Most Recent"
                selected
                rightIcon={
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={colors.brand}
                  />
                }
                onPress={() => {}}
              />
              <Chip label="Status" variant="outline" onPress={() => {}} />
              <Chip
                label="Active"
                selected
                rightIcon={
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color={colors.brand}
                  />
                }
                onPress={() => {}}
              />
            </View>
          </GalleryItem>
          <GalleryItem label="Status selector">
            <Badge
              label="Pending Inspection"
              variant="brand"
              rightIcon={
                <Ionicons
                  name="chevron-down"
                  size={10}
                  color={colors.brand}
                />
              }
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("badges") ? (
        <GallerySection title="2. Badges" description="Passive status labels.">
          <GalleryItem label="Verified">
            <Badge label="Verified" variant="success" size="sm" />
          </GalleryItem>
          <GalleryItem label="Needs review">
            <Badge label="Needs Review" variant="warning" />
          </GalleryItem>
          <GalleryItem label="Priority">
            <Badge label="Priority" variant="danger" />
          </GalleryItem>
          <GalleryItem label="Muted">
            <Badge label="Archived" variant="muted" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("filters") ? (
        <GallerySection
          title="3. Filter Chips"
          description="25px Figma transaction filter chips with selected and outline states."
        >
          <GalleryItem label="Selected">
            <Chip
              label="Most Recent"
              selected
              rightIcon={
                <Ionicons name="checkmark" size={12} color={colors.brand} />
              }
              onPress={() => {}}
            />
          </GalleryItem>
          <GalleryItem label="Outline">
            <Chip label="Status" variant="outline" onPress={() => {}} />
          </GalleryItem>
          <GalleryItem label="Date">
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
              onPress={() => {}}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("actions") ? (
        <GallerySection
          title="4. Action Chips"
          description="28px compact task actions from the Tasks screen."
        >
          <GalleryItem label="Edit">
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
              onPress={() => {}}
            />
          </GalleryItem>
          <GalleryItem label="Skip">
            <Chip label="Skip" size="md" onPress={() => {}} />
          </GalleryItem>
          <GalleryItem label="Done">
            <Chip
              label="Done"
              size="md"
              variant="success"
              onPress={() => {}}
            />
          </GalleryItem>
          <GalleryItem label="Disabled">
            <Chip label="Edit" size="md" disabled onPress={() => {}} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection title="5. Sizes" description="Small filters, medium task chips, large item chips.">
          <GalleryItem label="Chip sm">
            <Chip label="Active" selected />
          </GalleryItem>
          <GalleryItem label="Chip md">
            <Chip label="Done" size="md" variant="success" />
          </GalleryItem>
          <GalleryItem label="Chip lg">
            <Chip
              label="Washer"
              size="lg"
              leftIcon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.textPrimary}
                />
              }
            />
          </GalleryItem>
          <GalleryItem label="Badge sm">
            <Badge label="Verified" size="sm" variant="success" />
          </GalleryItem>
          <GalleryItem label="Badge md">
            <Badge label="Priority" size="md" variant="danger" />
          </GalleryItem>
          <GalleryItem label="Badge lg">
            <Badge label="Needs Review" size="lg" variant="warning" />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
});
