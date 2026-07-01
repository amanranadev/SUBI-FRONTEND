import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import {
  FormFieldInput,
  formFieldInputTokens,
} from "../../../components/FormFieldInput";

import {
  FORM_FIELD_INPUT_DOCS_DESCRIPTION,
  formFieldInputArgTypes,
} from "./formFieldInputArgTypes";
import { FormFieldInputDocsPage } from "./FormFieldInputDocsPage";
import { FormFieldInputShowcase } from "./FormFieldInputShowcase";

const { colors: tokenColors } = formFieldInputTokens;

const meta = {
  title: "Design System/FormFieldInput",
  component: FormFieldInput,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: FORM_FIELD_INPUT_DOCS_DESCRIPTION,
      },
    },
    notes: `
# FormFieldInput

${FORM_FIELD_INPUT_DOCS_DESCRIPTION}

Default props match the Figma invite field: md size, rounded field, uppercase label.
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
    label: "FIRST NAME",
    placeholder: "First Name",
    value: "",
    variant: "default",
    inputSize: "md",
    required: false,
    optionalText: "",
    helperText: "",
    errorText: "",
    showClearButton: false,
    editable: true,
  },
  argTypes: formFieldInputArgTypes,
} satisfies Meta<typeof FormFieldInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full FormFieldInput documentation with props and grouped examples.",
    controls: { disable: true },
  },
  render: () => <FormFieldInputDocsPage />,
};

export const FigmaFields: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="figma" />,
};

export const AuthInputs: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="auth" />,
};

export const States: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="states" />,
};

export const Icons: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="icons" />,
};

export const InteractiveLeftIcon: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="interactive-left" />,
};

export const InteractiveRightIcon: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="interactive-right" />,
};

export const Password: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="password" />,
};

export const PasswordVisible: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="password-visible" />,
};

export const PasswordError: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="password-error" />,
};

export const DisabledPassword: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="password-disabled" />,
};

export const Sizes: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="sizes" />,
};

export const Multiline: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormFieldInputShowcase section="multiline" />,
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
