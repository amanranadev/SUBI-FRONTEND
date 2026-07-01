import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  BottomTabBar,
  type BottomTabBarItem,
} from "../../../components/BottomTabBar";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type BottomTabBarShowcaseSection =
  | "all"
  | "figma"
  | "active"
  | "states"
  | "sizes";

export interface BottomTabBarShowcaseProps {
  section?: BottomTabBarShowcaseSection;
}

export const DEFAULT_BOTTOM_TABS = [
  {
    value: "home",
    label: "Home",
    iconName: "home-outline",
    activeIconName: "home",
  },
  {
    value: "transactions",
    label: "Transactions",
    iconName: "card-outline",
    activeIconName: "card",
  },
  {
    value: "calendar",
    label: "Calendar",
    iconName: "calendar-outline",
    activeIconName: "calendar",
  },
  {
    value: "tasks",
    label: "Tasks",
    iconName: "checkbox-outline",
    activeIconName: "checkbox",
  },
] as const satisfies BottomTabBarItem[];

export function BottomTabBarShowcase({
  section = "all",
}: BottomTabBarShowcaseProps) {
  const show = (key: Exclude<BottomTabBarShowcaseSection, "all">) =>
    section === "all" || section === key;
  const [value, setValue] = useState("tasks");
  const [stateValue, setStateValue] = useState("home");

  return (
    <GalleryScreen>
      {show("figma") ? (
        <GallerySection
          title="1. Figma Bottom Tab Bar"
          description="Four-tab mobile navigation with Tasks active."
        >
          <GalleryItem label="Tasks active" wide>
            <View style={styles.phoneWidth}>
              <BottomTabBar
                items={DEFAULT_BOTTOM_TABS}
                value={value}
                onValueChange={setValue}
              />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("active") ? (
        <GallerySection title="2. Active Tab" description="Each tab can own the active peach icon pill.">
          <GalleryItem label="Home" wide>
            <BottomTabBar items={DEFAULT_BOTTOM_TABS} value="home" />
          </GalleryItem>
          <GalleryItem label="Transactions" wide>
            <BottomTabBar items={DEFAULT_BOTTOM_TABS} value="transactions" />
          </GalleryItem>
          <GalleryItem label="Calendar" wide>
            <BottomTabBar items={DEFAULT_BOTTOM_TABS} value="calendar" />
          </GalleryItem>
          <GalleryItem label="Tasks" wide>
            <BottomTabBar items={DEFAULT_BOTTOM_TABS} value="tasks" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("states") ? (
        <GallerySection title="3. States" description="Badges, disabled tabs, labels, and home indicator options.">
          <GalleryItem label="Badge" wide>
            <BottomTabBar
              items={[
                ...DEFAULT_BOTTOM_TABS.slice(0, 3),
                { ...DEFAULT_BOTTOM_TABS[3], badge: 3 },
              ]}
              value="tasks"
            />
          </GalleryItem>
          <GalleryItem label="Disabled item" wide>
            <BottomTabBar
              items={[
                DEFAULT_BOTTOM_TABS[0],
                { ...DEFAULT_BOTTOM_TABS[1], disabled: true },
                DEFAULT_BOTTOM_TABS[2],
                DEFAULT_BOTTOM_TABS[3],
              ]}
              value={stateValue}
              onValueChange={setStateValue}
            />
          </GalleryItem>
          <GalleryItem label="Icon only" wide>
            <BottomTabBar
              items={DEFAULT_BOTTOM_TABS}
              value="calendar"
              showLabels={false}
              showHomeIndicator={false}
            />
          </GalleryItem>
          <GalleryItem label="Disabled bar" wide>
            <BottomTabBar
              items={DEFAULT_BOTTOM_TABS}
              value="home"
              disabled
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection title="4. Sizes" description="Medium matches the Figma mobile tab bar.">
          <GalleryItem label="Medium" wide>
            <BottomTabBar items={DEFAULT_BOTTOM_TABS} value="tasks" />
          </GalleryItem>
          <GalleryItem label="Compact" wide>
            <BottomTabBar
              items={DEFAULT_BOTTOM_TABS}
              value="tasks"
              size="compact"
            />
          </GalleryItem>
          <GalleryItem label="No elevation" wide>
            <BottomTabBar
              items={DEFAULT_BOTTOM_TABS}
              value="tasks"
              elevated={false}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  phoneWidth: {
    width: "100%",
    maxWidth: 393,
  },
});
