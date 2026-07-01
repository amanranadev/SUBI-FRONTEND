import type { DATE_BADGE_SIZES, DATE_BADGE_VARIANTS } from "./tokens";

export type DateBadgeSize = (typeof DATE_BADGE_SIZES)[number];
export type DateBadgeVariant = (typeof DATE_BADGE_VARIANTS)[number];

export interface DateBadgeProps {
  date: Date;
  size?: DateBadgeSize;
  variant?: DateBadgeVariant;
  disabled?: boolean;
  highlightToday?: boolean;
  locale?: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  testID?: string;
}
