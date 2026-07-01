import { ChatMessage, MessageDraft } from '@/types/chat';
import { create } from 'zustand';

interface ChatState {
  // Streaming state per chat
  streamingMessages: Record<string, string>; // chatId -> partial response
  streamingProgress: Record<string, number>; // chatId -> 0-100
  typingChats: Record<string, boolean>; // chatId -> isTyping

  // Message drafts
  pendingDrafts: Record<string, MessageDraft>; // draftId -> draft

  // Current active chat
  activeChatId: string | null;

  // Pending message to send (set by SubiChat, consumed by Chat screen)
  pendingMessage: string | null;
  pendingTransactionId: string | null;

  // Voice mode overlay state (rendered inside Chat screen)
  isVoiceModeOpen: boolean;

  // Voice-mode transcript messages keyed by chat id
  voiceMessagesByChat: Record<string, ChatMessage[]>;
}

interface ChatActions {
  // Streaming actions
  setStreamingMessage: (chatId: string, content: string) => void;
  clearStreamingMessage: (chatId: string) => void;
  setStreamingProgress: (chatId: string, progress: number) => void;

  // Typing actions
  setTypingStatus: (chatId: string, isTyping: boolean) => void;
  clearTypingStatus: (chatId: string) => void;

  // Draft actions
  addDraft: (draft: MessageDraft) => void;
  removeDraft: (draftId: string) => void;
  clearAllDrafts: () => void;

  // Active chat
  setActiveChatId: (chatId: string | null) => void;

  // Pending message
  setPendingMessage: (message: string | null) => void;
  setPendingTransactionId: (transactionId: string | null) => void;

  // Voice mode overlay
  setVoiceModeOpen: (isOpen: boolean) => void;

  // Voice transcript persistence
  addVoiceMessage: (chatId: string, message: ChatMessage) => void;
  clearVoiceMessages: (chatId: string) => void;

  // Reset
  resetChatState: () => void;
}

const initialState: ChatState = {
  streamingMessages: {},
  streamingProgress: {},
  typingChats: {},
  pendingDrafts: {},
  activeChatId: null,
  pendingMessage: null,
  pendingTransactionId: null,
  isVoiceModeOpen: false,
  voiceMessagesByChat: {},
};

export const useChatStore = create<ChatState & ChatActions>((set) => ({
  ...initialState,

  setStreamingMessage: (chatId, content) =>
    set((state) => ({
      streamingMessages: { ...state.streamingMessages, [chatId]: content },
    })),

  clearStreamingMessage: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.streamingMessages;
      return { streamingMessages: rest };
    }),

  setStreamingProgress: (chatId, progress) =>
    set((state) => ({
      streamingProgress: { ...state.streamingProgress, [chatId]: progress },
    })),

  setTypingStatus: (chatId, isTyping) =>
    set((state) => ({
      typingChats: { ...state.typingChats, [chatId]: isTyping },
    })),

  clearTypingStatus: (chatId) =>
    set((state) => {
      const { [chatId]: _, ...rest } = state.typingChats;
      return { typingChats: rest };
    }),

  addDraft: (draft) =>
    set((state) => ({
      pendingDrafts: { ...state.pendingDrafts, [draft.id]: draft },
    })),

  removeDraft: (draftId) =>
    set((state) => {
      const { [draftId]: _, ...rest } = state.pendingDrafts;
      return { pendingDrafts: rest };
    }),

  clearAllDrafts: () =>
    set(() => ({
      pendingDrafts: {},
    })),

  setActiveChatId: (chatId) =>
    set(() => ({
      activeChatId: chatId,
    })),

  setPendingMessage: (message) =>
    set(() => ({
      pendingMessage: message,
    })),

  setPendingTransactionId: (transactionId) =>
    set(() => ({
      pendingTransactionId: transactionId,
    })),

  setVoiceModeOpen: (isOpen) =>
    set(() => ({
      isVoiceModeOpen: isOpen,
    })),

  addVoiceMessage: (chatId, message) =>
    set((state) => ({
      voiceMessagesByChat: {
        ...state.voiceMessagesByChat,
        [chatId]: [...(state.voiceMessagesByChat[chatId] || []), message],
      },
    })),

  clearVoiceMessages: (chatId) =>
    set((state) => {
      const { [chatId]: _deleted, ...rest } = state.voiceMessagesByChat;
      return { voiceMessagesByChat: rest };
    }),

  resetChatState: () => set(() => initialState),
}));
