import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { Badge, Chip, chipsBadgesTokens } from "../../../components/ChipsBadges";

import {
  badgeArgTypes,
  chipArgTypes,
  CHIPS_BADGES_DOCS_DESCRIPTION,
} from "./chipsBadgesArgTypes";
import { ChipsBadgesDocsPage } from "./ChipsBadgesDocsPage";
import { ChipsBadgesShowcase } from "./ChipsBadgesShowcase";

const { colors: tokenColors } = chipsBadgesTokens;

const meta = {
  title: "Design System/ChipsBadges",
  component: Chip,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: CHIPS_BADGES_DOCS_DESCRIPTION,
      },
    },
    notes: `
# ChipsBadges

${CHIPS_BADGES_DOCS_DESCRIPTION}

Default Chip props match the Figma transaction filter size. Badge covers passive status labels.
    `.trim(),
  },
  decorators: [
    (Story, context) => {
      if (context.parameters.docsPage || context.parameters.galleryPage) {
        return (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >
            <Story />
          </ScrollView>
        );
      }
      return (
        <View style={styles.decorator}>
          <Story />
        </View>
      );
    },
  ],
  args: {
    label: "Most Recent",
    variant: "neutral",
    size: "sm",
    selected: false,
    disabled: false,
  },
  argTypes: chipArgTypes,
} satisfies Meta<typeof Chip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full Chip and Badge documentation with props and grouped examples.",
    controls: { disable: true },
  },
  render: () => <ChipsBadgesDocsPage />,
};

export const FigmaExamples: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ChipsBadgesShowcase section="figma" />,
};

export const Badges: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ChipsBadgesShowcase section="badges" />,
};

export const Filters: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ChipsBadgesShowcase section="filters" />,
};

export const Actions: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ChipsBadgesShowcase section="actions" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ChipsBadgesShowcase section="sizes" />,
};

export const Playground: Story = {
  render: (args) => <Chip {...args} />,
};

export const BadgePlayground: Story = {
  argTypes: badgeArgTypes,
  args: {
    label: "Verified",
    variant: "success",
    size: "sm",
  },
  render: (args) => (
    <Badge
      label={args.label}
      variant={args.variant as React.ComponentProps<typeof Badge>["variant"]}
      size={args.size as React.ComponentProps<typeof Badge>["size"]}
    />
  ),
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.surfaceCard,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.surfaceCard,
  },
});
