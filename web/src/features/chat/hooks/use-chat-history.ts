import * as React from "react";
import { chatService } from "../api/chat-service";
import { mapBackendMessage, type Message } from "../types";

export function useChatHistory() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);

  const resetHistory = React.useCallback(() => {
    setMessages([]);
  }, []);

  const loadInitialMessages = React.useCallback(async (chatId: string): Promise<Message[]> => {
    try {
      const chat = await chatService.getChat(chatId);
      const mapped = chat.messages.map(mapBackendMessage);
      setMessages(mapped);
      return mapped;
    } catch (error) {
      console.error("[useChatHistory] initial load error:", error);
      return [];
    }
  }, []);

  const loadOlderMessages = React.useCallback(async (_chatId: string | null) => {
    // Backend exposes messages via GET /user_chats/:id (not a paginated /messages route).
  }, []);

  return {
    messages,
    setMessages,
    hasMoreMessages: false,
    isLoadingMore,
    loadInitialMessages,
    loadOlderMessages,
    resetHistory,
  };
}
