export interface DatePickerProps {
  value?: Date;
  placeholder?: string;
  onChange?: (date: Date) => void;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  format?: string;
  accessibilityLabel?: string;
  testID?: string;
}
