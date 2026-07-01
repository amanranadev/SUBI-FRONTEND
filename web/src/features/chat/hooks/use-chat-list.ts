import * as React from "react";
import { chatService, type BackendChatSummary, type PaginationMeta } from "../api/chat-service";
import { useToast } from "@/shared/hooks/use-toast";

const CHATS_PER_PAGE = 20;

export function useChatList(onChatDeleted?: (deletedId: string) => void) {
  const [chatList, setChatList] = React.useState<BackendChatSummary[]>([]);
  const [chatListMeta, setChatListMeta] = React.useState<PaginationMeta | null>(null);
  const [isChatListLoading, setIsChatListLoading] = React.useState(false);
  const [chatListLoaded, setChatListLoaded] = React.useState(false);
  const { toast } = useToast();

  const hasMoreChats = chatListMeta
    ? chatListMeta.current_page < chatListMeta.total_pages
    : false;

  const loadChatList = React.useCallback(async (page = 1) => {
    setIsChatListLoading(true);
    try {
      const res = await chatService.listChats({ page, per_page: CHATS_PER_PAGE });
      if (page === 1) {
        setChatList(res.user_chats);
      } else {
        setChatList((prev) => [...prev, ...res.user_chats]);
      }
      setChatListMeta(res.meta);
      setChatListLoaded(true);
    } catch (error) {
      console.error("[useChatList] error:", error);
      setChatListLoaded(true);
      toast({
        variant: "destructive",
        title: "Could not load conversations",
        description:
          "The chat list failed to load. If you recently pulled backend changes, run `bin/rails db:migrate` in SubiAPI and restart the API server.",
      });
    } finally {
      setIsChatListLoading(false);
    }
  }, [toast]);

  const loadMoreChats = React.useCallback(async () => {
    if (isChatListLoading || !hasMoreChats || !chatListMeta) return;
    await loadChatList(chatListMeta.current_page + 1);
  }, [isChatListLoading, hasMoreChats, chatListMeta, loadChatList]);

  const refreshChatList = React.useCallback(async () => {
    await loadChatList(1);
  }, [loadChatList]);

  const deleteChat = React.useCallback(async (id: string) => {
    try {
      await chatService.deleteChat(id);
      setChatList((prev) => prev.filter((c) => c.id !== id));
      onChatDeleted?.(id);
      toast({
        title: "Chat Deleted",
        description: "The conversation has been removed.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: "Could not delete the conversation.",
      });
    }
  }, [onChatDeleted, toast]);

  const updateChatListItem = React.useCallback((chatId: string, lastMessage: BackendChatSummary["last_message"], updatedAt: string) => {
    setChatList((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              last_message: lastMessage,
              message_count: c.message_count + 1,
              updated_at: updatedAt,
            }
          : c
      )
    );
  }, []);

  return {
    chatList,
    chatListMeta,
    isChatListLoading,
    chatListLoaded,
    hasMoreChats,
    loadChatList,
    loadMoreChats,
    refreshChatList,
    deleteChat,
    updateChatListItem,
  };
}
