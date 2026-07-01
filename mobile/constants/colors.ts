export const colors = {
  brickOrange: "#FD4D03",
  lawnGreen: "#D6EBB6",
  poolBlue: "#CCF0FE",
  warmSand: "#ECD3C0",
  earthyBrown: "#442101",
  black: "#000000",
  white: "#FFFFFF",
  accentGreen: "#4DA764",
  accentGreenLight: "#E1FBE7",
  accentBlue: "#007AFF",
  red: {
    100: "#FEE2E2",
    500: "#FD4D03",
    800: "#991B1B",
  },
  green: {
    200: "#67CB78",
    500: "#4DA764",
  },
  orange: {
    500: "#E84501",
  },
  yellow: {
    100: "#FFF8e6",
    500: "#FFFDE7",
    900: "#705A00",
  },
  blue: {
    100: "#E3F2FD",
    500: "#007AFF",
    800: "#1565C0",
  },
  purple: {
    100: "#E6D7F9",
    600: "#7A2AE0",
  },
  primary: {
    100: "#FAF5F2",
    200: "#F2EDEA",
    300: "#EBE6E3",
    350: "#FEDBCD",
    400: "#FD4D03",
    500: "#E84501",
    600: "#D54002",
  },

  // Gray Scale
  gray: {
    50: "#FDFCFC",
    100: "#FFFFFF",
    200: "#FCFAFA",
    300: "#FAF7F5",
    400: "#F7F0EE",
    500: "#DBD4D1",
    600: "#867873",
    700: "#504845",
    800: "#2B2827",
    900: "#161515",
  },
  placeholder: "#999",
  buttonDisabled: "#504844",
} as const;

export type Colors = typeof colors;
