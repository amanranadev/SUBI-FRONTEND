import type { ReactNode } from "react";

export interface ActionCardProps {
  title: string;
  description?: string;
  icon: ReactNode;
  onPress?: () => void;
  selected?: boolean;
  disabled?: boolean;
  testID?: string;
}
