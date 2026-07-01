import { colors } from '@/constants/colors';
import React from 'react';
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ModalActionButton from './ModalActionButton';

interface TextEntryModalProps {
  visible: boolean;
  title: string;
  value: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  maxLength?: number;
  isSubmitting?: boolean;
}

export const TextEntryModal: React.FC<TextEntryModalProps> = ({
  visible,
  title,
  value,
  onChangeText,
  onClose,
  onConfirm,
  placeholder = "Today's to-do list",
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
  maxLength = 60,
  isSubmitting = false,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>

          <View style={styles.inputContainer}>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={colors.gray[600]}
              style={styles.input}
              editable={!isSubmitting}
              maxLength={maxLength}
              autoCapitalize="sentences"
              autoCorrect={false}
            />
          </View>

          <View style={styles.actionsRow}>
            <ModalActionButton
              label={cancelLabel}
              onPress={onClose}
              disabled={isSubmitting}
              containerStyle={styles.actionButton}
            />
            <ModalActionButton
              label={confirmLabel}
              onPress={onConfirm}
              disabled={isSubmitting}
              containerStyle={styles.actionButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  card: {
    width: 340,
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
  title: {
    color: colors.gray[800],
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.08,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  inputContainer: {
    width: 308,
    height: 44,
    borderRadius: 20,
    justifyContent: 'center',
    backgroundColor: colors.gray[300],
    paddingLeft: 16,
    paddingRight: 8,
  },
  input: {
    color: colors.gray[600],
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.075,
    fontWeight: '500',
    fontFamily: 'Inter',
    paddingVertical: 0,
    paddingTop: Platform.OS === 'ios' ? 1 : 0,
    textAlignVertical: 'center',
  },
  actionsRow: {
    width: 308,
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
  },
});

export default TextEntryModal;
