import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { ActionCard } from "@/components/ActionCard";
import { actionCardTokens } from "@/components/ActionCard/ActionCard.styles";

import {
  ACTION_CARD_DOCS_DESCRIPTION,
  actionCardArgTypes,
} from "./ActionCard/actionCardArgTypes";
import { ActionCardDocsPage } from "./ActionCard/ActionCardDocsPage";
import { ActionCardShowcase } from "./ActionCard/ActionCardShowcase";

const ICON_SIZE = actionCardTokens.sizing.iconSize;
const ICON_COLOR = actionCardTokens.colors.title;

function renderActionCard(
  args: React.ComponentProps<typeof ActionCard>,
  iconName: React.ComponentProps<typeof Icon>["name"],
) {
  return (
    <ActionCard
      {...args}
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
}

const meta = {
  title: "Design System/ActionCard",
  component: ActionCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: ACTION_CARD_DOCS_DESCRIPTION,
      },
    },
    notes: `
# ActionCard

${ACTION_CARD_DOCS_DESCRIPTION}
    `.trim(),
  },
  decorators: [
    (Story, context) => {
      if (context.parameters.docsPage || context.parameters.galleryPage) {
        return (
          <ScrollView
            style={storyStyles.scroll}
            contentContainerStyle={storyStyles.scrollContent}
          >
            <Story />
          </ScrollView>
        );
      }

      return (
        <View style={storyStyles.decorator}>
          <Story />
        </View>
      );
    },
  ],
  args: {
    title: "Upload Checklist",
    description: "Import from CSV file",
    selected: false,
    disabled: false,
  },
  argTypes: actionCardArgTypes,
} satisfies Meta<typeof ActionCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full ActionCard documentation with props and examples.",
    controls: { disable: true },
  },
  render: () => <ActionCardDocsPage />,
};

export const Playground: Story = {
  render: (args) => renderActionCard(args, "document-upload"),
};

export const StandardChecklist: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ActionCardShowcase section="standard" />,
};

export const CreateChecklist: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ActionCardShowcase section="create" />,
};

export const UploadChecklist: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ActionCardShowcase section="upload" />,
};

export const SavedTemplates: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ActionCardShowcase section="templates" />,
};

export const SelectedState: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ActionCardShowcase section="selected" />,
};

export const DisabledState: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ActionCardShowcase section="disabled" />,
};

export const GridExample: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ActionCardShowcase section="grid" />,
};

const storyStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    width: "100%",
    alignSelf: "stretch",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
});
