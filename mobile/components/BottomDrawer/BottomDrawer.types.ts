import type { ReactNode } from "react";

export type BottomDrawerSize = "content" | "sm" | "md" | "lg" | "full";

export type FooterBehavior = "sticky" | "scroll";

export interface BottomDrawerProps {
  open: boolean;
  size?: BottomDrawerSize;
  children: ReactNode;
  footer?: ReactNode;
  footerBehavior?: FooterBehavior;
  backgroundColor?: string;
  onClose?: () => void;
  testID?: string;
}
