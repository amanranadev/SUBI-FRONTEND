import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { PersonInfoSection } from "@/components/PersonInfoSection";

import {
  PERSON_INFO_SECTION_DOCS_DESCRIPTION,
  personInfoSectionArgTypes,
} from "./PersonInfoSection/personInfoSectionArgTypes";
import { PersonInfoSectionDocsPage } from "./PersonInfoSection/PersonInfoSectionDocsPage";
import { PersonInfoSectionShowcase } from "./PersonInfoSection/PersonInfoSectionShowcase";

const DEFAULT_ARGS = {
  firstName: "Michelle",
  lastName: "Schubert",
  email: "michelle@oksubi.com",
  phone: "555-555-5555",
  disabled: false,
} as const;

function PlaygroundPersonInfoSection(
  args: React.ComponentProps<typeof PersonInfoSection>,
) {
  const [firstName, setFirstName] = useState(args.firstName);
  const [lastName, setLastName] = useState(args.lastName);
  const [email, setEmail] = useState(args.email);
  const [phone, setPhone] = useState(args.phone ?? "");

  return (
    <PersonInfoSection
      {...args}
      firstName={firstName}
      lastName={lastName}
      email={email}
      phone={args.phone !== undefined ? phone : undefined}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onEmailChange={setEmail}
      onPhoneChange={args.phone !== undefined ? setPhone : undefined}
    />
  );
}

const meta = {
  title: "Design System/PersonInfoSection",
  component: PersonInfoSection,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: PERSON_INFO_SECTION_DOCS_DESCRIPTION,
      },
    },
    notes: `
# PersonInfoSection

${PERSON_INFO_SECTION_DOCS_DESCRIPTION}
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
  args: DEFAULT_ARGS,
  argTypes: personInfoSectionArgTypes,
} satisfies Meta<typeof PersonInfoSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full PersonInfoSection documentation with props and examples.",
    controls: { disable: true },
  },
  render: () => <PersonInfoSectionDocsPage />,
};

export const Playground: Story = {
  render: (args) => <PlaygroundPersonInfoSection {...args} />,
};

export const Default: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoSectionShowcase section="default" />,
};

export const WithoutPhone: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoSectionShowcase section="noPhone" />,
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoSectionShowcase section="disabled" />,
};

export const LongValues: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoSectionShowcase section="longValues" />,
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
    flex: 1,
    width: "100%",
    alignSelf: "stretch",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
});
