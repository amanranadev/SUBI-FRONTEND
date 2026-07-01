import z from 'zod'

export const TRANSACTION_TASK_TYPES = {
  TASK: 'TASK',
  FORM: 'FORM',
} as const

export const TaskSchema = z.object({
  name: z.string().min(1),
  type: z.enum([TRANSACTION_TASK_TYPES.TASK, TRANSACTION_TASK_TYPES.FORM]),
  dueDate: z.string().min(1),
  description: z.string().optional(),
  information: z.string().optional(),
  transactionId: z.string().optional(),
})

export type TaskSchemaData = z.infer<typeof TaskSchema>

export type TransactionTaskType = keyof typeof TRANSACTION_TASK_TYPES

export interface TransactionTask {
  id: string
  name?: string | null
  description?: string | null
  information?: string | null
  completed: boolean
  dueDate?: string | Date
  transactionId?: string
  type?: TransactionTaskType
  parentTaskId?: string | null
  daysAfterParent?: number | null
  hasChildren?: boolean
}

export default TransactionTask
