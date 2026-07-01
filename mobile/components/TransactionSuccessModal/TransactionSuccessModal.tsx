import CircleCheck from '@/assets/icons/CircleCheck';
import { colors } from '@/constants/colors';
import { useChatStore } from '@/stores/chatStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import { Modal, StyleSheet, Text, View, Dimensions, TouchableOpacity } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Button from '../Button/Button';
import { ButtonStyleOverrides } from '../Button/types';

interface TransactionSuccessModalProps {
  visible: boolean;
  transactionId: string | null;
  onCreateAnother: () => void;
  onClose: () => void;
}

const TransactionSuccessModal: React.FC<TransactionSuccessModalProps> = ({
  visible,
  transactionId,
  onCreateAnother,
  onClose,
}) => {
  const router = useRouter();
  const confettiRef = useRef<any>(null);
  const { setPendingMessage, setPendingTransactionId } = useChatStore();

  useEffect(() => {
    if (visible) {
      // Small delay to ensure modal is visible before firing confetti
      const timer = setTimeout(() => {
        confettiRef.current?.start();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const handleViewTransaction = () => {
    onClose();
    if (transactionId) {
      router.push({
        pathname: '/transactionsDetails',
        params: { transactionId },
      });
    }
  };

  const handleCreateAnother = () => {
    onClose();
    onCreateAnother();
  };

  const handleOpenEscrow = () => {
    onClose();
    if (transactionId) {
      const escrowMessage = `I just created a new transaction (ID: ${transactionId}). Please help me send an email to open escrow: look up this transaction, suggest closing/escrow contacts from my contacts if the transaction doesn't have an escrow email, and create a draft for me to review.`;
      setPendingTransactionId(transactionId);
      setPendingMessage(escrowMessage);
      router.push('/chat');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color={colors.gray[500]} />
          </TouchableOpacity>
          <CircleCheck width={64} height={64} color={'#27B43E'} />
          <Text style={styles.title}>You're all set!</Text>
          <Text style={styles.description}>
            Your tasks are on your dashboard and we have added the deadlines on your calendar.
          </Text>
          <Text style={styles.whatsNext}>What's next?</Text>
          <View style={styles.buttonContainer}>
            <Button
              text="View Transaction"
              onPress={handleViewTransaction}
              variant="white"
              icon={
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color={colors.gray[800]}
                />
              }
              styleOverrides={{
                ...baseButtonStyle,
                ...viewTransactionButtonStyle,
              }}
            />
            <Button
              text="Create Another"
              onPress={handleCreateAnother}
              variant="orange"
              icon={
                <Ionicons
                  name="add"
                  size={16}
                  color={colors.white}
                />
              }
              styleOverrides={{
                ...baseButtonStyle,
                ...createAnotherButtonStyle,
              }}
            />
          </View>
          <View style={styles.escrowSection}>
            <Text style={styles.escrowTitle}>Want to open escrow?</Text>
            <Text style={styles.escrowDescription}>
              I'll pull up this transaction and draft an escrow-opening email for you to review and send.
            </Text>
            <Button
              text="Open Escrow"
              onPress={handleOpenEscrow}
              variant="white"
              icon={
                <Ionicons
                  name="mail-outline"
                  size={16}
                  color={colors.gray[800]}
                />
              }
              styleOverrides={{
                ...baseButtonStyle,
                ...escrowButtonStyle,
              }}
            />
          </View>
        </View>
      </View>
      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: Dimensions.get('window').width / 2, y: -10 }}
        autoStart={false}
        fadeOut
        fallSpeed={3000}
        explosionSpeed={350}
        colors={['#FD4D03', '#FF8A65', '#FFB74D', '#81C784', '#64B5F6', '#BA68C8']}
        style={styles.confetti}
      />
    </Modal>
  );
};

export { TransactionSuccessModal };

// Base button style with common properties
const baseButtonStyle: ButtonStyleOverrides = {
  width: '100%' as any,
  height: 44,
  borderRadius: 14,
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 16,
  paddingRight: 16,
  shadow: false,
  fontSize: 14,
  fontWeight: '500',
  lineHeight: 20,
  letterSpacing: -0.15,
};

// Button-specific overrides
const viewTransactionButtonStyle: ButtonStyleOverrides = {
  borderWidth: 1.72,
  borderColor: colors.primary[300],
  textColor: colors.gray[800],
};

const createAnotherButtonStyle: ButtonStyleOverrides = {
  borderColor: colors.gray[300],
  textColor: colors.white,
  backgroundColor: colors.brickOrange,
};

const escrowButtonStyle: ButtonStyleOverrides = {
  borderWidth: 1.72,
  borderColor: colors.primary[300],
  textColor: colors.gray[800],
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.gray[800],
    lineHeight: 28,
    textAlign: 'center',
    letterSpacing: -0.31,
    marginTop: 20,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: -0.31,
    marginTop: 8,
  },
  whatsNext: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: -0.31,
    marginTop: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  escrowSection: {
    width: '100%',
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    alignItems: 'center',
  },
  escrowTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.gray[700],
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: -0.31,
  },
  escrowDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[500],
    lineHeight: 20,
    textAlign: 'center',
    letterSpacing: -0.31,
    marginTop: 4,
    marginBottom: 16,
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
});
