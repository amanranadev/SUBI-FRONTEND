import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  BottomTabBar,
  bottomTabBarTokens,
} from "../../../components/BottomTabBar";

import {
  BOTTOM_TAB_BAR_DOCS_DESCRIPTION,
  bottomTabBarArgTypes,
} from "./bottomTabBarArgTypes";
import { BottomTabBarDocsPage } from "./BottomTabBarDocsPage";
import {
  BottomTabBarShowcase,
  DEFAULT_BOTTOM_TABS,
} from "./BottomTabBarShowcase";

const { colors: tokenColors } = bottomTabBarTokens;

const meta = {
  title: "Design System/BottomTabBar",
  component: BottomTabBar,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: BOTTOM_TAB_BAR_DOCS_DESCRIPTION,
      },
    },
    notes: `
# BottomTabBar

${BOTTOM_TAB_BAR_DOCS_DESCRIPTION}

Default props match the Figma bottom navigation with Tasks active.
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
    items: DEFAULT_BOTTOM_TABS,
    value: "tasks",
    size: "md",
    showLabels: true,
    showHomeIndicator: true,
    elevated: true,
    disabled: false,
  },
  argTypes: bottomTabBarArgTypes,
} satisfies Meta<typeof BottomTabBar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full BottomTabBar documentation with props and grouped examples.",
    controls: { disable: true },
  },
  render: () => <BottomTabBarDocsPage />,
};

export const FigmaTasksActive: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <BottomTabBarShowcase section="figma" />,
};

export const ActiveTabs: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <BottomTabBarShowcase section="active" />,
};

export const States: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <BottomTabBarShowcase section="states" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <BottomTabBarShowcase section="sizes" />,
};

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return (
      <BottomTabBar
        {...args}
        value={value}
        onValueChange={(nextValue) => {
          setValue(nextValue);
          args.onValueChange?.(nextValue);
        }}
      />
    );
  },
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.background,
  },
});
