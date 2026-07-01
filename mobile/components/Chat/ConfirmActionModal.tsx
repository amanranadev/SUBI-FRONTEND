import { colors } from '@/constants/colors';
import React from 'react';
import { Modal, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import ModalActionButton from './ModalActionButton';

interface ConfirmActionModalProps {
  visible: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  bodyText: string;
  confirmLabel?: string;
  confirmTextColor?: string;
  cardStyle?: StyleProp<ViewStyle>;
}

export const ConfirmActionModal: React.FC<ConfirmActionModalProps> = ({
  visible,
  isLoading = false,
  onClose,
  onConfirm,
  title,
  bodyText,
  confirmLabel = 'Confirm',
  confirmTextColor = '#EF4444',
  cardStyle,
}) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={[styles.card, cardStyle]}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{bodyText}</Text>
          <ModalActionButton
            label={confirmLabel}
            onPress={onConfirm}
            disabled={isLoading}
            containerStyle={styles.confirmButton}
            textStyle={[styles.confirmText, { color: confirmTextColor }]}
          />
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
  },
  card: {
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
  title: {
    color: colors.gray[800],
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.08,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
  body: {
    width: 208,
    color: colors.gray[700],
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.07,
    fontWeight: '400',
    fontFamily: 'Inter',
  },
  confirmButton: {
    width: 208,
  },
  confirmText: {
    color: '#EF4444',
  },
});

export default ConfirmActionModal;
