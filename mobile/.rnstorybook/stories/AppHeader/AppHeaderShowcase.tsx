import React from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Icon } from "../../../assets/icon-system";
import { AppHeader, appHeaderTokens } from "../../../components/AppHeader";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type AppHeaderShowcaseSection =
  | "all"
  | "default"
  | "settings"
  | "title"
  | "back"
  | "full"
  | "sizes"
  | "variants";

export interface AppHeaderShowcaseProps {
  section?: AppHeaderShowcaseSection;
}

const { colors } = appHeaderTokens;

export function AppHeaderShowcase({
  section = "all",
}: AppHeaderShowcaseProps) {
  const show = (key: Exclude<AppHeaderShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("default") ? (
        <GallerySection
          title="1. Default"
          description="Logo-only header used across most screens."
        >
          <GalleryItem label="Subi Logo" wide>
            <View style={styles.phoneWidth}>
              <AppHeader />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("settings") ? (
        <GallerySection
          title="2. With Settings"
          description="Logo on the left and a right-side action."
        >
          <GalleryItem label="Settings action" wide>
            <AppHeader
              rightContent={
                <HeaderIconButton
                  iconName="settings"
                  accessibilityLabel="Open settings"
                />
              }
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("title") ? (
        <GallerySection
          title="3. With Title"
          description="Optional title beside the logo."
        >
          <GalleryItem label="Transactions" wide>
            <AppHeader title="Transactions" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("back") ? (
        <GallerySection
          title="4. With Back Button"
          description="Nested screens can show a back affordance before the logo."
        >
          <GalleryItem label="Back + Logo" wide>
            <AppHeader showBackButton onBackPress={() => {}} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("full") ? (
        <GallerySection
          title="5. Full Example"
          description="Back button, logo, title, and right action together."
        >
          <GalleryItem label="Tasks + Settings" wide>
            <AppHeader
              title="Tasks"
              showBackButton
              onBackPress={() => {}}
              rightContent={
                <HeaderIconButton
                  iconName="settings"
                  accessibilityLabel="Open settings"
                />
              }
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection title="6. Sizes" description="Small, medium, and large header scales.">
          <GalleryItem label="Small" wide>
            <AppHeader title="Transactions" size="sm" />
          </GalleryItem>
          <GalleryItem label="Medium" wide>
            <AppHeader title="Transactions" />
          </GalleryItem>
          <GalleryItem label="Large" wide>
            <AppHeader title="Transactions" size="lg" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("variants") ? (
        <GallerySection title="7. Variants" description="Default and transparent backgrounds.">
          <GalleryItem label="Default" wide>
            <AppHeader title="Transactions" />
          </GalleryItem>
          <GalleryItem label="Transparent" wide>
            <AppHeader title="Transactions" variant="transparent" />
          </GalleryItem>
          <GalleryItem label="Disabled" wide>
            <AppHeader
              title="Transactions"
              showBackButton
              disabled
              onBackPress={() => {}}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

function HeaderIconButton({
  iconName,
  accessibilityLabel,
}: {
  iconName: React.ComponentProps<typeof Icon>["name"];
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      style={styles.actionButton}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Icon name={iconName} size={24} color={colors.iconPrimary} accessible={false} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  phoneWidth: {
    width: "100%",
    maxWidth: 393,
  },
  actionButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
});
