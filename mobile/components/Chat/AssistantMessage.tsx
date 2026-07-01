import { colors } from '@/constants/colors';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface AssistantMessageProps {
  content: string;
  isVoiceMode: boolean;
  isStreaming?: boolean;
}

const markdownStyles = {
  body: {
    fontSize: 20,
    lineHeight: 30,
    letterSpacing: 0.1,
    color: colors.gray[800],
    fontWeight: '400' as const,
    fontFamily: 'Inter',
    margin: 0,
    padding: 0,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 28,
  },
  strong: {
    fontWeight: '600' as const,
    color: colors.gray[800],
  },
  em: {
    fontStyle: 'italic' as const,
    color: colors.gray[800],
  },
  listItem: {
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  code_inline: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  fence: {
    backgroundColor: colors.gray[100],
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  link: {
    color: colors.primary[400],
    textDecorationLine: 'underline' as const,
  },
  heading1: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
    color: colors.gray[800],
  },
  heading2: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 14,
    marginBottom: 6,
    color: colors.gray[800],
  },
  heading3: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginTop: 12,
    marginBottom: 4,
    color: colors.gray[800],
  },
};

export const AssistantMessage: React.FC<AssistantMessageProps> = ({
  content,
  isVoiceMode,
  isStreaming = false,
}) => {
  return (
    <View style={styles.markdownContainer}>
      <Markdown style={markdownStyles}>{content}</Markdown>
      {isStreaming && <Text style={styles.cursor}>|</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  markdownContainer: {
    width: '100%',
  },
  cursor: {
    color: colors.primary[400],
  },
});

export default AssistantMessage;
