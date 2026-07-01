import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services/taskService";
import { Task } from "../types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...taskKeys.lists(), { filters }] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  urgent: (userId: string) => [...taskKeys.all, "urgent", userId] as const,
  transaction: (transactionId: string) =>
    [...taskKeys.all, "transaction", transactionId] as const,
};

const useTasks = () => {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: taskService.getTasks,
  });
};

const useTask = (taskId: string) => {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => taskService.getTask(taskId),
    enabled: !!taskId,
  });
};

const useTransactionTasks = (transactionId: string) => {
  return useQuery({
    queryKey: taskKeys.transaction(transactionId),
    queryFn: () => taskService.getTransactionTasks(transactionId),
    enabled: !!transactionId,
  });
};

const useUserUrgentTasks = (userId: string) => {
  return useQuery({
    queryKey: taskKeys.urgent(userId),
    queryFn: () => taskService.getUserUrgentTasks(userId),
    enabled: !!userId,
  });
};

const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.createTask,
    onSuccess: (data, variables) => {
      // Get transactionId from response OR from the original request variables
      const txId = data.transactionId || data.transaction_id || variables.transactionId;
      
      // Invalidate transaction-specific tasks first (most important)
      if (txId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.transaction(txId),
        });
      }
      
      // Invalidate all task lists
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      
      // Invalidate all task queries (catches any we might have missed)
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      updates,
    }: {
      taskId: string;
      updates: Partial<Task>;
      transactionId?: string;
    }) => taskService.updateTask(taskId, updates),
    onSuccess: (_, { taskId, transactionId }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      // Also invalidate transaction-specific tasks if transactionId is provided
      if (transactionId) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.transaction(transactionId),
        });
      }
    },
  });
};

const useCompleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.completeTask,
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      // Invalidate all task queries to ensure transaction task lists refresh
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: taskService.deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      // Invalidate all task queries to ensure transaction task lists refresh
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
};

// Combined hook - similar to useAuth
export const useTaskManagement = (transactionId?: string) => {
  const tasksQuery = useTasks();
  const transactionTasksQuery = useTransactionTasks(transactionId!);
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const completeTaskMutation = useCompleteTask();
  const deleteTaskMutation = useDeleteTask();

  return {
    transactionTasks: transactionTasksQuery.data || [],
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isLoadingTransactionTasks: transactionTasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    refetch: tasksQuery.refetch,
    refetchTransactionTasks: transactionTasksQuery.refetch,

    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    completeTask: completeTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,

    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isCompleting: completeTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,

    isCreateSuccess: createTaskMutation.isSuccess,
    isUpdateSuccess: updateTaskMutation.isSuccess,
    isCompleteSuccess: completeTaskMutation.isSuccess,
    isDeleteSuccess: deleteTaskMutation.isSuccess,

    isCreateError: createTaskMutation.isError,
    isUpdateError: updateTaskMutation.isError,
    isCompleteError: completeTaskMutation.isError,
    isDeleteError: deleteTaskMutation.isError,

    createError: createTaskMutation.error,
    updateError: updateTaskMutation.error,
    completeError: completeTaskMutation.error,
    deleteError: deleteTaskMutation.error,
  };
};

// Export individual hooks
export { useCreateTask, useUpdateTask, useCompleteTask, useDeleteTask, useTasks, useTask, useTransactionTasks, useUserUrgentTasks };
