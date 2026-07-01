import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DateBadge } from "../../../components/DateBadge";
import { buttonTokens } from "../../../components/PrimaryButton";

import {
  DATE_BADGE_DOCS_DESCRIPTION,
  dateBadgeArgTypes,
} from "./dateBadgeArgTypes";
import { DateBadgeDocsPage } from "./DateBadgeDocsPage";
import { DateBadgeShowcase } from "./DateBadgeShowcase";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/DateBadge",
  component: DateBadge,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: DATE_BADGE_DOCS_DESCRIPTION,
      },
    },
    notes: `
# DateBadge

${DATE_BADGE_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped examples (Variants, Sizes, Today, Disabled, Interactive, Calendar).
- **Variants**, **Sizes**, **Today**, **Disabled**, **Interactive**, **CalendarStrip** — Section galleries.
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
    date: new Date("2026-04-10"),
    size: "md",
    variant: "default",
    disabled: false,
    highlightToday: false,
  },
  argTypes: dateBadgeArgTypes,
} satisfies Meta<typeof DateBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <DateBadgeDocsPage />,
};

export const Variants: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DateBadgeShowcase section="variants" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DateBadgeShowcase section="sizes" />,
};

export const Today: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DateBadgeShowcase section="today" />,
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DateBadgeShowcase section="disabled" />,
};

export const CalendarStrip: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DateBadgeShowcase section="calendar" />,
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: tokenColors.surfaceBackground,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  decorator: {
    flex: 1,
    padding: 16,
    backgroundColor: tokenColors.surfaceBackground,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
});
