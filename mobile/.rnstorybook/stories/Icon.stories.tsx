import type { Meta, StoryObj } from "@storybook/react-native";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  Icon,
} from "../../assets/icon-system/Icon";
import { colors } from "../../constants/colors";
import { DEFAULT_ICON_COLOR, DEFAULT_ICON_SIZE } from "../../assets/icon-system/types";
import { ICON_NAMES, type IconName } from "../../assets/icon-system/registry";

const SIZE_SAMPLES = [16, 20, 24, 32, 48] as const;

const COLOR_SAMPLES = [
  { label: "Default", value: DEFAULT_ICON_COLOR },
  { label: "Primary", value: colors.primary[400] },
  { label: "Muted", value: colors.gray[600] },
  { label: "Destructive", value: colors.red[500] },
  { label: "Accent", value: colors.accentBlue },
] as const;

const meta = {
  title: "Design System/Icon",
  component: Icon,
  decorators: [
    (Story) => (
      <View style={styles.decorator}>
        <Story />
      </View>
    ),
  ],
  args: {
    name: "search" satisfies IconName,
    size: DEFAULT_ICON_SIZE,
    color: DEFAULT_ICON_COLOR,
    accessible: true,
    accessibilityLabel: undefined,
  },
  argTypes: {
    name: {
      control: "select",
      options: ICON_NAMES,
    },
    size: {
      control: { type: "number", min: 8, max: 64, step: 1 },
    },
    color: {
      control: "color",
    },
    accessible: {
      control: "boolean",
    },
    accessibilityLabel: {
      control: "text",
    },
  },
} satisfies Meta<typeof Icon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "search",
    size: DEFAULT_ICON_SIZE,
    color: DEFAULT_ICON_COLOR,
  },
};

export const Sizes: Story = {
  render: () => (
    <View style={styles.row}>
      {SIZE_SAMPLES.map((size) => (
        <View key={size} style={styles.sizeCell}>
          <Icon name="search" size={size} color={colors.gray[800]} />
          <Text style={styles.caption}>{size}</Text>
        </View>
      ))}
    </View>
  ),
};

export const Colors: Story = {
  render: () => (
    <View style={styles.rowWrap}>
      {COLOR_SAMPLES.map(({ label, value }) => (
        <View key={label} style={styles.colorCell}>
          <Icon name="star" size={28} color={value} />
          <Text style={styles.caption}>{label}</Text>
        </View>
      ))}
    </View>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <ScrollView contentContainerStyle={styles.gallery}>
      {ICON_NAMES.map((iconName) => (
        <View key={iconName} style={styles.galleryCell}>
          <Icon
            name={iconName}
            size={28}
            color={iconName === "trash" ? colors.red[500] : colors.gray[800]}
          />
          <Text style={styles.galleryLabel}>{iconName}</Text>
        </View>
      ))}
    </ScrollView>
  ),
};

const GALLERY_CELL_WIDTH = 96;

const styles = StyleSheet.create({
  decorator: {
    flex: 1,
    padding: 16,
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 20,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 24,
  },
  sizeCell: {
    alignItems: "center",
    gap: 8,
  },
  colorCell: {
    alignItems: "center",
    gap: 8,
    minWidth: 72,
  },
  caption: {
    fontSize: 12,
    color: colors.gray[600],
  },
  gallery: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    paddingBottom: 24,
  },
  galleryCell: {
    width: GALLERY_CELL_WIDTH,
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: colors.gray[50],
  },
  galleryLabel: {
    fontSize: 11,
    color: colors.gray[700],
    textAlign: "center",
  },
});
