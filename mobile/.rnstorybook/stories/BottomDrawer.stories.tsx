import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  BottomDrawer,
  bottomDrawerTokens,
  type BottomDrawerSize,
} from "../../components/BottomDrawer";
import { PrimaryButton } from "../../components/PrimaryButton";

import {
  BOTTOM_DRAWER_DOCS_DESCRIPTION,
  bottomDrawerArgTypes,
} from "./BottomDrawer/bottomDrawerArgTypes";
import { BottomDrawerDocsPage } from "./BottomDrawer/BottomDrawerDocsPage";
import {
  BottomDrawerDemoFooter,
  BottomDrawerStoryShell,
} from "./BottomDrawer/BottomDrawerStoryShell";

const LONG_CONTENT_LINES = Array.from(
  { length: 24 },
  (_, index) =>
    `Line ${index + 1}: Scrollable drawer content that demonstrates automatic scrolling when the body exceeds the available height.`,
);

function DemoBody({
  title,
  lines = [
    "Use children for titles, descriptions, forms, and lists.",
    "BottomDrawer only owns presentation, backdrop, and layout.",
  ],
}: {
  title: string;
  lines?: string[];
}) {
  return (
    <View style={storyStyles.body}>
      <Text style={storyStyles.title}>{title}</Text>
      {lines.map((line) => (
        <Text key={line} style={storyStyles.paragraph}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const meta = {
  title: "Design System/BottomDrawer",
  component: BottomDrawer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: BOTTOM_DRAWER_DOCS_DESCRIPTION,
      },
    },
    notes: `
# BottomDrawer

${BOTTOM_DRAWER_DOCS_DESCRIPTION}

Requires \`GestureHandlerRootView\` and \`BottomSheetModalProvider\` in the app tree.
    `.trim(),
  },
  decorators: [
    (Story, context) => {
      if (context.parameters.docsPage) {
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
    open: false,
    size: "content",
    footerBehavior: "sticky",
  },
  argTypes: bottomDrawerArgTypes,
} satisfies Meta<typeof BottomDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full BottomDrawer documentation with props, size mapping, and playground.",
    controls: { disable: true },
  },
  render: () => <BottomDrawerDocsPage />,
};

export const Playground: Story = {
  render: (args) => {
    const [open, setOpen] = useState(args.open);

    useEffect(() => {
      setOpen(args.open);
    }, [args.open]);

    const handleClose = useCallback(() => {
      setOpen(false);
      args.onClose?.();
    }, [args]);

    return (
      <View style={storyStyles.decorator}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open drawer"
          onPress={() => setOpen(true)}
          style={storyStyles.trigger}
        >
          <Text style={storyStyles.triggerText}>Open drawer</Text>
        </Pressable>
        <BottomDrawer
          {...args}
          open={open}
          onClose={handleClose}
          footer={<BottomDrawerDemoFooter />}
        >
          <DemoBody title="Playground drawer" />
        </BottomDrawer>
      </View>
    );
  },
};

function createSizeStory(size: BottomDrawerSize, title: string): Story {
  return {
    parameters: { galleryPage: true, controls: { disable: true } },
    render: () => (
      <BottomDrawerStoryShell
        size={size}
        footer={<BottomDrawerDemoFooter label="Confirm" />}
      >
        <DemoBody title={title} />
      </BottomDrawerStoryShell>
    ),
  };
}

export const ContentHeight: Story = createSizeStory(
  "content",
  "Content-sized drawer",
);

export const Small: Story = createSizeStory("sm", "Small drawer (30%)");

export const Medium: Story = createSizeStory("md", "Medium drawer (50%)");

export const Large: Story = createSizeStory("lg", "Large drawer (80%)");

export const Full: Story = createSizeStory("full", "Full drawer (95%)");

export const StickyFooter: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <BottomDrawerStoryShell
      size="md"
      footerBehavior="sticky"
      footer={<BottomDrawerDemoFooter label="Sticky action" />}
    >
      <DemoBody
        title="Sticky footer"
        lines={LONG_CONTENT_LINES.slice(0, 8)}
      />
    </BottomDrawerStoryShell>
  ),
};

export const ScrollFooter: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <BottomDrawerStoryShell
      size="md"
      footerBehavior="scroll"
      footer={<BottomDrawerDemoFooter label="Scroll footer action" />}
    >
      <DemoBody
        title="Scroll footer"
        lines={LONG_CONTENT_LINES.slice(0, 8)}
      />
    </BottomDrawerStoryShell>
  ),
};

export const LongContent: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => (
    <BottomDrawerStoryShell
      size="lg"
      footerBehavior="sticky"
      footer={<BottomDrawerDemoFooter label="Done" />}
    >
      <DemoBody title="Long content" lines={LONG_CONTENT_LINES} />
    </BottomDrawerStoryShell>
  ),
};

function FormExampleStory() {
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");

  return (
    <BottomDrawerStoryShell
      size="lg"
      footerBehavior="sticky"
      footer={<BottomDrawerDemoFooter label="Save" />}
    >
      <View style={storyStyles.form}>
        <Text style={storyStyles.title}>Keyboard form</Text>
        <Text style={storyStyles.label}>NAME</Text>
        <BottomSheetTextInput
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
          style={storyStyles.input}
          accessibilityLabel="Name"
        />
        <Text style={storyStyles.label}>NOTES</Text>
        <BottomSheetTextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Add notes"
          multiline
          style={[storyStyles.input, storyStyles.multilineInput]}
          accessibilityLabel="Notes"
        />
      </View>
    </BottomDrawerStoryShell>
  );
}

export const FormExample: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <FormExampleStory />,
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
    minHeight: 480,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    padding: 16,
  },
  trigger: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#F5821E",
  },
  triggerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  body: {
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: bottomDrawerTokens.colors.backdrop,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: bottomDrawerTokens.colors.backdrop,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    color: bottomDrawerTokens.colors.backdrop,
  },
  input: {
    borderWidth: 1,
    borderColor: "#DBD4D1",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: bottomDrawerTokens.colors.backdrop,
    backgroundColor: "#FFFFFF",
  },
  multilineInput: {
    minHeight: 96,
    textAlignVertical: "top",
  },
});
