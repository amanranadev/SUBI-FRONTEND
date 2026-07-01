import { AlertTriangle, Link2 } from 'lucide-react'

import {
  type TransactionTask,
} from '@/features/transactions/types/transaction-task'
import { Button } from '@/shared/ui/button'
import { Form } from '@/shared/ui/form'
import { FormDateInput } from '@/shared/ui/form-data-input'
import { FormInputField } from '@/shared/ui/form-input-field'
import { FormSelectWithController } from '@/shared/ui/form-selector-with-controller'
import { FormTextarea } from '@/shared/ui/form-text-area'
import { Modal } from '@/shared/ui/modal'
import type { TaskListItem } from '@/features/tasks/types'
import { useTaskForm } from '../hooks/use-task-form'

interface GenericTaskModalProps {
  isOpen: boolean
  title?: string
  subtitle?: string
  needToValidate?: boolean
  initialData?: Partial<TransactionTask> | null
  onSave: (task: TransactionTask) => Promise<boolean | void> | boolean | void
  onClose: () => void
  showTransactionSelector?: boolean
  /** Tasks from the same transaction for the "Depends on" dropdown */
  availableTasks?: TaskListItem[]
}

export const GenericTaskModal = ({
  isOpen,
  onClose,
  onSave,
  initialData = {},
  title = 'Add Task',
  subtitle = 'Create a task for a transaction',
  needToValidate = true,
  showTransactionSelector = false,
  availableTasks = [],
}: GenericTaskModalProps) => {
  const { form, state, actions } = useTaskForm({
    isOpen,
    initialData,
    onSave,
    onClose,
    needToValidate,
    showTransactionSelector,
    availableTasks,
  })

  const {
    isSubmitting,
    isLoadingTransactions,
    hasDependency,
    parentTaskOptions,
    selectedParentName,
    transactions,
  } = state

  const { onSubmit, handleClearDependency } = actions

  return (
    <Modal
      open={isOpen}
      onOpenChange={onClose}
      hideHeader
      overlayClassName='bg-black/80'
      contentClassName='max-h-[90vh] w-[min(95vw,38rem)] max-w-none border-0 heavy-shadow bg-background p-8'
    >
        <div className='space-y-6 text-left'>
          <div className='pr-12'>
            <h2 className='text-2xl font-bold tracking-tight'>
              {title}
            </h2>
            <p className='mt-1 text-sm leading-relaxed text-muted-foreground'>
              {subtitle}
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={(e) => { e.stopPropagation(); onSubmit(e); }} className='space-y-5'>
              {showTransactionSelector && (
                <FormSelectWithController
                  label='Property Name *'
                  placeholder={
                    isLoadingTransactions ?
                      'Loading properties...'
                    : 'Select a property'
                  }
                  options={transactions.map((transaction) => ({
                    value: transaction.id,
                    label: transaction.address || 'No address provided',
                  }))}
                  name='transactionId'
                  control={form.control}
                  disabled={isLoadingTransactions}
                />
              )}

              <FormInputField
                control={form.control}
                name='name'
                label='Task Title *'
                required
                type='text'
                placeholder='Enter task title'
              />

              <FormTextarea
                label='Note'
                {...form.register('description')}
                placeholder='Enter note'
                textareaSize='default'
              />

              {/* Dependency section */}
              {parentTaskOptions.length > 0 && (
                <div className='space-y-3 rounded-2xl border border-black/5 bg-black/[0.02] p-4'>
                  <div className='flex items-center gap-2'>
                    <Link2 className='size-4 opacity-40' />
                    <span className='text-[10px] font-bold uppercase tracking-widest opacity-40'>
                      Task Dependency
                    </span>
                  </div>

                  <FormSelectWithController
                    label='Depends on'
                    placeholder='No dependency (standalone task)'
                    options={[
                      { value: '__none__', label: 'No dependency' },
                      ...parentTaskOptions,
                    ]}
                    name='parentTaskId'
                    control={form.control}
                  />

                  {hasDependency && (
                    <div className='space-y-3'>
                      <FormInputField
                        control={form.control}
                        name='daysAfterParent'
                        label='Days after parent task'
                        type='number'
                        placeholder='e.g. 3'
                      />
                      {selectedParentName && (
                        <p className='text-xs text-muted-foreground'>
                          Due date will be auto-calculated: {form.getValues('daysAfterParent') || '?'} days after &ldquo;{selectedParentName}&rdquo;
                        </p>
                      )}
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={handleClearDependency}
                        className='text-xs text-muted-foreground'
                      >
                        Remove dependency
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Due date — hidden when dependent */}
              {!hasDependency && (
                <FormDateInput
                  label='Due Date *'
                  name='dueDate'
                  control={form.control}
                  size='default'
                />
              )}

              {/* Warning for tasks with children */}
              {initialData?.hasChildren && (
                <div className='flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4'>
                  <AlertTriangle className='size-4 mt-0.5 text-amber-600 shrink-0' />
                  <p className='text-xs font-medium text-amber-800'>
                    This task has dependent child tasks. Changing the due date will update their dates too.
                  </p>
                </div>
              )}

              <div className='flex justify-end pt-2'>
                <Button
                  type='submit'
                  disabled={isSubmitting || (needToValidate && !form.formState.isValid)}
                  className='h-12 px-10 !rounded-2xl font-bold'
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Form>
        </div>
    </Modal>
  )
}
