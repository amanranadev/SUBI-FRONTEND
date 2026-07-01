import React, { useState } from "react";

import { ItemListEditor } from "@/components/ItemListEditor";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const DEFAULT_ITEMS = ["Microwave", "Refrigerator"] as const;

const LONG_ITEMS = [
  "Built-in double oven with convection and self-cleaning mode",
  "Energy Star certified side-by-side refrigerator with ice maker",
] as const;

function ControlledItemListEditor({
  initialItems = [] as string[],
  disabled = false,
  maxItems,
  helperText,
  emptyStateText,
}: {
  initialItems?: string[];
  disabled?: boolean;
  maxItems?: number;
  helperText?: string;
  emptyStateText?: string;
}) {
  const [items, setItems] = useState(initialItems);

  return (
    <ItemListEditor
      items={items}
      onChange={setItems}
      helperText={helperText}
      maxItems={maxItems}
      disabled={disabled}
      emptyStateText={emptyStateText}
    />
  );
}

export type ItemListEditorShowcaseSection =
  | "all"
  | "empty"
  | "withItems"
  | "disabled"
  | "maxItems"
  | "longValues"
  | "duplicatePrevention";

export function ItemListEditorShowcase({
  section = "all",
}: {
  section?: ItemListEditorShowcaseSection;
}) {
  const show = (name: ItemListEditorShowcaseSection) =>
    section === "all" || section === name;

  return (
    <GalleryScreen>
      {show("empty") ? (
        <GallerySection title="Empty state">
          <GalleryItem label="No items" wide>
            <ControlledItemListEditor />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("withItems") ? (
        <GallerySection title="With items">
          <GalleryItem label="Multiple items" wide>
            <ControlledItemListEditor initialItems={[...DEFAULT_ITEMS]} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("disabled") ? (
        <GallerySection title="Disabled">
          <GalleryItem label="Read-only" wide>
            <ControlledItemListEditor
              initialItems={[...DEFAULT_ITEMS]}
              disabled
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("maxItems") ? (
        <GallerySection title="Max items reached">
          <GalleryItem label="Add disabled at limit" wide>
            <ControlledItemListEditor
              initialItems={[...DEFAULT_ITEMS]}
              maxItems={2}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("longValues") ? (
        <GallerySection title="Long values">
          <GalleryItem label="Text wrapping" wide>
            <ControlledItemListEditor initialItems={[...LONG_ITEMS]} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("duplicatePrevention") ? (
        <GallerySection title="Duplicate prevention">
          <GalleryItem
            label="Try adding Microwave again (case-insensitive)"
            wide
          >
            <ControlledItemListEditor initialItems={["Microwave"]} />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}
