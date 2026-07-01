import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentService } from "../services/commentService";
import { CreateCommentRequest, UpdateCommentRequest } from "../types/comment";

export const commentKeys = {
  all: ["comments"] as const,
  lists: () => [...commentKeys.all, "list"] as const,
  list: (transactionTaskId: string) =>
    [...commentKeys.lists(), transactionTaskId] as const,
  details: () => [...commentKeys.all, "detail"] as const,
  detail: (transactionTaskId: string, commentId: string) =>
    [...commentKeys.details(), transactionTaskId, commentId] as const,
};

export const useComments = (transactionTaskId: string) => {
  const isCalendarTaskId =
    transactionTaskId.startsWith("gcal-") ||
    transactionTaskId.startsWith("calendar-");

  return useQuery({
    queryKey: commentKeys.list(transactionTaskId),
    queryFn: () => commentService.getComments(transactionTaskId),
    enabled: !!transactionTaskId && !isCalendarTaskId,
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionTaskId,
      commentData,
    }: {
      transactionTaskId: string;
      commentData: CreateCommentRequest;
    }) => commentService.createComment(transactionTaskId, commentData),
    onSuccess: (_, { transactionTaskId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(transactionTaskId),
      });
    },
  });
};

export const useUpdateComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionTaskId,
      commentId,
      updates,
    }: {
      transactionTaskId: string;
      commentId: string;
      updates: UpdateCommentRequest;
    }) => commentService.updateComment(transactionTaskId, commentId, updates),
    onSuccess: (data, { transactionTaskId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(transactionTaskId),
      });
      queryClient.invalidateQueries({
        queryKey: commentKeys.detail(data.transaction_task_id, data.id),
      });
    },
  });
};

export const useDeleteComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionTaskId,
      commentId,
    }: {
      transactionTaskId: string;
      commentId: string;
    }) => commentService.deleteComment(transactionTaskId, commentId),
    onSuccess: (_, { transactionTaskId }) => {
      queryClient.invalidateQueries({
        queryKey: commentKeys.list(transactionTaskId),
      });
    },
  });
};

export const useCommentManagement = (transactionTaskId: string) => {
  const commentsQuery = useComments(transactionTaskId);
  const createCommentMutation = useCreateComment();
  const updateCommentMutation = useUpdateComment();
  const deleteCommentMutation = useDeleteComment();

  return {
    comments: commentsQuery.data || [],
    isLoading: commentsQuery.isLoading,
    isError: commentsQuery.isError,
    error: commentsQuery.error,
    refetch: commentsQuery.refetch,

    createComment: createCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,

    isCreating: createCommentMutation.isPending,
    isUpdating: updateCommentMutation.isPending,
    isDeleting: deleteCommentMutation.isPending,

    isCreateSuccess: createCommentMutation.isSuccess,
    isUpdateSuccess: updateCommentMutation.isSuccess,
    isDeleteSuccess: deleteCommentMutation.isSuccess,

    isCreateError: createCommentMutation.isError,
    isUpdateError: updateCommentMutation.isError,
    isDeleteError: deleteCommentMutation.isError,

    createError: createCommentMutation.error,
    updateError: updateCommentMutation.error,
    deleteError: deleteCommentMutation.error,
  };
};
