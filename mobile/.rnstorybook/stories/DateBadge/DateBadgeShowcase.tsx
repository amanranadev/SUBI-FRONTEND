import { addDays } from "date-fns";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { DateBadge } from "../../../components/DateBadge";

import {
  GalleryFullWidthRow,
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const SAMPLE_DATE = new Date("2026-04-10");
const WEEK_START = new Date("2026-04-08");
const SELECTED_DATE = new Date("2026-04-10");

export type DateBadgeShowcaseSection =
  | "all"
  | "variants"
  | "sizes"
  | "today"
  | "disabled"
  | "interactive"
  | "calendar";

export interface DateBadgeShowcaseProps {
  section?: DateBadgeShowcaseSection;
}


function CalendarStripDemo() {
  const days = Array.from({ length: 5 }, (_, index) =>
    addDays(WEEK_START, index),
  );

  return (
    <GalleryFullWidthRow>
      {days.map((day) => {
        const isSelected = day.toDateString() === SELECTED_DATE.toDateString();
        return (
          <DateBadge
            key={day.toISOString()}
            date={day}
            variant={isSelected ? "selected" : "default"}
            onPress={() => {}}
          />
        );
      })}
    </GalleryFullWidthRow>
  );
}

export function DateBadgeShowcase({
  section = "all",
}: DateBadgeShowcaseProps) {
  const show = (key: Exclude<DateBadgeShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("variants") ? (
        <GallerySection
          title="1. Variants"
          description="Default, selected, and muted visual states."
        >
          <GalleryItem label="Default">
            <DateBadge date={SAMPLE_DATE} />
          </GalleryItem>
          <GalleryItem label="Selected">
            <DateBadge date={SAMPLE_DATE} variant="selected" />
          </GalleryItem>
          <GalleryItem label="Muted">
            <DateBadge date={SAMPLE_DATE} variant="muted" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection
          title="2. Sizes"
          description="Token-driven sm, md (Figma), and lg."
        >
          <GalleryItem label="Small">
            <DateBadge date={SAMPLE_DATE} size="sm" />
          </GalleryItem>
          <GalleryItem label="Medium">
            <DateBadge date={SAMPLE_DATE} size="md" />
          </GalleryItem>
          <GalleryItem label="Large">
            <DateBadge date={SAMPLE_DATE} size="lg" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("disabled") ? (
        <GallerySection
          title="3. Disabled"
          description="Reduced emphasis — press is blocked when onPress is set."
        >
          <GalleryItem label="Default">
            <DateBadge date={SAMPLE_DATE} disabled />
          </GalleryItem>
          <GalleryItem label="Selected">
            <DateBadge date={SAMPLE_DATE} variant="selected" disabled />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("calendar") ? (
        <GallerySection
          title="4. Calendar strip"
          description="Typical scheduling context — one selected day in a horizontal row."
        >
          <GalleryItem label="Week picker" wide>
            <CalendarStripDemo />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const showcaseStyles = StyleSheet.create({
  interactiveBlock: {
    gap: 12,
    alignItems: "flex-start",
    width: "100%",
  },
  interactiveHint: {
    fontSize: 13,
    lineHeight: 18,
    color: "#6B6B6B",
  },
});
