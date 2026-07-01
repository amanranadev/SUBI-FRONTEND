import React, { useState } from "react";

import { BottomTabBar } from "../../../components/BottomTabBar";
import {
  DocCodeBlock,
  DocGalleryGrid,
  DocGalleryItem,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import {
  BOTTOM_TAB_BAR_DOCS_DESCRIPTION,
  BOTTOM_TAB_BAR_PROP_DEFINITIONS,
} from "./bottomTabBarArgTypes";
import {
  BottomTabBarShowcase,
  DEFAULT_BOTTOM_TABS,
} from "./BottomTabBarShowcase";

const USAGE_BASIC = `<BottomTabBar
  items={tabs}
  value={currentTab}
  onValueChange={setCurrentTab}
/>`;

const USAGE_ITEM = `const tabs = [
  { value: "home", label: "Home", iconName: "home-outline" },
  { value: "tasks", label: "Tasks", iconName: "checkbox-outline" },
];`;

const USAGE_BADGE = `<BottomTabBar
  items={[{ value: "tasks", label: "Tasks", iconName: "checkbox-outline", badge: 3 }]}
  value="tasks"
/>`;

export function BottomTabBarDocsPage() {
  const [value, setValue] = useState("tasks");

  return (
    <DocScreen>
      <DocTitle>BottomTabBar</DocTitle>
      <DocSubtitle>{BOTTOM_TAB_BAR_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview preview">
        <DocParagraph>
          Use this as the visual bottom navigation primitive. Connect it to
          Expo Router or React Navigation in app screens later.
        </DocParagraph>
        <DocPreviewCard label="Figma tasks active">
          <BottomTabBar
            items={DEFAULT_BOTTOM_TABS}
            value={value}
            onValueChange={setValue}
          />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...BOTTOM_TAB_BAR_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage examples">
        <DocCodeBlock code={USAGE_BASIC} />
        <DocCodeBlock code={USAGE_ITEM} />
        <DocCodeBlock code={USAGE_BADGE} />
        <DocGalleryGrid>
          <DocGalleryItem label="Home active">
            <BottomTabBar items={DEFAULT_BOTTOM_TABS} value="home" />
          </DocGalleryItem>
          <DocGalleryItem label="Tasks active">
            <BottomTabBar items={DEFAULT_BOTTOM_TABS} value="tasks" />
          </DocGalleryItem>
          <DocGalleryItem label="Badge">
            <BottomTabBar
              items={[
                ...DEFAULT_BOTTOM_TABS.slice(0, 3),
                { ...DEFAULT_BOTTOM_TABS[3], badge: 3 },
              ]}
              value="tasks"
            />
          </DocGalleryItem>
        </DocGalleryGrid>
      </DocSection>

      <DocSection title="Component gallery">
        <DocParagraph>
          Examples grouped by Figma reference, active tab, states, and sizes.
        </DocParagraph>
        <BottomTabBarShowcase />
      </DocSection>
    </DocScreen>
  );
}
