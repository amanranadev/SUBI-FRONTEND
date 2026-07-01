/**
 * Design tokens extracted from datePicker.md (Figma date chip specification).
 * DatePicker must reference these tokens only — no raw repeated values in styles.
 */

export const datePickerColors = {
  brandLightest: "#F9F3ED",
  textPrimary: "#2C2C2C",
  textMuted: "#9A9A9A",
  borderStrong: "#CFCFCF",
  surfaceModal: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.4)",
  calendarSelected: "#F5821E",
  calendarToday: "#F5821E",
  calendarArrow: "#2C2C2C",
  calendarMonthText: "#2C2C2C",
  calendarDayText: "#2C2C2C",
  calendarDisabledText: "#CFCFCF",
  calendarHeaderText: "#9A9A9A",
} as const;

export const datePickerTypography = {
  datePickerLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    lineHeight: 14,
    letterSpacing: 0,
  },
} as const;

export const datePickerRadius = {
  datePickerRadius: 10,
  modalRadius: 16,
} as const;

export const datePickerSpacing = {
  datePickerPaddingY: 7,
  datePickerPaddingLeft: 10,
  datePickerPaddingRight: 14,
  datePickerGap: 6,
  iconSize: 14,
  modalPadding: 16,
  modalMargin: 24,
} as const;

export const datePickerOpacity = {
  disabled: 0.5,
} as const;

export const datePickerTokens = {
  colors: datePickerColors,
  typography: datePickerTypography,
  radius: datePickerRadius,
  spacing: datePickerSpacing,
  opacity: datePickerOpacity,
} as const;
