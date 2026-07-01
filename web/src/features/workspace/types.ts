import type { TransactionStatus } from "@/features/workspace/status"
import type {
  RepresentingParty,
  TransactionAgentContact,
  TransactionFormParty,
} from "@/features/transactions/types"

export interface TransactionSelectedTask {
  id: string
  name: string
  dueDate: string | null
  transactionTaskType?: string | null
}

export interface TransactionDetailTask {
  id: string
  name: string
  description?: string | null
  information?: string | null
  dueDate?: string | Date
  completed: boolean
  status?: string
  type?: string
  transactionId?: string
}

export interface Transaction {
  id: string
  userId?: string
  address: string
  price: string
  status: TransactionStatus
  date: string
  progress: number
  hasTasks: boolean
  buyers?: string
  sellers?: string
  /** Structured parties from API (preferred over display strings). */
  buyerParties?: TransactionFormParty[]
  sellerParties?: TransactionFormParty[]
  buyerAgent?: TransactionAgentContact
  sellerAgent?: TransactionAgentContact
  representingParty?: RepresentingParty | null
  parcelNumber?: string
  mutualAcceptanceDate?: string
  /** Same optional fields as transaction review / create payload where API supports them. */
  earnestMoney?: string
  psaType?: string
  city?: string
  state?: string
  county?: string
  titleCompany?: string
  closingAgent?: string
  escrowEmail?: string
  lender?: string
  nwmlsNumber?: string
  description?: string
  itemsThatStay?: string[]
  cadetCommand?: string
  agentName?: string
  selectedTasks?: TransactionSelectedTask[]
  transactionTasks?: TransactionDetailTask[]
}

