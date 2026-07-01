import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { ItemListEditor } from "@/components/ItemListEditor";

import {
  ITEM_LIST_EDITOR_DOCS_DESCRIPTION,
  itemListEditorArgTypes,
} from "./ItemListEditor/itemListEditorArgTypes";
import { ItemListEditorDocsPage } from "./ItemListEditor/ItemListEditorDocsPage";
import { ItemListEditorShowcase } from "./ItemListEditor/ItemListEditorShowcase";

const DEFAULT_ITEMS = ["Microwave", "Refrigerator"] as const;

function PlaygroundItemListEditor(
  args: Omit<React.ComponentProps<typeof ItemListEditor>, "items" | "onChange"> & {
    initialItems?: string[];
  },
) {
  const { initialItems = [], ...editorArgs } = args;
  const [items, setItems] = useState(initialItems);

  return <ItemListEditor {...editorArgs} items={items} onChange={setItems} />;
}

type PlaygroundArgs = React.ComponentProps<typeof ItemListEditor> & {
  initialItems?: string[];
};

const meta = {
  title: "Design System/ItemListEditor",
  component: ItemListEditor,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: ITEM_LIST_EDITOR_DOCS_DESCRIPTION,
      },
    },
    notes: `
# ItemListEditor

${ITEM_LIST_EDITOR_DOCS_DESCRIPTION}
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
    label: "ADD ITEM",
    placeholder: "Add item",
    helperText: "Optional",
    emptyStateText: "No items added yet.",
    disabled: false,
    initialItems: [...DEFAULT_ITEMS],
  },
  argTypes: itemListEditorArgTypes,
} satisfies Meta<PlaygroundArgs>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full ItemListEditor documentation with props and examples.",
    controls: { disable: true },
  },
  render: () => <ItemListEditorDocsPage />,
};

export const Playground: Story = {
  render: (args) => <PlaygroundItemListEditor {...args} />,
};

export const EmptyState: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ItemListEditorShowcase section="empty" />,
};

export const WithItems: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ItemListEditorShowcase section="withItems" />,
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ItemListEditorShowcase section="disabled" />,
};

export const MaxItemsReached: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ItemListEditorShowcase section="maxItems" />,
};

export const LongValues: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ItemListEditorShowcase section="longValues" />,
};

export const DuplicatePrevention: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ItemListEditorShowcase section="duplicatePrevention" />,
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
