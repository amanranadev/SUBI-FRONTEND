import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  SegmentedController,
  segmentedControllerTokens,
} from "../../../components/SegmentedController";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type SegmentedControllerShowcaseSection =
  | "all"
  | "figma"
  | "counts"
  | "sizes"
  | "width"
  | "states";

export interface SegmentedControllerShowcaseProps {
  section?: SegmentedControllerShowcaseSection;
}

const taskOptions = [
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
] as const;

const viewOptions = [
  { value: "list", label: "List" },
  { value: "grid", label: "Grid" },
  { value: "map", label: "Map" },
] as const;

export function SegmentedControllerShowcase({
  section = "all",
}: SegmentedControllerShowcaseProps) {
  const show = (key: Exclude<SegmentedControllerShowcaseSection, "all">) =>
    section === "all" || section === key;
  const [taskValue, setTaskValue] = useState("active");
  const [countValue, setCountValue] = useState("all");
  const [viewValue, setViewValue] = useState("list");
  const [widthValue, setWidthValue] = useState("active");

  return (
    <GalleryScreen>
      {show("figma") ? (
        <GallerySection
          title="1. Figma Tasks Segment"
          description="38px pill controller from the Tasks mobile screen."
        >
          <GalleryItem label="Active / Completed" wide>
            <View style={styles.figmaWidth}>
              <SegmentedController
                options={taskOptions}
                value={taskValue}
                onValueChange={setTaskValue}
              />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("counts") ? (
        <GallerySection
          title="2. Three Segments"
          description="Use for small sibling modes, not long navigation."
        >
          <GalleryItem label="Task buckets" wide>
            <SegmentedController
              options={[
                { value: "all", label: "All" },
                { value: "due", label: "Due Soon" },
                { value: "done", label: "Done" },
              ]}
              value={countValue}
              onValueChange={setCountValue}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection title="3. Sizes" description="Medium matches the Figma controller.">
          <GalleryItem label="Small">
            <SegmentedController
              options={taskOptions}
              value="active"
              size="sm"
            />
          </GalleryItem>
          <GalleryItem label="Medium">
            <SegmentedController options={taskOptions} value="active" />
          </GalleryItem>
          <GalleryItem label="Large">
            <SegmentedController
              options={taskOptions}
              value="active"
              size="lg"
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("width") ? (
        <GallerySection
          title="4. Width"
          description="Inline matches Figma; fullWidth gives equal columns inside cards or sheets."
        >
          <GalleryItem label="Inline" wide>
            <SegmentedController
              options={taskOptions}
              value={widthValue}
              onValueChange={setWidthValue}
            />
          </GalleryItem>
          <GalleryItem label="Full width" wide>
            <SegmentedController
              options={taskOptions}
              value={widthValue}
              onValueChange={setWidthValue}
              fullWidth
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("states") ? (
        <GallerySection title="5. States" description="Disabled controller and disabled item examples.">
          <GalleryItem label="With icons" wide>
            <SegmentedController
              options={[
                {
                  value: "list",
                  label: "List",
                  icon: (
                    <Ionicons
                      name="list-outline"
                      size={13}
                      color={segmentedControllerTokens.colors.textPrimary}
                    />
                  ),
                },
                {
                  value: "grid",
                  label: "Grid",
                  icon: (
                    <Ionicons
                      name="grid-outline"
                      size={13}
                      color={segmentedControllerTokens.colors.textMuted}
                    />
                  ),
                },
                { value: "map", label: "Map", disabled: true },
              ]}
              value={viewValue}
              onValueChange={setViewValue}
            />
          </GalleryItem>
          <GalleryItem label="Disabled">
            <SegmentedController
              options={viewOptions}
              value="list"
              disabled
            />
          </GalleryItem>
          <GalleryItem label="Rounded">
            <SegmentedController
              options={taskOptions}
              value="completed"
              variant="rounded"
            />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  figmaWidth: {
    width: 225,
  },
});
