import React from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "../../../assets/icon-system";
import {
  FloatingActionButton,
  floatingActionButtonTokens,
} from "../../../components/FloatingActionButton";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type FloatingActionButtonShowcaseSection =
  | "all"
  | "figma"
  | "sizes"
  | "variants"
  | "shapes"
  | "states"
  | "custom";

export interface FloatingActionButtonShowcaseProps {
  section?: FloatingActionButtonShowcaseSection;
}

export function FloatingActionButtonShowcase({
  section = "all",
}: FloatingActionButtonShowcaseProps) {
  const show = (key: Exclude<FloatingActionButtonShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("figma") ? (
        <GallerySection
          title="1. Figma FAB"
          description="56x56 rounded-square brand FAB from the mobile Home screen."
        >
          <GalleryItem label="Home FAB">
            <View style={styles.figmaCanvas}>
              <FloatingActionButton />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection
          title="2. Sizes"
          description="Use md for the Figma mobile FAB."
        >
          <GalleryItem label="Small">
            <FloatingActionButton size="sm" />
          </GalleryItem>
          <GalleryItem label="Medium">
            <FloatingActionButton size="md" />
          </GalleryItem>
          <GalleryItem label="Large">
            <FloatingActionButton size="lg" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("variants") ? (
        <GallerySection title="3. Variants" description="Surface treatments.">
          <GalleryItem label="Brand">
            <FloatingActionButton variant="brand" />
          </GalleryItem>
          <GalleryItem label="Dark">
            <FloatingActionButton variant="dark" />
          </GalleryItem>
          <GalleryItem label="Light">
            <FloatingActionButton variant="light" />
          </GalleryItem>
          <GalleryItem label="Danger">
            <FloatingActionButton variant="danger" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("shapes") ? (
        <GallerySection title="4. Shapes" description="Rounded is the default.">
          <GalleryItem label="Rounded">
            <FloatingActionButton shape="rounded" />
          </GalleryItem>
          <GalleryItem label="Circle">
            <FloatingActionButton shape="circle" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("states") ? (
        <GallerySection title="5. States" description="Elevation and disabled.">
          <GalleryItem label="Elevated">
            <FloatingActionButton elevated />
          </GalleryItem>
          <GalleryItem label="Flat">
            <FloatingActionButton elevated={false} />
          </GalleryItem>
          <GalleryItem label="Disabled">
            <FloatingActionButton disabled />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("custom") ? (
        <GallerySection
          title="6. Custom Content"
          description="Use children for add, close, or menu variants."
        >
          <GalleryItem label="Add">
            <FloatingActionButton accessibilityLabel="Add item">
              <Icon
                name="add"
                size={26}
                color={floatingActionButtonTokens.colors.white}
                accessible={false}
              />
            </FloatingActionButton>
          </GalleryItem>
          <GalleryItem label="Close">
            <FloatingActionButton variant="dark" accessibilityLabel="Close">
              <Icon
                name="close"
                size={24}
                color={floatingActionButtonTokens.colors.white}
                accessible={false}
              />
            </FloatingActionButton>
          </GalleryItem>
          <GalleryItem label="Document">
            <FloatingActionButton variant="light" accessibilityLabel="Open files">
              <Icon
                name="document"
                size={24}
                color={floatingActionButtonTokens.colors.textPrimary}
                accessible={false}
              />
            </FloatingActionButton>
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  figmaCanvas: {
    width: 112,
    height: 112,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FCFAFA",
    borderRadius: 16,
  },
});
