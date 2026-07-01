import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import UnionIcon from '@/assets/icons/UnionIcon';
import { ChatMessageList, MessageDraftCard } from '@/components/Chat';
import ConfirmActionModal from '@/components/Chat/ConfirmActionModal';
import TextEntryModal from '@/components/Chat/TextEntryModal';
import VoiceModeBackground from '@/components/Chat/VoiceModeBackground';
import { colors } from '@/constants/colors';
import { chatKeys, useChatManagement } from '@/hooks/useChat';
import { getToken } from '@/services/authService';
import chatWebSocketService from '@/services/chatWebSocketService';
import { useChatStore } from '@/stores/chatStore';
import { ChatMessage, MessageDraft } from '@/types/chat';
import { Feather, FontAwesome6, Ionicons, Octicons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';

const FALLBACK_SYNC_INTERVAL_MS = 2500;
const FALLBACK_TYPING_TIMEOUT_MS = 45000;
const CHAT_MENU_TITLE_MAX_LENGTH = 30;

type TypingSession = {
  chatId: string;
  startedAt: number;
  baselineAssistantMessageId: string | null;
  baselineDraftIds: Set<string>;
};

export const ChatScreen: React.FC = () => {
  const navigation = useNavigation();
  const router = useRouter();
  const { chatId: paramChatId, initialMessage } = useLocalSearchParams<{
    chatId?: string;
    initialMessage?: string;
  }>();

  const [activeChatId, setActiveChatId] = useState<string | null>(
    paramChatId || null
  );
  const [activeDraft, setActiveDraft] = useState<MessageDraft | null>(null);
  const [processingUserMessage, setProcessingUserMessage] = useState<string | null>(null);
  const [isChatMenuOpen, setIsChatMenuOpen] = useState(false);
  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [renameTitle, setRenameTitle] = useState('');

  const initialMessageProcessed = useRef(false);
  const pendingMessageProcessed = useRef(false);
  const activeChatIdRef = useRef<string | null>(activeChatId);
  const currentChatRef = useRef<{ messages?: ChatMessage[] } | null>(null);
  const typingSessionRef = useRef<TypingSession | null>(null);
  const knownDraftIdsRef = useRef<Set<string>>(new Set());

  const queryClient = useQueryClient();

  const {
    currentChat,
    drafts,
    createChat,
    sendMessage,
    sendDraft,
    cancelDraft,
    updateChat,
    isUpdating,
    deleteChat,
    isDeleting,
    isSendingDraft,
    isLoadingChat,
    refetchChat,
    refetchDrafts,
  } = useChatManagement(activeChatId || undefined);

  const {
    streamingMessages,
    typingChats,
    pendingMessage,
    pendingTransactionId,
    setStreamingMessage,
    clearStreamingMessage,
    setTypingStatus,
    setActiveChatId: setStoreActiveChatId,
    setPendingMessage,
    setPendingTransactionId,
    addDraft,
    removeDraft,
    isVoiceModeOpen,
    setVoiceModeOpen,
    voiceMessagesByChat,
    clearVoiceMessages,
  } = useChatStore();

  const getLatestAssistantMessageId = useCallback((messages: ChatMessage[] = []) => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].role === 'assistant') {
        return messages[i].id;
      }
    }
    return null;
  }, []);

  const stopTypingForChat = useCallback(
    (chatId: string, showTimeoutToast = false) => {
      setTypingStatus(chatId, false);
      clearStreamingMessage(chatId);

      if (typingSessionRef.current?.chatId === chatId) {
        typingSessionRef.current = null;
      }

      if (showTimeoutToast) {
        Toast.show({
          type: 'error',
          text1: 'Response timed out',
          text2: 'No completion was received. Pull to refresh and try again.',
        });
      }
    },
    [setTypingStatus, clearStreamingMessage]
  );

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
    currentChatRef.current = currentChat || null;
  }, [currentChat]);

  useEffect(() => {
    const nextKnownDraftIds = new Set<string>();

    drafts.forEach((draft) => {
      nextKnownDraftIds.add(draft.id);
    });

    if (activeDraft) {
      nextKnownDraftIds.add(activeDraft.id);
    }

    knownDraftIdsRef.current = nextKnownDraftIds;
  }, [drafts, activeDraft]);

  // Reset state when screen is focused without a chatId param
  useFocusEffect(
    useCallback(() => {
      if (!paramChatId) {
        setActiveChatId(null);
        setStoreActiveChatId(null);
        setProcessingUserMessage(null);
        initialMessageProcessed.current = false;
      }
    }, [
      paramChatId,
      setStoreActiveChatId,
    ])
  );

  // Sync activeChatId with URL param when it changes
  useEffect(() => {
    initialMessageProcessed.current = false;
    const newChatId = paramChatId || null;
    setActiveChatId(newChatId);
    if (!newChatId) {
      setStoreActiveChatId(null);
    }
  }, [
    paramChatId,
    setStoreActiveChatId,
  ]);

  // Subscribe to WebSocket events as soon as the screen mounts.
  useEffect(() => {
    const unsubscribeTyping = chatWebSocketService.onTyping((chatId, isTyping) => {
      setTypingStatus(chatId, isTyping);
      if (!isTyping) {
        clearStreamingMessage(chatId);
      }
    });

    const unsubscribeStreaming = chatWebSocketService.onStreaming(
      (chatId, content, isFinal) => {
        if (isFinal) {
          clearStreamingMessage(chatId);
          if (chatId === activeChatIdRef.current) {
            void refetchChat();
            void refetchDrafts();
          }
        } else {
          setStreamingMessage(chatId, content);
        }
      }
    );

    const unsubscribeChatUpdated = chatWebSocketService.onChatUpdated((chatId, _messages) => {
      setTypingStatus(chatId, false);
      clearStreamingMessage(chatId);

      if (chatId === activeChatIdRef.current) {
        void refetchChat();
        void refetchDrafts();
      }
    });

    const unsubscribeDraft = chatWebSocketService.onDraftCreated((draft) => {
      setActiveDraft(draft);
      addDraft(draft);

      const currentActiveChatId = activeChatIdRef.current;
      if (currentActiveChatId) {
        stopTypingForChat(currentActiveChatId);
      }

      void refetchDrafts();
    });

    const unsubscribeError = chatWebSocketService.onError((error) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message,
      });

      if (error.chatId) {
        stopTypingForChat(error.chatId);
      }
    });

    return () => {
      unsubscribeTyping();
      unsubscribeStreaming();
      unsubscribeChatUpdated();
      unsubscribeDraft();
      unsubscribeError();
    };
  }, [
    addDraft,
    clearStreamingMessage,
    refetchChat,
    refetchDrafts,
    setStreamingMessage,
    setTypingStatus,
    stopTypingForChat,
  ]);

  // Keep chat websocket alive across route transitions; reconnect logic is inside the service.
  useEffect(() => {
    let cancelled = false;

    const connectWebSocket = async () => {
      const token = getToken();
      if (!token) {
        return;
      }

      try {
        await chatWebSocketService.connect(token);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error('Failed to connect to chat WebSocket:', error);
        Toast.show({
          type: 'error',
          text1: 'Connection failed',
          text2: 'Could not connect to chat service',
        });
      }
    };

    void connectWebSocket();

    return () => {
      cancelled = true;
    };
  }, []);

  // Fallback sync loop while waiting for AI completion.
  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    const isTyping = !!typingChats[activeChatId];

    if (!isTyping) {
      if (typingSessionRef.current?.chatId === activeChatId) {
        typingSessionRef.current = null;
      }
      return;
    }

    if (
      !typingSessionRef.current ||
      typingSessionRef.current.chatId !== activeChatId
    ) {
      typingSessionRef.current = {
        chatId: activeChatId,
        startedAt: Date.now(),
        baselineAssistantMessageId: getLatestAssistantMessageId(
          currentChatRef.current?.messages || []
        ),
        baselineDraftIds: new Set(knownDraftIdsRef.current),
      };
    }

    let isCancelled = false;
    let pollInFlight = false;

    const pollForCompletion = async () => {
      if (isCancelled || pollInFlight) {
        return;
      }

      const session = typingSessionRef.current;
      const currentChat = activeChatIdRef.current;

      if (!session || !currentChat || session.chatId !== currentChat) {
        return;
      }

      if (Date.now() - session.startedAt >= FALLBACK_TYPING_TIMEOUT_MS) {
        stopTypingForChat(session.chatId, true);
        return;
      }

      pollInFlight = true;

      try {
        const [chatResult, draftsResult] = await Promise.all([
          refetchChat(),
          refetchDrafts(),
        ]);

        if (isCancelled) {
          return;
        }

        const latestAssistantMessageId = getLatestAssistantMessageId(
          chatResult.data?.messages || []
        );

        if (
          latestAssistantMessageId &&
          latestAssistantMessageId !== session.baselineAssistantMessageId
        ) {
          stopTypingForChat(session.chatId);
          return;
        }

        const fetchedDrafts = draftsResult.data || [];
        const newlyCreatedDraft = fetchedDrafts.find(
          (draft) => !session.baselineDraftIds.has(draft.id)
        );

        if (newlyCreatedDraft) {
          addDraft(newlyCreatedDraft);
          setActiveDraft((existingDraft) => {
            if (existingDraft?.id === newlyCreatedDraft.id) {
              return existingDraft;
            }
            return newlyCreatedDraft;
          });
          stopTypingForChat(session.chatId);
        }
      } catch (error) {
        // Retry on next interval.
      } finally {
        pollInFlight = false;
      }
    };

    void pollForCompletion();
    const intervalId = setInterval(() => {
      void pollForCompletion();
    }, FALLBACK_SYNC_INTERVAL_MS);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [
    activeChatId,
    typingChats,
    addDraft,
    getLatestAssistantMessageId,
    refetchChat,
    refetchDrafts,
    stopTypingForChat,
  ]);

  // Sync activeChatId with store for SubiChat integration
  useEffect(() => {
    setStoreActiveChatId(activeChatId);
    return () => {
      setStoreActiveChatId(null);
    };
  }, [activeChatId, setStoreActiveChatId]);

  const handleSendMessage = useCallback(
    async (message: string) => {
      if (!activeChatId) {
        setProcessingUserMessage(message);

        try {
          const tempUserMessage = {
            id: `temp-${Date.now()}`,
            content: message,
            role: 'user' as const,
            timestamp: new Date().toISOString(),
          };

          const newChat = await createChat({
            title: message.substring(0, 50),
            initial_message: message,
          });

          const chatWithMessage = {
            ...newChat,
            messages: newChat.messages?.length > 0
              ? newChat.messages
              : [tempUserMessage],
          };

          queryClient.setQueryData(chatKeys.detail(newChat.id), chatWithMessage);
          setActiveChatId(newChat.id);
          setProcessingUserMessage(null);
          router.replace({ pathname: '/chat', params: { chatId: newChat.id } });
          setTypingStatus(newChat.id, true);
        } catch (error) {
          setProcessingUserMessage(null);
          Toast.show({
            type: 'error',
            text1: 'Failed to create chat',
          });
        }
      } else {
        sendMessage(
          { chatId: activeChatId, data: { message } },
          {
            onSuccess: () => {
              setTypingStatus(activeChatId, true);
            },
            onError: () => {
              stopTypingForChat(activeChatId);
            },
          }
        );
      }
    },
    [
      activeChatId,
      createChat,
      queryClient,
      router,
      sendMessage,
      setTypingStatus,
      stopTypingForChat,
    ]
  );

  // Handle initial message from navigation params
  useEffect(() => {
    if (initialMessage && !initialMessageProcessed.current) {
      initialMessageProcessed.current = true;
      setProcessingUserMessage(initialMessage);
      void handleSendMessage(initialMessage);
    }
  }, [initialMessage, handleSendMessage]);

  // Handle pending messages from SubiChat - send to active chat or create new
  useEffect(() => {
    if (pendingMessage && !pendingMessageProcessed.current) {
      pendingMessageProcessed.current = true;
      const messageToSend = pendingMessage;
      const transactionIdForChat = pendingTransactionId || undefined;

      setPendingMessage(null);
      setPendingTransactionId(null);

      // If there's already an active chat, send the message to it
      if (activeChatId) {
        pendingMessageProcessed.current = false;
        sendMessage(
          { chatId: activeChatId, data: { message: messageToSend } },
          {
            onSuccess: () => {
              setTypingStatus(activeChatId, true);
            },
            onError: () => {
              stopTypingForChat(activeChatId);
              Toast.show({
                type: 'error',
                text1: 'Failed to send message',
              });
            },
          }
        );
        return;
      }

      // No active chat - create a new one
      setProcessingUserMessage(messageToSend);
      setActiveChatId(null);
      setStoreActiveChatId(null);

      const createNewChat = async () => {
        try {
          const tempUserMessage = {
            id: `temp-${Date.now()}`,
            content: messageToSend,
            role: 'user' as const,
            timestamp: new Date().toISOString(),
          };

          const newChat = await createChat({
            title: messageToSend.substring(0, 50),
            initial_message: messageToSend,
            transaction_id: transactionIdForChat,
          });

          const chatWithMessage = {
            ...newChat,
            messages: newChat.messages?.length > 0
              ? newChat.messages
              : [tempUserMessage],
          };

          queryClient.setQueryData(chatKeys.detail(newChat.id), chatWithMessage);
          setActiveChatId(newChat.id);
          setProcessingUserMessage(null);
          router.replace({ pathname: '/chat', params: { chatId: newChat.id } });
          setTypingStatus(newChat.id, true);
        } catch (error) {
          setProcessingUserMessage(null);
          Toast.show({
            type: 'error',
            text1: 'Failed to create chat',
          });
        } finally {
          pendingMessageProcessed.current = false;
        }
      };

      setTimeout(createNewChat, 100);
    }
  }, [
    pendingMessage,
    pendingTransactionId,
    activeChatId,
    createChat,
    queryClient,
    router,
    sendMessage,
    setPendingMessage,
    setPendingTransactionId,
    setStoreActiveChatId,
    setTypingStatus,
    stopTypingForChat,
  ]);

  const handleSendDraft = useCallback(() => {
    if (activeDraft) {
      sendDraft(activeDraft.id, {
        onSuccess: () => {
          removeDraft(activeDraft.id);
          setActiveDraft(null);
          Toast.show({
            type: 'success',
            text1: `${activeDraft.message_type === 'email' ? 'Email' : 'SMS'} sent!`,
          });
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Failed to send',
            text2: 'Please try again',
          });
        },
      });
    }
  }, [activeDraft, removeDraft, sendDraft]);

  const handleCancelDraft = useCallback(() => {
    if (activeDraft) {
      cancelDraft(activeDraft.id, {
        onSuccess: () => {
          removeDraft(activeDraft.id);
          setActiveDraft(null);
        },
      });
    }
  }, [activeDraft, cancelDraft, removeDraft]);

  const voiceChatKey = activeChatId || '__voice_default__';
  const persistedVoiceMessages = voiceMessagesByChat[voiceChatKey] || [];
  const messages = useMemo(() => {
    const mergedMessages = [...(currentChat?.messages || []), ...persistedVoiceMessages];
    return mergedMessages.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [currentChat?.messages, persistedVoiceMessages]);
  const isTyping = activeChatId ? !!typingChats[activeChatId] : false;
  const streamingContent = activeChatId
    ? streamingMessages[activeChatId]
    : undefined;

  const handleDrawerToggle = useCallback(() => {
    navigation.dispatch(DrawerActions.toggleDrawer());
  }, [navigation]);

  const handleStartNewChat = useCallback(() => {
    setIsChatMenuOpen(false);
    setVoiceModeOpen(false);
    if (activeChatId) {
      clearVoiceMessages(activeChatId);
    }
    clearVoiceMessages('__voice_default__');
    setProcessingUserMessage(null);
    setActiveDraft(null);
    setActiveChatId(null);
    setStoreActiveChatId(null);
    router.replace('/chat');
  }, [activeChatId, clearVoiceMessages, router, setStoreActiveChatId, setVoiceModeOpen]);

  const handleChatMenuToggle = useCallback(() => {
    setIsChatMenuOpen((prev) => !prev);
  }, []);

  const handleCloseChatMenu = useCallback(() => {
    setIsChatMenuOpen(false);
  }, []);

  const currentChatTitle = currentChat?.title?.trim() || "Today's to-do list";
  const chatMenuTitle =
    currentChatTitle.length > CHAT_MENU_TITLE_MAX_LENGTH
      ? `${currentChatTitle.slice(0, CHAT_MENU_TITLE_MAX_LENGTH - 3).trimEnd()}...`
      : currentChatTitle;

  const handleOpenRenameModal = useCallback(() => {
    if (!activeChatId) {
      setIsChatMenuOpen(false);
      return;
    }

    setRenameTitle(currentChatTitle);
    setIsChatMenuOpen(false);
    setIsRenameModalOpen(true);
  }, [activeChatId, currentChatTitle]);

  const handleCloseRenameModal = useCallback(() => {
    if (isUpdating) {
      return;
    }
    setIsRenameModalOpen(false);
  }, [isUpdating]);

  const handleRenameChat = useCallback(() => {
    const nextTitle = renameTitle.trim();

    if (!activeChatId || !nextTitle) {
      setIsRenameModalOpen(false);
      return;
    }

    if (nextTitle === currentChatTitle) {
      setIsRenameModalOpen(false);
      return;
    }

    updateChat(
      { chatId: activeChatId, data: { title: nextTitle } },
      {
        onSuccess: () => {
          setIsRenameModalOpen(false);
          Toast.show({
            type: 'success',
            text1: 'Chat renamed',
          });
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Failed to rename chat',
          });
        },
      }
    );
  }, [activeChatId, currentChatTitle, renameTitle, updateChat]);

  const handleDeleteChat = useCallback(() => {
    if (!activeChatId) {
      setIsChatMenuOpen(false);
      return;
    }

    deleteChat(activeChatId, {
      onSuccess: () => {
        clearVoiceMessages(activeChatId);
        setIsChatMenuOpen(false);
        setIsRenameModalOpen(false);
        setIsDeleteModalOpen(false);
        setRenameTitle('');
        setActiveDraft(null);
        setProcessingUserMessage(null);
        setActiveChatId(null);
        setStoreActiveChatId(null);
        router.replace('/chat');
        Toast.show({
          type: 'success',
          text1: 'Chat deleted',
        });
      },
      onError: () => {
        setIsChatMenuOpen(false);
        setIsDeleteModalOpen(false);
        Toast.show({
          type: 'error',
          text1: 'Failed to delete chat',
        });
      },
    });
  }, [activeChatId, clearVoiceMessages, deleteChat, router, setStoreActiveChatId]);

  const handleOpenDeleteModal = useCallback(() => {
    if (!activeChatId) {
      setIsChatMenuOpen(false);
      return;
    }

    setIsChatMenuOpen(false);
    setIsDeleteModalOpen(true);
  }, [activeChatId]);

  const handleCloseDeleteModal = useCallback(() => {
    if (isDeleting) {
      return;
    }
    setIsDeleteModalOpen(false);
  }, [isDeleting]);

  return (
    <GestureHandlerRootView style={styles.gestureRoot}>
      <BottomSheetModalProvider>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          {isVoiceModeOpen && <VoiceModeBackground />}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={handleDrawerToggle}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={24} color={colors.gray[800]} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <UnionIcon width={80} height={22} color={colors.brickOrange} />
            </View>

            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.actionIconButton}
                onPress={handleOpenRenameModal}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="pen-to-square" size={24} color={colors.gray[800]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionIconButton}
                onPress={handleChatMenuToggle}
                activeOpacity={0.7}
              >
                <Ionicons name="ellipsis-horizontal" size={24} color={colors.gray[800]} />
              </TouchableOpacity>
            </View>
          </View>

          {isChatMenuOpen && (
            <View style={styles.chatMenuOverlay}>
              <TouchableOpacity
                style={styles.chatMenuBackdrop}
                activeOpacity={1}
                onPress={handleCloseChatMenu}
              />

              <View style={styles.chatMenu}>
                <Text style={styles.chatMenuTitle} numberOfLines={1} ellipsizeMode="tail">
                  {chatMenuTitle}
                </Text>

                <TouchableOpacity
                  style={styles.chatMenuItem}
                  activeOpacity={0.7}
                  onPress={handleOpenRenameModal}
                >
                  <Octicons name="pencil" size={24} color={colors.gray[800]} />
                  <Text style={styles.chatMenuRenameText}>Rename</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.chatMenuItem}
                  activeOpacity={0.7}
                  onPress={handleOpenDeleteModal}
                  disabled={isDeleting}
                >
                  <Feather name="trash" size={24} color="#EF4444" />
                  <Text style={styles.chatMenuDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {isDeleteModalOpen && (
            <ConfirmActionModal
              visible={isDeleteModalOpen}
              isLoading={isDeleting}
              onClose={handleCloseDeleteModal}
              onConfirm={handleDeleteChat}
              title="Delete chat"
              bodyText="Are you sure you want to delete this chat? This action can't be undone."
              confirmLabel="Delete"
              cardStyle={styles.deleteModalCard}
            />
          )}

          <TextEntryModal
            visible={isRenameModalOpen}
            title="Rename chat"
            value={renameTitle}
            isSubmitting={isUpdating}
            onClose={handleCloseRenameModal}
            onChangeText={setRenameTitle}
            onConfirm={handleRenameChat}
            placeholder="Today's to-do list"
            confirmLabel="OK"
            cancelLabel="Cancel"
          />

          <View style={styles.content}>
            <ChatMessageList
              messages={messages}
              isTyping={isTyping}
              streamingContent={streamingContent}
              isLoading={!!activeChatId && isLoadingChat}
              pendingUserMessage={processingUserMessage ?? undefined}
              onSuggestionPress={handleSendMessage}
              isVoiceMode={isVoiceModeOpen}
            />

            {activeDraft && (
              <MessageDraftCard
                draft={activeDraft}
                onSend={handleSendDraft}
                onCancel={handleCancelDraft}
                isSending={isSendingDraft}
              />
            )}
          </View>

        </SafeAreaView>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  gestureRoot: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginLeft: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  actionsContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[100],
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 16,
  },
  actionIconButton: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  chatMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  chatMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  chatMenu: {
    position: 'absolute',
    top: 64,
    right: 20,
    width: 240,
    borderRadius: 24,
    paddingTop: 10,
    paddingRight: 16,
    paddingBottom: 10,
    paddingLeft: 16,
    gap: 16,
    backgroundColor: colors.gray[100],
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 10,
  },
  chatMenuTitle: {
    maxWidth: 208,
    color: colors.gray[600],
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.06,
    fontFamily: 'Inter',
  },
  chatMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  chatMenuRenameText: {
    color: colors.gray[800],
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 15,
    letterSpacing: 0.075,
    fontFamily: 'Inter',
  },
  chatMenuDeleteText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 15,
    letterSpacing: 0.075,
    fontFamily: 'Inter',
  },
  deleteModalCard: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
});

export default ChatScreen;
