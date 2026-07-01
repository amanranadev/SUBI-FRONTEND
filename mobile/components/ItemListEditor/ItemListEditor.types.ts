export interface ItemListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
  emptyStateText?: string;
  maxItems?: number;
  disabled?: boolean;
  testID?: string;
}

export interface ItemListEditorRowProps {
  item: string;
  disabled: boolean;
  onRemove: (item: string) => void;
  testID?: string;
}
