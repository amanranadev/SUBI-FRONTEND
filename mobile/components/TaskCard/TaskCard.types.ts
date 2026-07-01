export type TaskStatus = "pending" | "done" | "skipped";

export interface TaskCardProps {
  transactionName: string;
  taskName: string;
  dueDate?: Date | null;
  status?: TaskStatus;
  onDateChange?: (date: Date | null) => void;
  onEditPress?: () => void;
  onSkipPress?: () => void;
  onDonePress?: () => void;
  onDocumentPress?: () => void;
  onDeletePress?: () => void;
  disabled?: boolean;
  testID?: string;
}
