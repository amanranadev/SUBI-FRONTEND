import type { PersonInfo } from "@/components/PersonInfoList";
import type { TaskStatus } from "@/components/TaskCard";

export type ReviewStatus = "needs-review" | "done";

export type SectionKey =
  | "transactionSummary"
  | "clientInformation"
  | "propertyInformation"
  | "formsAndTasks";

export interface ReviewStatusState {
  transactionSummary: ReviewStatus;
  clientInformation: ReviewStatus;
  propertyInformation: ReviewStatus;
  formsAndTasks: ReviewStatus;
}

export interface TransactionSummaryData {
  propertyAddress: string;
  purchasePrice: string;
  psaType: string;
  earnestMoney: string;
  closingDate?: Date;
  mutualAcceptance?: Date;
}

export interface ClientInformationData {
  buyers: PersonInfo[];
  buyerAgent: PersonInfo[];
  sellerAgent: PersonInfo[];
}

export interface PropertyInformationData {
  city: string;
  state: string;
  country: string;
  parcelNumber: string;
  titleCompany: string;
  closingAgent: string;
  escrowEmail: string;
  lender: string;
  itemsThatStay: string[];
}

export interface TransactionTask {
  id: string;
  transactionName: string;
  taskName: string;
  dueDate?: Date | null;
  status: TaskStatus;
}

export interface FormsAndTasksData {
  tasks: TransactionTask[];
  selectedChecklistId: string | null;
}

export interface TransactionResultState {
  transactionSummary: TransactionSummaryData;
  clientInformation: ClientInformationData;
  propertyInformation: PropertyInformationData;
  formsAndTasks: FormsAndTasksData;
  reviewStatus: ReviewStatusState;
}

export type TransactionResultAction =
  | {
      type: "UPDATE_TRANSACTION_SUMMARY";
      payload: Partial<TransactionSummaryData>;
    }
  | {
      type: "UPDATE_CLIENT_INFORMATION";
      payload: Partial<ClientInformationData>;
    }
  | {
      type: "UPDATE_PROPERTY_INFORMATION";
      payload: Partial<PropertyInformationData>;
    }
  | {
      type: "UPDATE_FORMS_AND_TASKS";
      payload: Partial<FormsAndTasksData>;
    }
  | {
      type: "SET_SECTION_REVIEW_STATUS";
      section: SectionKey;
      status: ReviewStatus;
    }
  | {
      type: "REPLACE_STATE";
      payload: TransactionResultState;
    };

export interface TransactionResultDrawerProps {
  open: boolean;
  onClose?: () => void;
  initialState?: TransactionResultState;
  onDiscardDraft?: () => void;
  onSaveTransaction?: (state: TransactionResultState) => void;
  testID?: string;
}
