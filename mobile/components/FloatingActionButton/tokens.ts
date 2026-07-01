export const floatingActionButtonColors = {
  brandOrange: "#F5821E",
  brandOrangePressed: "#E87517",
  dark: "#2B2827",
  light: "#FFFFFF",
  lightPressed: "#F7F0EE",
  danger: "#E5484D",
  white: "#FFFFFF",
  textPrimary: "#2C2C2C",
  disabledBackground: "#ECECEC",
  disabledIcon: "#9A9A9A",
  borderLight: "#ECECEC",
} as const;

export const floatingActionButtonSizes = {
  sm: {
    size: 48,
    iconSize: 24,
    roundedRadius: 16,
  },
  md: {
    size: 56,
    iconSize: 30,
    roundedRadius: 20,
  },
  lg: {
    size: 80,
    iconSize: 36,
    roundedRadius: 32,
  },
} as const;

export const floatingActionButtonShadows = {
  brand: {
    shadowColor: floatingActionButtonColors.brandOrange,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 9,
    elevation: 8,
  },
  heavy: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.28,
    shadowRadius: 28,
    elevation: 10,
  },
} as const;

export const floatingActionButtonMotion = {
  pressedOpacity: 0.9,
  disabledOpacity: 0.55,
} as const;

export const floatingActionButtonTokens = {
  colors: floatingActionButtonColors,
  sizes: floatingActionButtonSizes,
  shadows: floatingActionButtonShadows,
  motion: floatingActionButtonMotion,
} as const;
