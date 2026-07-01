import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";

export interface CollapsibleSectionProps {
  title: string;
  children: ReactNode;
  badge?: ReactNode;
  headerAccessory?: ReactNode;
  footer?: ReactNode;
  footerStyle?: StyleProp<ViewStyle>;
  expanded?: boolean;
  defaultExpanded?: boolean;
  disabled?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  testID?: string;
}
