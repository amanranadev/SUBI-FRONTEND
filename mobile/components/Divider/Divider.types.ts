import type {
  DIVIDER_ORIENTATIONS,
  DIVIDER_THICKNESS_VALUES,
  DIVIDER_VARIANTS,
} from "./tokens";

export type DividerVariant = (typeof DIVIDER_VARIANTS)[number];
export type DividerOrientation = (typeof DIVIDER_ORIENTATIONS)[number];
export type DividerThickness = (typeof DIVIDER_THICKNESS_VALUES)[number];

export interface DividerProps {
  variant?: DividerVariant;
  orientation?: DividerOrientation;
  thickness?: DividerThickness;
  inset?: boolean;
  testID?: string;
}
