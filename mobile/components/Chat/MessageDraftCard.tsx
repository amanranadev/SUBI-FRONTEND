import { colors } from '@/constants/colors';
import { MessageDraft } from '@/types/chat';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MessageDraftCardProps {
  draft: MessageDraft;
  onSend: () => void;
  onCancel: () => void;
  isSending?: boolean;
}

export const MessageDraftCard: React.FC<MessageDraftCardProps> = ({
  draft,
  onSend,
  onCancel,
  isSending = false,
}) => {
  const isEmail = draft.message_type === 'email';
  const icon = isEmail ? 'mail' : 'chatbubble';
  const typeLabel = isEmail ? 'EMAIL' : 'SMS';

  return (

    <View style={styles.containerWrapper}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name={icon} size={20} color={colors.primary[400]} />
          <Text style={styles.typeLabel}>Draft {typeLabel}</Text>
        </View>

        {/* Recipient info */}
        <View style={styles.recipientSection}>
          <Text style={styles.recipientLabel}>To: {draft.recipient_name}</Text>
          {draft.recipient_email && (
            <Text style={styles.recipientDetail}>{draft.recipient_email}</Text>
          )}
          {draft.recipient_phone && (
            <Text style={styles.recipientDetail}>{draft.recipient_phone}</Text>
          )}
          {draft.cc_emails && draft.cc_emails.length > 0 && (
            <Text style={styles.recipientDetail}>
              CC: {draft.cc_emails.join(', ')}
            </Text>
          )}
          {draft.subject && (
            <Text style={styles.subjectText}>Subject: {draft.subject}</Text>
          )}
        </View>

        {/* Body */}
        <ScrollView
          style={styles.bodySection}
          nestedScrollEnabled
          showsVerticalScrollIndicator={true}
        >
          <Text style={styles.bodyText}>{draft.body}</Text>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.sendButton, isSending && styles.disabledButton]}
            onPress={onSend}
            disabled={isSending}
          >
            <Text style={styles.sendButtonText}>
              {isSending ? 'Sending...' : `Send ${typeLabel}`}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cancelButton, isSending && styles.disabledCancelButton]}
            onPress={onCancel}
            disabled={isSending}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-end',
    zIndex: 9999,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[400],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  recipientSection: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  recipientLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[800],
    marginBottom: 4,
  },
  recipientDetail: {
    fontSize: 13,
    color: colors.gray[600],
    marginTop: 2,
  },
  subjectText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray[700],
    marginTop: 8,
  },
  bodySection: {
    paddingVertical: 12,
    maxHeight: 300,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: colors.gray[800],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  sendButton: {
    flex: 1,
    backgroundColor: colors.primary[400],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.buttonDisabled,
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.gray[300],
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledCancelButton: {
    opacity: 0.5,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray[700],
  },
});
