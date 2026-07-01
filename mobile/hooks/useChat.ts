import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chatService';
import {
  ChatMessage,
  UserChat,
  CreateChatRequest,
  SendMessageRequest,
  MessageDraft,
} from '@/types/chat';

// Query keys
export const chatKeys = {
  all: ['chats'] as const,
  lists: () => [...chatKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...chatKeys.lists(), { filters }] as const,
  details: () => [...chatKeys.all, 'detail'] as const,
  detail: (id: string) => [...chatKeys.details(), id] as const,
  drafts: () => [...chatKeys.all, 'drafts'] as const,
  draft: (id: string) => [...chatKeys.drafts(), id] as const,
};

// Individual query hooks
export const useChats = () => {
  return useQuery({
    queryKey: chatKeys.lists(),
    queryFn: chatService.getChats,
  });
};

export const useChat = (chatId: string) => {
  return useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: () => chatService.getChat(chatId),
    enabled: !!chatId,
  });
};

export const useMessageDrafts = () => {
  return useQuery({
    queryKey: chatKeys.drafts(),
    queryFn: chatService.getMessageDrafts,
  });
};

// Individual mutation hooks
export const useCreateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChatRequest) => chatService.createChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
};

export const useUpdateChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: { title?: string; status?: 'active' | 'archived' | 'deleted' } }) =>
      chatService.updateChat(chatId, data),
    onSuccess: (_, { chatId }) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) });
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
};

export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => chatService.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, data }: { chatId: string; data: SendMessageRequest }) =>
      chatService.sendMessage(chatId, data),
    // Optimistic update
    onMutate: async ({ chatId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: chatKeys.detail(chatId) });

      // Snapshot the previous value
      const previousChat = queryClient.getQueryData<UserChat>(chatKeys.detail(chatId));

      // Optimistically add user message
      const tempMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: data.message,
        role: 'user',
        timestamp: new Date().toISOString(),
      };

      queryClient.setQueryData<UserChat>(chatKeys.detail(chatId), (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [...old.messages, tempMessage],
          message_count: old.message_count + 1,
        };
      });

      return { previousChat };
    },
    onError: (err, { chatId }, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(chatKeys.detail(chatId), context.previousChat);
      }
    },
    onSettled: (_, __, { chatId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) });
    },
  });
};

export const useSendDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => chatService.sendDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.drafts() });
    },
  });
};

export const useCancelDraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (draftId: string) => chatService.cancelDraft(draftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.drafts() });
    },
  });
};

// Combined hook for convenience
export const useChatManagement = (chatId?: string) => {
  const chatsQuery = useChats();
  const chatQuery = useChat(chatId || '');
  const draftsQuery = useMessageDrafts();
  const createChatMutation = useCreateChat();
  const updateChatMutation = useUpdateChat();
  const deleteChatMutation = useDeleteChat();
  const sendMessageMutation = useSendMessage();
  const sendDraftMutation = useSendDraft();
  const cancelDraftMutation = useCancelDraft();

  return {
    // Data
    chats: chatsQuery.data || [],
    currentChat: chatQuery.data,
    drafts: draftsQuery.data || [],

    // Loading states
    isLoadingChats: chatsQuery.isLoading,
    isLoadingChat: chatQuery.isLoading,
    isLoadingDrafts: draftsQuery.isLoading,

    // Error states
    isChatsError: chatsQuery.isError,
    isChatError: chatQuery.isError,
    chatsError: chatsQuery.error,
    chatError: chatQuery.error,

    // Mutations
    createChat: createChatMutation.mutateAsync,
    updateChat: updateChatMutation.mutate,
    deleteChat: deleteChatMutation.mutate,
    sendMessage: sendMessageMutation.mutate,
    sendDraft: sendDraftMutation.mutate,
    cancelDraft: cancelDraftMutation.mutate,

    // Mutation states
    isCreating: createChatMutation.isPending,
    isUpdating: updateChatMutation.isPending,
    isDeleting: deleteChatMutation.isPending,
    isSending: sendMessageMutation.isPending,
    isSendingDraft: sendDraftMutation.isPending,
    isCancellingDraft: cancelDraftMutation.isPending,

    // Success states
    isCreateSuccess: createChatMutation.isSuccess,
    isSendSuccess: sendMessageMutation.isSuccess,
    isSendDraftSuccess: sendDraftMutation.isSuccess,

    // Error states for mutations
    isCreateError: createChatMutation.isError,
    isSendError: sendMessageMutation.isError,
    createError: createChatMutation.error,
    sendError: sendMessageMutation.error,

    // Refetch functions
    refetchChats: chatsQuery.refetch,
    refetchChat: chatQuery.refetch,
    refetchDrafts: draftsQuery.refetch,
  };
};
