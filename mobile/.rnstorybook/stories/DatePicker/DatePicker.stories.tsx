import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { DatePicker } from "@/components/DatePicker";
import { buttonTokens } from "@/components/PrimaryButton";

import {
  DATE_PICKER_DOCS_DESCRIPTION,
  datePickerArgTypes,
} from "./datePickerArgTypes";
import { DatePickerDocsPage } from "./DatePickerDocsPage";
import { DatePickerShowcase } from "./DatePickerShowcase";

const { colors: tokenColors } = buttonTokens;

const meta = {
  title: "Design System/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: DATE_PICKER_DOCS_DESCRIPTION,
      },
    },
    notes: `
# DatePicker

${DATE_PICKER_DOCS_DESCRIPTION}

## Stories

- **Documentation** — Full docs + grouped examples (Default, Constraints, Formats, Disabled, Interactive).
- **DefaultStates**, **Constraints**, **Formats**, **Disabled**, **Interactive** — Section galleries.

Always use \`<Icon name="calendar" />\` inside DatePicker — never import SVGs directly.
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
    placeholder: "Select Date",
    format: "dd-MMM-yyyy",
    disabled: false,
  },
  argTypes: datePickerArgTypes,
} satisfies Meta<typeof DatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full component documentation with grouped gallery layout.",
    controls: { disable: true },
  },
  render: () => <DatePickerDocsPage />,
};

export const DefaultStates: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DatePickerShowcase section="default" />,
};

export const Constraints: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DatePickerShowcase section="constraints" />,
};

export const Formats: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DatePickerShowcase section="formats" />,
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DatePickerShowcase section="disabled" />,
};

export const Interactive: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <DatePickerShowcase section="interactive" />,
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
