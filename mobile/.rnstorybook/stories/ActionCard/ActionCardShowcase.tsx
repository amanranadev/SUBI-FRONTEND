import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { ActionCard } from "@/components/ActionCard";
import { actionCardTokens } from "@/components/ActionCard/ActionCard.styles";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const ICON_SIZE = actionCardTokens.sizing.iconSize;
const ICON_COLOR = actionCardTokens.colors.title;

const CHECKLIST_ACTIONS = [
  {
    id: "standard",
    title: "Standard Checklist",
    description: "Use a predefined checklist",
    iconName: "check-circle" as const,
  },
  {
    id: "create",
    title: "Create Checklist",
    description: "Build from scratch",
    iconName: "add" as const,
  },
  {
    id: "upload",
    title: "Upload Checklist",
    description: "Import from CSV file",
    iconName: "document-upload" as const,
  },
  {
    id: "templates",
    title: "Saved Templates",
    description: "Reuse saved templates",
    iconName: "document" as const,
  },
] as const;

function ChecklistActionCard({
  title,
  description,
  iconName,
  selected = false,
  disabled = false,
  onPress,
  constrained = true,
}: {
  title: string;
  description: string;
  iconName: (typeof CHECKLIST_ACTIONS)[number]["iconName"];
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  constrained?: boolean;
}) {
  const card = (
    <ActionCard
      title={title}
      description={description}
      selected={selected}
      disabled={disabled}
      onPress={onPress}
      icon={
        <Icon
          name={iconName}
          size={ICON_SIZE}
          color={ICON_COLOR}
          accessible={false}
        />
      }
    />
  );

  if (!constrained) {
    return card;
  }

  return <View style={showcaseStyles.cardFrame}>{card}</View>;
}

function SelectableGridExample() {
  const [selectedId, setSelectedId] = useState<string>("standard");

  return (
    <View style={showcaseStyles.grid}>
      {CHECKLIST_ACTIONS.map((action) => (
        <View key={action.id} style={showcaseStyles.gridItem}>
          <ChecklistActionCard
            title={action.title}
            description={action.description}
            iconName={action.iconName}
            selected={selectedId === action.id}
            onPress={() => setSelectedId(action.id)}
            constrained={false}
          />
        </View>
      ))}
    </View>
  );
}

export type ActionCardShowcaseSection =
  | "all"
  | "standard"
  | "create"
  | "upload"
  | "templates"
  | "selected"
  | "disabled"
  | "grid";

export function ActionCardShowcase({
  section = "all",
}: {
  section?: ActionCardShowcaseSection;
}) {
  const show = (name: ActionCardShowcaseSection) =>
    section === "all" || section === name;

  return (
    <GalleryScreen>
      {show("standard") ? (
        <GallerySection title="Standard Checklist">
          <GalleryItem label="check-circle icon" wide>
            <ChecklistActionCard
              title="Standard Checklist"
              description="Use a predefined checklist"
              iconName="check-circle"
              onPress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("create") ? (
        <GallerySection title="Create Checklist">
          <GalleryItem label="add icon" wide>
            <ChecklistActionCard
              title="Create Checklist"
              description="Build from scratch"
              iconName="add"
              onPress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("upload") ? (
        <GallerySection title="Upload Checklist">
          <GalleryItem label="document-upload icon" wide>
            <ChecklistActionCard
              title="Upload Checklist"
              description="Import from CSV file"
              iconName="document-upload"
              onPress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("templates") ? (
        <GallerySection title="Saved Templates">
          <GalleryItem label="document icon" wide>
            <ChecklistActionCard
              title="Saved Templates"
              description="Reuse saved templates"
              iconName="document"
              onPress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("selected") ? (
        <GallerySection title="Selected state">
          <GalleryItem label="Selected card" wide>
            <ChecklistActionCard
              title="Upload Checklist"
              description="Import from CSV file"
              iconName="document-upload"
              selected
              onPress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("disabled") ? (
        <GallerySection title="Disabled state">
          <GalleryItem label="Disabled card" wide>
            <ChecklistActionCard
              title="Saved Templates"
              description="Reuse saved templates"
              iconName="document"
              disabled
              onPress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("grid") ? (
        <GallerySection
          title="Grid example"
          description="Four checklist actions in a responsive row."
        >
          <GalleryItem label="Selectable grid" wide>
            <SelectableGridExample />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const showcaseStyles = StyleSheet.create({
  cardFrame: {
    width: "100%",
    maxWidth: 240,
    alignSelf: "center",
    padding: 2,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "stretch",
  },
  gridItem: {
    width: "47%",
    minWidth: 148,
    flexGrow: 1,
  },
});
