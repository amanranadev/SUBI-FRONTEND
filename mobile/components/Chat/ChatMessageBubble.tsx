import { colors } from '@/constants/colors';
import { ChatMessage } from '@/types/chat';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AssistantMessage from './AssistantMessage';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
}

// Helper function for time formatting
const formatTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isStreaming = false,
}) => {
  const isUser = message.role === 'user';
  const isVoiceStyledMessage = message.id.startsWith('voice-');

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? (isVoiceStyledMessage ? styles.voiceUserBubble : styles.userBubble)
            : styles.assistantBubble,
        ]}
      >
        {isUser ? (
          <Text
            style={[
              styles.messageText,
              isVoiceStyledMessage ? styles.voiceUserText : styles.userText,
            ]}
          >
            {message.content}
          </Text>
        ) : (
          <AssistantMessage
            content={message.content}
            isVoiceMode={isVoiceStyledMessage}
            isStreaming={isStreaming}
          />
        )}
      </View>
      <Text
        style={[
          styles.timestamp,
          isUser ? styles.userTimestamp : styles.assistantTimestamp,
        ]}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  userBubble: {
    backgroundColor: '#F7F2EE',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  assistantBubble: {
    maxWidth: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    borderBottomLeftRadius: 0,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.31,
  },
  userText: {
    color: '#282927',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.08,
  },
  voiceUserBubble: {
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  voiceUserText: {
    color: colors.gray[800],
    fontWeight: '400',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0,
    fontFamily: 'Inter',
  },
  assistantText: {
    color: colors.gray[800],
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
  },
  userTimestamp: {
    color: colors.gray[600],
  },
  assistantTimestamp: {
    color: colors.gray[600],
  },
});
