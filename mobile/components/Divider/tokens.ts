export const DIVIDER_VARIANTS = ["solid", "dashed"] as const;
export const DIVIDER_ORIENTATIONS = ["horizontal", "vertical"] as const;
export const DIVIDER_THICKNESS_VALUES = [1, 2] as const;

export const dividerColors = {
  borderHairline: "#EEEEEE",
} as const;

export const dividerDimensions = {
  dividerWidth: 313,
  dividerVerticalHeight: 20,
} as const;

export const dividerThickness = {
  hairline: 1,
  strong: 2,
} as const;

export const dividerSpacing = {
  insetHorizontal: 16,
} as const;

export const dividerTokens = {
  colors: dividerColors,
  dimensions: dividerDimensions,
  thickness: dividerThickness,
  spacing: dividerSpacing,
} as const;
