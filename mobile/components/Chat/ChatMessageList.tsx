import React, { useRef, useEffect } from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { ChatMessage } from '@/types/chat';
import { ChatMessageBubble } from './ChatMessageBubble';
import { ChatTypingIndicator } from './ChatTypingIndicator';
import { colors } from '@/constants/colors';
import voiceWebSocketService, { VoiceState } from '@/services/voiceWebSocketService';

interface ChatMessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  streamingContent?: string;
  isLoading?: boolean;
  pendingUserMessage?: string;
  onSuggestionPress?: (question: string) => void;
  isVoiceMode?: boolean;
}

const PRESELECTION_QUESTIONS = [
  'What are my most urgent tasks?',
  'What documents do I need before closing?',
  'Draft me an email to a client about a transaction',
  'Send a message to a client about a transaction',
];

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  isTyping = false,
  streamingContent,
  isLoading = false,
  pendingUserMessage,
  onSuggestionPress,
  isVoiceMode = false,
}) => {
  const flatListRef = useRef<FlatList>(null);
  const [voiceState, setVoiceState] = React.useState<VoiceState>(
    voiceWebSocketService.getVoiceState()
  );

  useEffect(() => {
    if (!isVoiceMode) {
      return;
    }

    const unsubscribe = voiceWebSocketService.onVoiceState(setVoiceState);
    return () => unsubscribe();
  }, [isVoiceMode]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0 || isTyping || streamingContent) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages, isTyping, streamingContent]);

  const renderItem = ({ item, index }: { item: ChatMessage; index: number }) => {
    // Check if this is the last assistant message and we have streaming content
    const isLastAssistantMessage =
      item.role === 'assistant' && index === messages.length - 1;

    return (
      <ChatMessageBubble
        message={item}
        isStreaming={isLastAssistantMessage && !!streamingContent}
      />
    );
  };

  const renderFooter = () => {
    // Show streaming message as new bubble if no assistant message exists yet
    if (streamingContent && messages[messages.length - 1]?.role !== 'assistant') {
      return (
        <ChatMessageBubble
          message={{
            id: 'streaming',
            content: streamingContent,
            role: 'assistant',
            timestamp: new Date().toISOString(),
          }}
          isStreaming
        />
      );
    }

    if (isTyping) {
      return <ChatTypingIndicator />;
    }

    return null;
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary[400]} />
      <Text style={styles.loadingText}>Loading conversation...</Text>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return renderLoading();
    }

    // Show pending user message with typing indicator while chat is being created
    if (pendingUserMessage) {
      return (
        <View style={styles.pendingMessageContainer}>
          <ChatMessageBubble
            message={{
              id: 'pending-user',
              content: pendingUserMessage,
              role: 'user',
              timestamp: new Date().toISOString(),
            }}
            isStreaming={false}
          />
          <ChatTypingIndicator />
        </View>
      );
    }

    if (isVoiceMode) {
      const voiceStatusText =
        voiceState === 'recording'
          ? 'Listening...'
          : voiceState === 'processing'
            ? 'Thinking...'
            : voiceState === 'speaking'
              ? 'Speaking...'
              : 'Tap to start';

      return (
        <View style={styles.voiceEmptyContainer}>
          <Text style={styles.voiceStatusText}>{voiceStatusText}</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Start a conversation</Text>
        <Text style={styles.emptySubtitle}>
          Ask me anything about your transactions, tasks, or let me help you draft messages.
        </Text>
        <View style={styles.suggestionsContainer}>
          {PRESELECTION_QUESTIONS.map((question, index) => (
            <TouchableOpacity
              key={index}
              style={styles.suggestionCard}
              onPress={() => onSuggestionPress?.(question)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{question}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[
        styles.contentContainer,
        messages.length === 0 && styles.emptyContentContainer,
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={[styles.list, isVoiceMode && styles.voiceModeList]}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  voiceModeList: {
    backgroundColor: "transparent",
  },
  voiceEmptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  voiceStatusText: {
    fontSize: 24,
    fontWeight: '500',
    color: colors.gray[800],
    fontFamily: 'Inter',
    letterSpacing: 0.12,
    textAlign: 'center',
  },
  contentContainer: {
    paddingVertical: 16,
    flexGrow: 1,
  },
  emptyContentContainer: {
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  pendingMessageContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  suggestionsContainer: {
    width: '100%',
    gap: 12,
  },
  suggestionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  suggestionText: {
    fontSize: 14,
    color: colors.gray[700],
    lineHeight: 20,
  },
});
