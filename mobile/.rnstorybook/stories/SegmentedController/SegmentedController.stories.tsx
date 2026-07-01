import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  SegmentedController,
  segmentedControllerTokens,
} from "../../../components/SegmentedController";

import {
  SEGMENTED_CONTROLLER_DOCS_DESCRIPTION,
  segmentedControllerArgTypes,
} from "./segmentedControllerArgTypes";
import { SegmentedControllerDocsPage } from "./SegmentedControllerDocsPage";
import { SegmentedControllerShowcase } from "./SegmentedControllerShowcase";

const { colors: tokenColors } = segmentedControllerTokens;

const DEFAULT_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
];

const meta = {
  title: "Design System/SegmentedController",
  component: SegmentedController,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: SEGMENTED_CONTROLLER_DOCS_DESCRIPTION,
      },
    },
    notes: `
# SegmentedController

${SEGMENTED_CONTROLLER_DOCS_DESCRIPTION}

Default props match the Figma Tasks screen Active/Completed pill controller.
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
    options: DEFAULT_OPTIONS,
    value: "active",
    size: "md",
    variant: "pill",
    fullWidth: false,
    disabled: false,
    uppercase: true,
  },
  argTypes: segmentedControllerArgTypes,
} satisfies Meta<typeof SegmentedController>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full SegmentedController documentation with props and grouped examples.",
    controls: { disable: true },
  },
  render: () => <SegmentedControllerDocsPage />,
};

export const FigmaTasks: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <SegmentedControllerShowcase section="figma" />,
};

export const SegmentCounts: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <SegmentedControllerShowcase section="counts" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <SegmentedControllerShowcase section="sizes" />,
};

export const Width: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <SegmentedControllerShowcase section="width" />,
};

export const States: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <SegmentedControllerShowcase section="states" />,
};

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState(args.value);

    return (
      <SegmentedController
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
