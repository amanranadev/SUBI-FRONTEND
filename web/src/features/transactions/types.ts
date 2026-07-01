import type {
  ExtractionStatus,
  AiProcessingStatus,
  ProcessingStep,
  TransactionCategory,
} from "./constants";

// --- API Response Types ---

export type FileUploadResponse = {
  success: boolean;
  file: {
    id: number;
    uri: number;
    mime_type: string;
    original_filename: string;
    filename: string;
    file_info: {
      filename: string;
      content_type: string;
      byte_size: number;
      url: string;
      download_url: string;
      created_at: string;
    };
  };
  message: string;
  job_id?: string;
  processing?: boolean;
  extraction_status?: ExtractionStatus;
  ai_processing_status?: AiProcessingStatus;
};

export type FileStatusResponse = {
  success: boolean;
  file: {
    id: number;
    filename: string;
    extraction_status: ExtractionStatus;
    ai_processing_status: AiProcessingStatus;
    ai_processing_error_message: string | null;
    extracted_text: string | null;
    extracted_text_length: number | null;
    scanned: boolean;
    extraction_cached_at: string | null;
    ai_processing_cached_at: string | null;
    transaction_data?: RawTransactionData;
  };
};

export type BuyerSeller = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  representing: boolean;
};

export type RawTransactionTask = {
  task_name_short: string;
  task_name?: string;
  taskName?: string;
  computed: {
    normalized: string | null;
  };
  offset: {
    n: number;
    unit: string;
    direction: string;
  };
  trigger: string;
  description?: string;
};

export type RawTransactionForm = {
  form_number: string;
  form_name: string;
  description?: string;
  tasks: RawTransactionTask[];
};

export type RawTransactionData = {
  address?: string;
  amount?: number;
  listingPrice?: number | null;
  earnestMoney?: number | { value?: number; dueDate?: string };
  pendDate?: string;
  closeDate?: string;
  county?: string;
  cityState?: string;
  city_state?: string;
  parcelNumber?: string;
  description?: string;
  category?: TransactionCategory;
  psaType?: string;
  listingType?: string;
  titleCo?: string;
  closingAgent?: string;
  escrowOfficer?: string;
  escrowEmail?: string;
  lender?: string;
  nwmlsNumber?: string;
  itemsThatStay?: string | string[];
  buyersandsellers?: Array<{
    buyers: BuyerSeller[];
    sellers: BuyerSeller[];
  }>;
  buyers?: BuyerSeller[];
  sellers?: BuyerSeller[];
  buyerAgent?: RawTransactionAgentContact | null;
  buyer_agent?: RawTransactionAgentContact | null;
  buyerBrokerName?: string | null;
  buyerBrokerEmail?: string | null;
  buyerBrokerPhone?: string | null;
  sellerAgent?: RawTransactionAgentContact | null;
  seller_agent?: RawTransactionAgentContact | null;
  sellerBrokerName?: string | null;
  sellerBrokerEmail?: string | null;
  sellerBrokerPhone?: string | null;
  listingAgent?: RawTransactionAgentContact | null;
  listing_agent?: RawTransactionAgentContact | null;
  listingBrokerName?: string | null;
  listingBrokerEmail?: string | null;
  listingBrokerPhone?: string | null;
  checklistId?: string;
  checklist_id?: string;
  forms?: RawTransactionForm[];
  dateClauses?: Array<{
    rawText: string;
    conditional: boolean;
    normalized: string | null;
    sourceForm: string;
  }>;
};

// --- Form Data Types ---

export type TransactionFormParty = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  representing: boolean;
};

export type TransactionAgentContact = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
};

export type RawTransactionAgentContact = Partial<TransactionAgentContact> & {
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
};

export type TransactionFormTask = {
  id: string;
  title: string;
  date: string;
  calculation: string;
  formName: string;
  isSelected: boolean;
  note?: string;
};

export type RepresentingParty = "buyer" | "seller";

/** RHF + zod: draft line for ItemsThatStayEditor (not sent to API). */
export type ItemsThatStayFormSlice = {
  itemsThatStay: string[];
  itemsThatStayDraft: string;
};

export type TransactionFormData = ItemsThatStayFormSlice & {
  teamId?: string | null;
  checklistId?: string | null;
  checklistTemplateId?: string | null;
  address: string;
  price: string;
  representingParty: RepresentingParty | null;
  buyers: TransactionFormParty[];
  sellers: TransactionFormParty[];
  buyerAgent: TransactionAgentContact;
  sellerAgent: TransactionAgentContact;
  parcelNumber: string;
  closeDate: string;
  mutualAcceptanceDate: string;
  earnestMoney: string;
  city: string;
  state: string;
  county: string;
  psaType: string;
  titleCompany: string;
  closingAgent: string;
  escrowEmail: string;
  lender: string;
  nwmlsNumber: string;
  description: string;
  tasks: TransactionFormTask[];
};

// --- Processing State ---

export type ProcessingProgress = {
  step: ProcessingStep;
  percent: number;
  message: string;
};

// --- Pending Uploads (Drafts) ---

export type PendingUploadFile = {
  filename: string;
  content_type: string;
  byte_size: number;
  url: string;
  download_url: string;
  created_at: string;
};

export type PendingUpload = {
  id: string;
  user_id: string;
  related_transaction_id: string | null;
  ai_processing_status: AiProcessingStatus;
  extraction_status: ExtractionStatus;
  ai_processing_result: RawTransactionData | null;
  ai_processing_cached_at: string | null;
  extraction_cached_at: string | null;
  created_at: string;
  updated_at: string;
  uploaded_by: string;
  related_transaction_address: string | null;
  file: PendingUploadFile | null;
};

export type PendingUploadsResponse = {
  success: boolean;
  data: PendingUpload[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
    has_more: boolean;
  };
};
