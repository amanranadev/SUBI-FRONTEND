import { buttonTokens } from "../PrimaryButton/tokens";
import { FONT_FAMILY } from "@subi/config";

const { colors, typography: buttonTypography, radius, spacing } = buttonTokens;

export const taskCardColors = {
  background: colors.surfaceCard,
  border: colors.borderField,
  borderDone: colors.success,
  transactionName: colors.brandOrange,
  taskName: colors.textPrimary,
  headerIcon: colors.textPrimary,
  headerIconDestructive: colors.destructive,
} as const;

export const taskCardTypography = {
  transactionName: {
    fontFamily: FONT_FAMILY.medium,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.6,
    textTransform: "uppercase" as const,
  },
  taskName: buttonTypography.buttonPrimary,
} as const;

export const taskCardSpacing = {
  cardPadding: spacing.gapDefault * 2,
  sectionGap: spacing.gapDefault + spacing.gapSm,
  headerActionGap: spacing.gapDefault,
  actionGap: spacing.gapDefault,
} as const;

export const taskCardRadius = {
  card: radius.chip + spacing.gapSm,
} as const;

export const taskCardSizing = {
  headerIcon: 18,
  headerIconHitSlop:
    (spacing.minTouchTarget - 18) / 2,
} as const;

export const taskCardShadow = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 20 },
  shadowOpacity: 0.2,
  shadowRadius: 40,
  elevation: 12,
} as const;

export const taskCardOpacity = {
  disabled: 0.5,
  skipped: 0.72,
} as const;

export const taskCardTokens = {
  colors: taskCardColors,
  typography: taskCardTypography,
  spacing: taskCardSpacing,
  radius: taskCardRadius,
  sizing: taskCardSizing,
  shadow: taskCardShadow,
  opacity: taskCardOpacity,
} as const;
