import z from 'zod'

export const TRANSACTION_TASK_STATUS = {
  COMPLETED: 'COMPLETED',
  PAST_DUE: 'PAST_DUE',
  COMING_UP: 'COMING_UP',
  ON_TRACK: 'ON_TRACK',
  NOT_STARTED: 'NOT_STARTED',
  SKIPPED: 'SKIPPED',
} as const

export const TRANSACTION_TASK_TYPES = {
  TASK: 'TASK',
  FORM: 'FORM',
} as const

export const TRANSACTION_TASK_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const

export const TaskSchema = z.object({
  name: z.string().min(1),
  type: z.nativeEnum(TRANSACTION_TASK_TYPES),
  dueDate: z.string().min(1),
  description: z.string().optional(),
  information: z.string().optional(),
  transactionId: z.string().optional(),
})

export type TransactionTaskType = keyof typeof TRANSACTION_TASK_TYPES
export type TransactionTaskStatus = keyof typeof TRANSACTION_TASK_STATUS
export type TransactionTaskPriority = keyof typeof TRANSACTION_TASK_PRIORITY

export type TaskSchemaData = z.infer<typeof TaskSchema>

interface BaseTaskFields {
  id: string
  name?: string | null
  description?: string | null
  information?: string | null
  completed: boolean
  taskId?: string | null
  priority?: TransactionTaskPriority
  title?: string
}

interface BackendTaskFields {
  due_date: string
  transaction_id: string
  task_id?: string | null
  transaction_task_type: number | string
  status: number | string
  created_at?: string
  updated_at?: string
  checklist_task_id?: string | null
  checklist_id?: string | null
  from_checklist?: boolean
}

interface FrontendTaskFields {
  dueDate?: string | Date
  transactionId?: string
  type?: TransactionTaskType
  status?: TransactionTaskStatus
  label?: string | null
  assignedTo?: string
  assignedUserId?: string | null
  address?: string
  checklistTaskId?: string | null
  checklistId?: string | null
  fromChecklist?: boolean
  parentTaskId?: string | null
  daysAfterParent?: number | null
  daysOffset?: number | null
  triggerEvent?: string | null
  hasChildren?: boolean
}

interface CreateTaskFields {
  due_date: string
  completed: boolean
  transaction_task_type: TransactionTaskType
  status: TransactionTaskStatus
}

interface FormTaskFields {
  dueDate: string
  transactionId?: string
  type: TransactionTaskType
  status: TransactionTaskStatus
  checklistId?: string | null
}

export type TransactionTaskCreate = CreateTaskFields & {
  name: string
  description: string
  information: string
  transaction_id: string
  from_checklist?: boolean
  checklist_task_id?: string
}

export interface TransactionTaskUpdate extends Partial<CreateTaskFields> {
  name?: string
  description?: string
  information?: string
  completed?: boolean
}

export interface TaskComment {
  id: string
  content: string
  user_id?: string
  user?: {
    id: string
    name?: string
    email?: string
  }
  created_at?: string
  updated_at?: string
}

export interface TransactionTask extends BaseTaskFields, FrontendTaskFields {
  comments?: TaskComment[]
}

export interface TransactionTaskResult
  extends BaseTaskFields,
    BackendTaskFields {}

export type TransactionTaskFormData = BaseTaskFields &
  FormTaskFields &
  TaskSchemaData

export const getTaskStatusLabel = (status?: string) => {
  switch (status) {
    case TRANSACTION_TASK_STATUS.PAST_DUE:
      return 'Past Due'
    case TRANSACTION_TASK_STATUS.ON_TRACK:
      return 'On Track'
    case TRANSACTION_TASK_STATUS.COMING_UP:
      return 'Coming Up'
    case TRANSACTION_TASK_STATUS.NOT_STARTED:
      return 'Not Started'
    case TRANSACTION_TASK_STATUS.SKIPPED:
      return 'Skipped'
    case TRANSACTION_TASK_STATUS.COMPLETED:
      return 'Completed'
    default:
      return status || 'Unknown'
  }
}
