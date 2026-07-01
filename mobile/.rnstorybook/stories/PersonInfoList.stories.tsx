import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { PersonInfoList, type PersonInfo } from "@/components/PersonInfoList";

import {
  PERSON_INFO_LIST_DOCS_DESCRIPTION,
  personInfoListArgTypes,
} from "./PersonInfoList/personInfoListArgTypes";
import { PersonInfoListDocsPage } from "./PersonInfoList/PersonInfoListDocsPage";
import { PersonInfoListShowcase } from "./PersonInfoList/PersonInfoListShowcase";

const MICHELLE: PersonInfo = {
  id: "buyer-1",
  firstName: "Michelle",
  lastName: "Schubert",
  email: "michelle@oksubi.com",
  phone: "(509)-494-9408",
};

type PlaygroundArgs = Omit<
  React.ComponentProps<typeof PersonInfoList>,
  "people" | "onChange"
> & {
  initialPeople?: PersonInfo[];
};

function PlaygroundPersonInfoList({
  initialPeople = [MICHELLE],
  ...args
}: PlaygroundArgs) {
  const [people, setPeople] = useState(initialPeople);

  return (
    <PersonInfoList
      {...args}
      people={people}
      onChange={setPeople}
      onImportPress={args.onImportPress ?? (() => undefined)}
    />
  );
}

const meta = {
  title: "Design System/PersonInfoList",
  component: PersonInfoList,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: PERSON_INFO_LIST_DOCS_DESCRIPTION,
      },
    },
    notes: `
# PersonInfoList

${PERSON_INFO_LIST_DOCS_DESCRIPTION}
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
    addButtonLabel: "Add Buyer",
    showImportButton: false,
    minItems: 0,
    disabled: false,
    initialPeople: [MICHELLE],
  },
  argTypes: personInfoListArgTypes,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full PersonInfoList documentation with props and examples.",
    controls: { disable: true },
  },
  render: () => <PersonInfoListDocsPage />,
};

export const Playground: Story = {
  render: (args) => <PlaygroundPersonInfoList {...args} />,
};

export const SinglePerson: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoListShowcase section="single" />,
};

export const MultiplePeople: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoListShowcase section="multiple" />,
};

export const ImportContacts: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoListShowcase section="import" />,
};

export const MaxItemsReached: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoListShowcase section="maxItems" />,
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoListShowcase section="disabled" />,
};

export const BuyerExample: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <PersonInfoListShowcase section="buyerExample" />,
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
