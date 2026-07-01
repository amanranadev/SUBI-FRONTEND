import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { TaskCard } from "@/components/TaskCard";

import {
  TASK_CARD_DOCS_DESCRIPTION,
  taskCardArgTypes,
} from "./TaskCard/taskCardArgTypes";
import { TaskCardDocsPage } from "./TaskCard/TaskCardDocsPage";
import { TaskCardShowcase } from "./TaskCard/TaskCardShowcase";

const SAMPLE_DATE = new Date(2026, 5, 15);

const LONG_TASK_NAME =
  "Coordinate earnest money delivery with title company and confirm receipt before closing deadline";

function PlaygroundTaskCard(
  args: React.ComponentProps<typeof TaskCard>,
) {
  const [dueDate, setDueDate] = useState<Date | null | undefined>(args.dueDate);

  return (
    <TaskCard
      {...args}
      dueDate={dueDate}
      onDateChange={
        args.onDateChange
          ? (date) => {
              setDueDate(date);
              args.onDateChange?.(date);
            }
          : undefined
      }
    />
  );
}

const meta = {
  title: "Design System/TaskCard",
  component: TaskCard,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component: TASK_CARD_DOCS_DESCRIPTION,
      },
    },
    notes: `
# TaskCard

${TASK_CARD_DOCS_DESCRIPTION}
    `.trim(),
  },
  decorators: [
    (Story: React.ComponentType, context) => {
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
    transactionName: "345 Diagon Alley - New",
    taskName: "Earnest Money Delivery",
    dueDate: SAMPLE_DATE,
    status: "pending",
    disabled: false,
  },
  argTypes: taskCardArgTypes,
} satisfies Meta<typeof TaskCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Documentation: Story = {
  tags: ["autodocs"],
  parameters: {
    docsPage: true,
    notes: "Full TaskCard documentation with props and examples.",
    controls: { disable: true },
  },
  render: () => <TaskCardDocsPage />,
};

export const Playground: Story = {
  render: (args) => <PlaygroundTaskCard {...args} />,
};

export const PendingTask: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <TaskCardShowcase section="pending" />,
};

export const DoneTask: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <TaskCardShowcase section="done" />,
};

export const SkippedTask: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <TaskCardShowcase section="skipped" />,
};

export const WithDate: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <TaskCardShowcase section="withDate" />,
};

export const WithoutDate: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <TaskCardShowcase section="withoutDate" />,
};

export const LongTaskName: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <TaskCardShowcase section="longTaskName" />,
};

export const MultipleCards: Story = {
  parameters: { galleryPage: true, controls: { disable: true } },
  render: () => <TaskCardShowcase section="multipleCards" />,
};

const storyStyles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    flexGrow: 1,
  },
  decorator: {
    flex: 1,
    minHeight: 640,
    backgroundColor: "#FFFFFF",
    padding: 16,
    justifyContent: "flex-start",
  },
});
