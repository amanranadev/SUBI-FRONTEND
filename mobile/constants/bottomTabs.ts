import type { BottomTabBarItem } from "@/components/BottomTabBar";

export type AppTabValue = "home" | "transactions" | "calendar" | "tasks";

export const APP_BOTTOM_TABS: BottomTabBarItem<AppTabValue>[] = [
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
    disabled: true,
  },
  {
    value: "calendar",
    label: "Calendar",
    iconName: "calendar-outline",
    activeIconName: "calendar",
    disabled: true,
  },
  {
    value: "tasks",
    label: "Tasks",
    iconName: "checkbox-outline",
    activeIconName: "checkbox",
    disabled: true,
  },
];
