import React from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "../../../assets/icon-system";
import { PrimaryButton, buttonTokens } from "../../../components/PrimaryButton";

import {
  GalleryFullWidthRow,
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const { colors: c } = buttonTokens;

export type ShowcaseSection =
  | "all"
  | "primary"
  | "secondary"
  | "chips"
  | "icon-only"
  | "disabled"
  | "loading";

export interface PrimaryButtonShowcaseProps {
  section?: ShowcaseSection;
}

export function PrimaryButtonShowcase({
  section = "all",
}: PrimaryButtonShowcaseProps) {
  const show = (key: Exclude<ShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("primary") ? (
      <GallerySection
        title="1. Primary Actions"
        description="Main CTAs — brand orange, pill or rounded shapes."
      >
        <GalleryItem label="Text only">
          <PrimaryButton variant="primary" size="lg">
            Log in
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="With icon">
          <PrimaryButton
            variant="primary"
            size="md"
            shape="rounded"
            elevated
            leftIcon={
              <Icon name="retry" size={16} color={c.textOnBrand} />
            }
          >
            Try Again
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Right icon">
          <PrimaryButton
            variant="primary"
            size="md"
            shape="rounded"
            rightIcon={
              <Icon name="arrow-right" size={16} color={c.textOnBrand} />
            }
          >
            Continue
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Full width" wide>
          <PrimaryButton variant="primary" size="lg" fullWidth>
            Log in
          </PrimaryButton>
        </GalleryItem>
      </GallerySection>
      ) : null}

      {show("secondary") ? (
      <GallerySection
        title="2. Secondary Actions"
        description="Supporting actions — outline, secondary, and paired layouts."
      >
        <GalleryItem label="Secondary">
          <PrimaryButton
            variant="secondary"
            size="lg"
            leftIcon={<Icon name="google" size={20} />}
          >
            Continue with Google
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Outline">
          <PrimaryButton
            variant="outline"
            size="md"
            leftIcon={<Icon name="frame" size={18} color={c.textPrimary} />}
          >
            Stop Processing
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Cancel">
          <PrimaryButton
            variant="outline"
            size="md"
            leftIcon={<Icon name="close" size={16} color={c.textPrimary} />}
          >
            Cancel
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Muted">
          <PrimaryButton variant="muted" size="lg">
            Save Transaction
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Paired row" wide>
          <GalleryFullWidthRow>
            <PrimaryButton
              variant="outline"
              size="lg"
              shape="pill"
              style={showcaseStyles.flexButton}
            >
              Discard Draft
            </PrimaryButton>
            <PrimaryButton
              variant="muted"
              size="lg"
              shape="pill"
              style={showcaseStyles.flexButton}
            >
              Save Transaction
            </PrimaryButton>
          </GalleryFullWidthRow>
        </GalleryItem>
        <GalleryItem label="Cancel · Try Again" wide>
          <GalleryFullWidthRow>
            <PrimaryButton
              variant="outline"
              size="md"
              shape="rounded"
              style={showcaseStyles.flexButton}
              leftIcon={<Icon name="close" size={16} />}
            >
              Cancel
            </PrimaryButton>
            <PrimaryButton
              variant="primary"
              size="md"
              shape="rounded"
              elevated
              style={showcaseStyles.flexButton}
              leftIcon={
                <Icon name="retry" size={16} color={c.textOnBrand} />
              }
            >
              Try Again
            </PrimaryButton>
          </GalleryFullWidthRow>
        </GalleryItem>
      </GallerySection>
      ) : null}

      {show("chips") ? (
      <GallerySection
        title="3. Chips"
        description="Compact actions — chip, field-chip, tag, and success variants."
      >
        <GalleryItem label="Chip">
          <PrimaryButton
            variant="chip"
            size="sm"
            leftIcon={<Icon name="star" size={15} />}
          >
            AI Result
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Chip">
          <PrimaryButton
            variant="chip"
            size="sm"
            leftIcon={<Icon name="settings" size={15} />}
          >
            Report Issue
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Field chip">
          <PrimaryButton
            variant="field-chip"
            size="sm"
            leftIcon={<Icon name="add" size={16} />}
          >
            Add Seat (2/12)
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Tag">
          <PrimaryButton
            variant="tag"
            size="sm"
            leftIcon={<Icon name="edit" size={12} />}
          >
            EDIT
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Success chip">
          <PrimaryButton variant="success-chip" size="sm">
            SUCCESS
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Both icons">
          <PrimaryButton
            variant="chip"
            size="sm"
            leftIcon={<Icon name="search" size={15} />}
            rightIcon={<Icon name="arrow-right" size={15} />}
          >
            Search
          </PrimaryButton>
        </GalleryItem>
      </GallerySection>
      ) : null}

      {show("icon-only") ? (
      <GallerySection
        title="4. Icon Only"
        description="Toolbar and icon triggers — always set accessibilityLabel."
      >
        <GalleryItem label="Search">
          <PrimaryButton
            variant="icon-only"
            size="lg"
            leftIcon={<Icon name="search" size={20} color={c.iconMuted} />}
            accessibilityLabel="Search"
          />
        </GalleryItem>
        <GalleryItem label="Filter">
          <PrimaryButton
            variant="icon-only"
            size="md"
            leftIcon={<Icon name="filter" size={18} color={c.iconMuted} />}
            accessibilityLabel="Filter"
          />
        </GalleryItem>
        <GalleryItem label="Document">
          <PrimaryButton
            variant="icon-only"
            size="md"
            leftIcon={<Icon name="document" size={18} color={c.iconMuted} />}
            accessibilityLabel="Document"
          />
        </GalleryItem>
        <GalleryItem label="Delete">
          <PrimaryButton
            variant="icon-only"
            size="md"
            leftIcon={<Icon name="trash" size={18} color={c.destructive} />}
            accessibilityLabel="Delete"
          />
        </GalleryItem>
      </GallerySection>
      ) : null}

      {show("disabled") ? (
      <GallerySection
        title="5. Disabled"
        description="Non-interactive and inactive appearances."
      >
        <GalleryItem label="Primary">
          <PrimaryButton variant="primary" size="lg" disabled>
            Log in
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Secondary">
          <PrimaryButton variant="secondary" size="lg" disabled>
            Continue with Google
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Outline">
          <PrimaryButton variant="outline" size="md" disabled>
            Cancel
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Muted (inactive)">
          <PrimaryButton variant="muted" size="lg">
            Save Transaction
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Chip">
          <PrimaryButton variant="chip" size="sm" disabled>
            AI Result
          </PrimaryButton>
        </GalleryItem>
      </GallerySection>
      ) : null}

      {show("loading") ? (
      <GallerySection
        title="6. Loading"
        description="Async feedback — spinner replaces icons, press disabled."
      >
        <GalleryItem label="Primary">
          <PrimaryButton variant="primary" size="lg" loading>
            Log in
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Secondary">
          <PrimaryButton
            variant="secondary"
            size="lg"
            loading
            leftIcon={<Icon name="google" size={20} />}
          >
            Continue with Google
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Outline">
          <PrimaryButton variant="outline" size="md" loading>
            Cancel
          </PrimaryButton>
        </GalleryItem>
        <GalleryItem label="Chip">
          <PrimaryButton variant="chip" size="sm" loading>
            AI Result
          </PrimaryButton>
        </GalleryItem>
      </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const showcaseStyles = StyleSheet.create({
  flexButton: {
    flex: 1,
    minWidth: 140,
  },
});
