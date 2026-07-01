import type { Meta, StoryObj } from "@storybook/react-native";
import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  createAllDoneState,
  createDefaultTransactionResultState,
  createLongDataState,
  createMultipleBuyersState,
  TransactionResultDrawer,
  type TransactionResultDrawerProps,
} from "@/components/TransactionResultDrawer";

function TransactionResultDrawerStoryShell({
  initialOpen = false,
  initialState,
  ...drawerProps
}: Omit<TransactionResultDrawerProps, "open" | "onClose"> & {
  initialOpen?: boolean;
}) {
  const [open, setOpen] = useState(initialOpen);
  const [seedState] = useState(
    () => initialState ?? createDefaultTransactionResultState(),
  );

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <View style={storyStyles.screen}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open transaction result drawer"
        onPress={handleOpen}
        style={storyStyles.trigger}
      >
        <Text style={storyStyles.triggerText}>Open Transaction Result</Text>
      </Pressable>
      <TransactionResultDrawer
        {...drawerProps}
        open={open}
        onClose={handleClose}
        initialState={seedState}
      />
    </View>
  );
}

const meta = {
  title: "Design System/TransactionResultDrawer",
  component: TransactionResultDrawer,
  parameters: {
    notes: "Drawer for reviewing AI-extracted transaction data.",
  },
  decorators: [
    (Story: React.ComponentType) => (
      <View style={storyStyles.decorator}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TransactionResultDrawer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <TransactionResultDrawerStoryShell
      initialState={createDefaultTransactionResultState()}
    />
  ),
};

export const AllNeedsReview: Story = {
  render: () => (
    <TransactionResultDrawerStoryShell
      initialState={createDefaultTransactionResultState()}
    />
  ),
};

export const AllDone: Story = {
  render: () => (
    <TransactionResultDrawerStoryShell initialState={createAllDoneState()} />
  ),
};

export const MultipleBuyers: Story = {
  render: () => (
    <TransactionResultDrawerStoryShell
      initialState={createMultipleBuyersState()}
    />
  ),
};

export const LongData: Story = {
  render: () => (
    <TransactionResultDrawerStoryShell initialState={createLongDataState()} />
  ),
};

const storyStyles = StyleSheet.create({
  decorator: {
    flex: 1,
    minHeight: 640,
    backgroundColor: "#FFFFFF",
  },
  screen: {
    flex: 1,
    minHeight: 640,
    backgroundColor: "#FFFFFF",
    padding: 16,
    justifyContent: "center",
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
});
