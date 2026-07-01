import type { ReactNode } from "react";

export interface PersonInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  sourceBadge?: ReactNode;
}

export interface PersonInfoListProps {
  people: PersonInfo[];
  onChange: (people: PersonInfo[]) => void;
  addButtonLabel?: string;
  showImportButton?: boolean;
  onImportPress?: () => void;
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  testID?: string;
}

export interface PersonInfoListItemProps {
  person: PersonInfo;
  index: number;
  disabled: boolean;
  showRemove: boolean;
  removeAccessibilityLabel: string;
  onRemove: (personId: string) => void;
  onFieldChange: (
    personId: string,
    field: "firstName" | "lastName" | "email" | "phone",
    value: string,
  ) => void;
  testID?: string;
}
