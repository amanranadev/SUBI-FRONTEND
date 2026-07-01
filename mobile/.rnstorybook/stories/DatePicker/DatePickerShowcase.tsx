import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { DatePicker } from "../../../components/DatePicker";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const SAMPLE_DATE = new Date("2026-04-09");
const MIN_DATE = new Date("2026-01-01");
const MAX_DATE = new Date("2026-12-31");

export type DatePickerShowcaseSection =
  | "all"
  | "default"
  | "constraints"
  | "formats"
  | "disabled"
  | "interactive";

export interface DatePickerShowcaseProps {
  section?: DatePickerShowcaseSection;
}

function InteractivePickerDemo() {
  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
    <View style={showcaseStyles.interactiveBlock}>
      <DatePicker value={date} onChange={setDate} />
      <Text style={showcaseStyles.interactiveHint}>
        {date
          ? `Selected: ${date.toISOString().slice(0, 10)}`
          : "Tap the chip to open the calendar and pick a date."}
      </Text>
    </View>
  );
}

export function DatePickerShowcase({
  section = "all",
}: DatePickerShowcaseProps) {
  const show = (key: Exclude<DatePickerShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("default") ? (
        <GallerySection
          title="1. Default states"
          description="Empty placeholder, pre-selected value, and custom placeholder copy."
        >
          <GalleryItem label="Empty">
            <DatePicker />
          </GalleryItem>
          <GalleryItem label="Selected">
            <DatePicker value={SAMPLE_DATE} />
          </GalleryItem>
          <GalleryItem label="Custom placeholder">
            <DatePicker placeholder="Choose a date" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("constraints") ? (
        <GallerySection
          title="2. Date constraints"
          description="Restrict selectable dates with minDate and maxDate."
        >
          <GalleryItem label="Jan–Dec 2026">
            <DatePicker
              value={SAMPLE_DATE}
              minDate={MIN_DATE}
              maxDate={MAX_DATE}
            />
          </GalleryItem>
          <GalleryItem label="Future only">
            <DatePicker minDate={new Date("2026-06-01")} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("formats") ? (
        <GallerySection
          title="3. Format strings"
          description="Display format is driven by the date-fns format prop."
        >
          <GalleryItem label="dd-MMM-yyyy">
            <DatePicker value={SAMPLE_DATE} format="dd-MMM-yyyy" />
          </GalleryItem>
          <GalleryItem label="MMM d, yyyy">
            <DatePicker value={SAMPLE_DATE} format="MMM d, yyyy" />
          </GalleryItem>
          <GalleryItem label="yyyy-MM-dd">
            <DatePicker value={SAMPLE_DATE} format="yyyy-MM-dd" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("disabled") ? (
        <GallerySection
          title="4. Disabled"
          description="Non-interactive chip — calendar cannot be opened."
        >
          <GalleryItem label="Empty">
            <DatePicker disabled />
          </GalleryItem>
          <GalleryItem label="With value">
            <DatePicker disabled value={SAMPLE_DATE} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("interactive") ? (
        <GallerySection
          title="5. Interactive"
          description="Controlled usage — value and onChange wired to parent state."
        >
          <GalleryItem label="Controlled picker" wide>
            <InteractivePickerDemo />
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
