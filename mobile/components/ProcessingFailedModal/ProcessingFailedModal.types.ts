export interface ProcessingFailedModalProps {
  title?: string;
  errorMessage: string;
  onRetry?: () => void;
  onCancel?: () => void;
  loading?: boolean;
  testID?: string;
}
