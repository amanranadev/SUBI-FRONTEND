import React from 'react';
import { act, render, waitFor } from '@testing-library/react-native';

import ChatScreen from '@/screens/Chat';
import { useChatManagement } from '@/hooks/useChat';
import { useChatStore } from '@/stores/chatStore';

const mockSetQueryData = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    setQueryData: mockSetQueryData,
  }),
}));

jest.mock('expo-router', () => ({
  useFocusEffect: jest.fn(),
  useLocalSearchParams: jest.fn(() => ({})),
  useRouter: jest.fn(() => ({
    replace: jest.fn(),
    push: jest.fn(),
  })),
}));

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react');
  return {
    BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

let lastChatMessageListProps: any = null;

jest.mock('@/components/Chat', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    ChatMessageList: (props: any) => {
      lastChatMessageListProps = props;
      return React.createElement(View, { testID: 'chat-message-list' });
    },
    MessageDraftCard: ({ draft }: { draft: { id: string } }) =>
      React.createElement(View, {
        testID: `message-draft-card-${draft.id}`,
      }),
  };
});

jest.mock('@/components/Header/Header', () => {
  const React = require('react');
  const { View } = require('react-native');
  return () => React.createElement(View, { testID: 'chat-header' });
});

const mockShowToast = jest.fn();

jest.mock('react-native-toast-message', () => ({
  show: (...args: unknown[]) => mockShowToast(...args),
}));

const mockConnect = jest.fn(() => Promise.resolve());
const mockOnTyping = jest.fn(() => jest.fn());
const mockOnStreaming = jest.fn(() => jest.fn());
const mockOnChatUpdated = jest.fn(() => jest.fn());
const mockOnDraftCreated = jest.fn(() => jest.fn());
const mockOnError = jest.fn(() => jest.fn());

jest.mock('@/services/chatWebSocketService', () => ({
  __esModule: true,
  default: {
    connect: mockConnect,
    onTyping: mockOnTyping,
    onStreaming: mockOnStreaming,
    onChatUpdated: mockOnChatUpdated,
    onDraftCreated: mockOnDraftCreated,
    onError: mockOnError,
  },
}));

jest.mock('@/services/authService', () => ({
  getToken: jest.fn(() => 'header.payload.signature'),
}));

jest.mock('@/hooks/useChat', () => ({
  chatKeys: {
    detail: (id: string) => ['chats', 'detail', id],
  },
  useChatManagement: jest.fn(),
}));

const mockUseChatManagement = useChatManagement as jest.MockedFunction<typeof useChatManagement>;

describe('ChatScreen Open Escrow fallback polling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    lastChatMessageListProps = null;

    act(() => {
      useChatStore.getState().resetChatState();
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    act(() => {
      useChatStore.getState().resetChatState();
    });
  });

  test('uses polling fallback to stop typing and surface draft when websocket events are missed', async () => {
    const draft = {
      id: 'draft-1',
      recipient_name: 'Escrow Agent',
      recipient_email: 'escrow@example.com',
      message_type: 'email' as const,
      subject: 'Open escrow',
      body: 'Hello, please open escrow.',
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    const chatsById: Record<string, any> = {};
    const createChatMock = jest.fn(async (data: { initial_message: string }) => {
      const chat = {
        id: 'chat-1',
        title: 'Escrow chat',
        status: 'active',
        message_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: 'user-1',
        messages: [
          {
            id: 'user-message-1',
            role: 'user',
            content: data.initial_message,
            timestamp: new Date().toISOString(),
          },
        ],
      };
      chatsById[chat.id] = chat;
      return chat;
    });

    const sendMessageMock = jest.fn();
    const sendDraftMock = jest.fn();
    const cancelDraftMock = jest.fn();

    const draftPollQueue: any[] = [[], [draft], [draft]];

    const refetchChatMock = jest.fn(async () => ({
      data: chatsById['chat-1'],
    }));
    const refetchDraftsMock = jest.fn(async () => {
      const nextDrafts = draftPollQueue.length > 1
        ? draftPollQueue.shift()
        : draftPollQueue[0] || [];
      return { data: nextDrafts };
    });

    mockUseChatManagement.mockImplementation((chatId?: string) => ({
      chats: [],
      currentChat: chatId ? chatsById[chatId] : undefined,
      drafts: [],
      isLoadingChats: false,
      isLoadingChat: false,
      isLoadingDrafts: false,
      isChatsError: false,
      isChatError: false,
      chatsError: null,
      chatError: null,
      createChat: createChatMock,
      updateChat: jest.fn(),
      deleteChat: jest.fn(),
      sendMessage: sendMessageMock,
      sendDraft: sendDraftMock,
      cancelDraft: cancelDraftMock,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,
      isSending: false,
      isSendingDraft: false,
      isCancellingDraft: false,
      isCreateSuccess: false,
      isSendSuccess: false,
      isSendDraftSuccess: false,
      isCreateError: false,
      isSendError: false,
      createError: null,
      sendError: null,
      refetchChats: jest.fn(),
      refetchChat: refetchChatMock,
      refetchDrafts: refetchDraftsMock,
    } as any));

    useChatStore.getState().setPendingTransactionId('txn-123');
    useChatStore.getState().setPendingMessage('Open escrow for this transaction');

    const { queryByTestId } = render(<ChatScreen />);

    await act(async () => {
      jest.advanceTimersByTime(100);
    });

    await waitFor(() => {
      expect(createChatMock).toHaveBeenCalledWith(
        expect.objectContaining({
          initial_message: 'Open escrow for this transaction',
          transaction_id: 'txn-123',
        })
      );
    });

    expect(useChatStore.getState().typingChats['chat-1']).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(2600);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(refetchChatMock).toHaveBeenCalled();
      expect(refetchDraftsMock).toHaveBeenCalled();
      expect(useChatStore.getState().typingChats['chat-1']).toBe(false);
      expect(queryByTestId('message-draft-card-draft-1')).toBeTruthy();
    });

    expect(lastChatMessageListProps?.isTyping).toBe(false);
    expect(mockShowToast).not.toHaveBeenCalledWith(
      expect.objectContaining({ text1: 'Response timed out' })
    );
  });
});
