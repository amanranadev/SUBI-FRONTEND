import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { Badge } from "@/components/ChipsBadges";
import {
  CollapsibleSection,
  collapsibleSectionTokens,
} from "@/components/CollapsibleSection";
import { PrimaryButton } from "@/components/PrimaryButton";

import {
  COLLAPSIBLE_SECTION_DOCS_DESCRIPTION,
  collapsibleSectionArgTypes,
} from "./CollapsibleSection/collapsibleSectionArgTypes";
import { CollapsibleSectionDocsPage } from "./CollapsibleSection/CollapsibleSectionDocsPage";
import { CollapsibleSectionShowcase } from "./CollapsibleSection/CollapsibleSectionShowcase";

function DemoContent() {
  return (
    <View style={storyStyles.content}>
      <Text style={storyStyles.bodyText}>
        Section body content belongs to the parent.
      </Text>
      <Text style={storyStyles.bodyText}>
        CollapsibleSection only controls presentation and expand/collapse.
      </Text>
    </View>
  );
}

const meta = {
  title: "Design System/CollapsibleSection",
  component: CollapsibleSection,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: COLLAPSIBLE_SECTION_DOCS_DESCRIPTION,
      },
    },
    notes: `
# CollapsibleSection

${COLLAPSIBLE_SECTION_DOCS_DESCRIPTION}
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
    title: "TRANSACTION SUMMARY",
    defaultExpanded: true,
    disabled: false,
  },
  argTypes: collapsibleSectionArgTypes,
} satisfies Meta<typeof CollapsibleSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full CollapsibleSection documentation with props and examples.",
    controls: { disable: true },
  },
  render: () => <CollapsibleSectionDocsPage />,
};

export const Playground: Story = {
  render: (args) => (
    <CollapsibleSection
      {...args}
      badge={<Badge label="Needs Review" variant="warning" size="lg" />}
      footer={
        <PrimaryButton size="sm" onPress={() => {}}>
          Looks Good
        </PrimaryButton>
      }
    >
      <DemoContent />
    </CollapsibleSection>
  ),
};

export const DefaultExpanded: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <CollapsibleSectionShowcase section="expanded" />,
};

export const DefaultCollapsed: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <CollapsibleSectionShowcase section="collapsed" />,
};

export const WithBadge: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <CollapsibleSectionShowcase section="badge" />,
};

export const WithFooter: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <CollapsibleSectionShowcase section="footer" />,
};

export const WithHeaderAccessory: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <CollapsibleSectionShowcase section="accessory" />,
};

export const LongTitle: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <CollapsibleSectionShowcase section="longTitle" />,
};

function ControlledStory() {
  const [expanded, setExpanded] = useState(true);

  return (
    <CollapsibleSection
      title="CONTROLLED SECTION"
      expanded={expanded}
      onExpandedChange={setExpanded}
      footer={
        <PrimaryButton
          fullWidth
          variant="outline"
          onPress={() => setExpanded((value) => !value)}
        >
          Toggle from footer
        </PrimaryButton>
      }
    >
      <View style={storyStyles.content}>
        <Text style={storyStyles.bodyText}>
          Expanded: {expanded ? "true" : "false"}
        </Text>
      </View>
    </CollapsibleSection>
  );
}

export const Controlled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <ControlledStory />,
};

export const Disabled: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <CollapsibleSectionShowcase section="disabled" />,
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
  content: {
    gap: 8,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: collapsibleSectionTokens.colors.title,
  },
});
