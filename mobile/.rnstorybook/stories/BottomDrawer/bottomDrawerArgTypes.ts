import type { Meta } from "@storybook/react-native";

import { BottomDrawer } from "../../../components/BottomDrawer";

export const BOTTOM_DRAWER_DOCS_DESCRIPTION =
  "A presentation-only bottom drawer primitive built on @gorhom/bottom-sheet. It handles backdrop, animation, safe area, keyboard behavior, scrolling, and footer layout. Business content is always passed through children and footer.";

export const BOTTOM_DRAWER_PROP_DEFINITIONS = [
  {
    name: "open",
    type: "boolean",
    defaultValue: "required",
    description: "Controls whether the drawer is presented.",
    required: true,
  },
  {
    name: "size",
    type: '"content" | "sm" | "md" | "lg" | "full"',
    defaultValue: '"content"',
    description:
      "Maps to internal snap points. content uses dynamic sizing; sm/md/lg/full map to 30%/50%/80%/95%.",
  },
  {
    name: "children",
    type: "React.ReactNode",
    defaultValue: "required",
    description: "Scrollable drawer body content.",
    required: true,
  },
  {
    name: "footer",
    type: "React.ReactNode",
    defaultValue: "undefined",
    description: "Optional footer rendered sticky or inside the scroll area.",
  },
  {
    name: "footerBehavior",
    type: '"sticky" | "scroll"',
    defaultValue: '"sticky"',
    description:
      "sticky keeps the footer visible while content scrolls; scroll places the footer after the body in the scroll view.",
  },
  {
    name: "onClose",
    type: "() => void",
    defaultValue: "undefined",
    description:
      "Called when the drawer is dismissed via backdrop press or swipe down. Parent should set open to false.",
  },
  {
    name: "testID",
    type: "string",
    defaultValue: "undefined",
    description: "Test identifier for the bottom sheet modal.",
  },
] as const;

export const bottomDrawerArgTypes: Meta<typeof BottomDrawer>["argTypes"] = {
  open: {
    control: "boolean",
  },
  size: {
    control: "select",
    options: ["content", "sm", "md", "lg", "full"],
  },
  footerBehavior: {
    control: "select",
    options: ["sticky", "scroll"],
  },
  onClose: {
    action: "close",
  },
  testID: {
    control: "text",
  },
};
