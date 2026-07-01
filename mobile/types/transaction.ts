// Transaction Task interface
export interface TransactionTask {
  completed: boolean;
  description: string;
  dueDate: string;
  id: string;
  information: string;
  name: string;
  status: "ON_TRACK" | "OVERDUE" | "DUE_SOON" | "COMPLETED";
  taskId: string;
  transactionId: string;
  type: "TASK" | "MILESTONE";
}

// Buyer/Seller interface
export interface BuyerSeller {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  representing: boolean;
  isFromAPI: boolean;
}

// Buyers and Sellers interface
export interface BuyersAndSellers {
  buyers: BuyerSeller[];
  sellers: BuyerSeller[];
}

// Main Transaction interface based on your backend response
export interface Transaction {
  // Basic transaction info
  id: string;
  description: string;
  amount: number;
  address: string;
  date: string;
  transactionCategory: "PSA" | "LISTING";
  transaction_category: "PSA" | "LISTING";

  // Dates
  closeDate: string;
  close_date: string;
  pendDate: string;
  pend_date: string;
  createdAt: string;
  created_at: string;
  updatedAt: string;
  updated_at: string;

  // Status
  status: string;
  statusType: "overdue" | "on-track" | "due-soon";
  daysToClose: number;

  // PSA specific
  psaType?: "RESIDENTIAL" | "COMMERCIAL";
  earnestMoney: number;
  earnest_money: number;

  // Listing specific
  listingPrice?: number;
  listing_price?: number;
  listingComm?: number;
  listing_comm?: number;
  listingType?: string;
  listing_type?: string;

  // Agent info
  agentName?: string;
  agent_name?: string;
  agentEmail?: string;
  agent_email?: string;
  agentPhone?: string;
  agent_phone?: string;
  agentPaid?: boolean;
  agent_paid?: boolean;

  // Broker info
  brokerMintEmail?: string;
  broker_mint_email?: string;

  // Commission
  buyerComm?: number;
  buyer_comm?: number;
  listSalePercent?: number;
  list_sale_percent?: number;

  // Escrow info
  escrowOfficer: string;
  escrow_officer: string;
  escrowAddress?: string;
  escrow_address?: string;
  escrowAgentEmail?: string;
  escrow_agent_email?: string;

  // Title info
  titleCo: string;
  title_co: string;
  titleOfficer: string;
  title_officer: string;
  titleNumber: string;
  title_number: string;

  // Lender info
  lender: string;

  // MLS info
  nwmlsNumber: string;
  nwmls_number: string;

  // Property info
  parcelNumber: string;
  parcel_number: string;
  cityState: string;
  city_state: string;

  // Financial
  closingCosts?: number;
  closing_costs?: number;
  extension?: string;

  // Social media
  fb?: string;
  ig?: string;

  // Other fields
  referral?: string;
  itemsThatStay?: string;
  items_that_stay?: string;

  // Status tracking
  statusChangedNwmls?: string;
  status_changed_nwmls?: string;

  // User info
  userId: string;
  user_id: string;
  users: any[];
  representing: string[];

  // Buyers and sellers (JSON string)
  buyersAndSellers: string;
  buyers_and_sellers: string;

  buyersAndSellersParsed?: BuyersAndSellers;

  // Tasks
  TransactionTasks: TransactionTask[];

  // Flags
  isActive: boolean;
  is_active: boolean;
  archivedAt?: string;
  archived_at?: string;
  deletedAt?: string;
  deleted_at?: string;
  age?: string;
  totalTasks: number;
  totalCompletedTasks: number;
  totalUploads: number;
  userUploads: any[];
  // Computed fields (added by frontend)
  overdueCount?: number;
  dueSoonCount?: number;
}

// Transaction filters interface
export interface TransactionFilters {
  category?: "PSA" | "LISTING";
  status?: string;
  team_id?: string;
  userId?: string;
}
