export interface PersonInfoSectionProps {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  onFirstNameChange?: (value: string) => void;
  onLastNameChange?: (value: string) => void;
  onEmailChange?: (value: string) => void;
  onPhoneChange?: (value: string) => void;
  disabled?: boolean;
  showRemove?: boolean;
  onRemovePress?: () => void;
  removeAccessibilityLabel?: string;
  removeTestID?: string;
  testID?: string;
}
