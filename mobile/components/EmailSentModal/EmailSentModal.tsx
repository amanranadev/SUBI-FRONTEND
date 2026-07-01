import CircleCheck from '@/assets/icons/CircleCheck';
import { colors } from '@/constants/colors';
import { Contact } from '@/types/message';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Button from '../Button/Button';
import { ButtonStyleOverrides } from '../Button/types';

interface EmailSentModalProps {
  recipient?: Contact | string;
  title?: string;
  onViewInGmail?: () => void;
  onClose?: () => void;
}

// Default values
const defaultRecipient: Contact = {
  id: '1',
  name: 'John Smith',
  email: 'john.smith@example.com',
  phone: null,
};

const defaultTitle = "Email sent successfully!";

const EmailSentModal = forwardRef<BottomSheetModal, EmailSentModalProps>(
  ({ recipient = defaultRecipient, title = defaultTitle, onViewInGmail, onClose }, ref) => {
    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
          style={styles.backdrop}
        />
      ),
      []
    );
    const snapPoints = useMemo(() => ["45%"], []);

    // Handle recipient - can be Contact object or string
    const recipientName = typeof recipient === 'string' ? recipient : recipient.name;
    const description = `Sent to ${recipientName}`;

    return (
      <BottomSheetModal 
        ref={ref as any} 
        index={0} 
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.modalBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.container}>
          <CircleCheck width={64} height={64} color={'#27B43E'}/>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.buttonContainer}>
            <Button
              text="View in Gmail"
              onPress={onViewInGmail || (() => {})}
              variant="white"
              icon={
                <Ionicons 
                  name="open-outline" 
                  size={16} 
                  color={colors.gray[800]} 
                />
              }
              styleOverrides={{
                ...baseButtonStyle,
                ...viewGmailButtonStyle,
              }}
            />
            <Button
              text="Close"
              onPress={onClose || (() => {})}
              variant="orange"
              icon={
                <Ionicons 
                  name="close" 
                  size={16} 
                  color={colors.white} 
                />
              }
              styleOverrides={{
                ...baseButtonStyle,
                ...closeButtonStyle,
              }}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
);

export { EmailSentModal };

// Base button style with common properties
const baseButtonStyle: ButtonStyleOverrides = {
  width: 345,
  height: 36,
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
}

// Button-specific overrides (base style is applied directly in component)
const viewGmailButtonStyle: ButtonStyleOverrides = {
  borderWidth: 1.72,
  borderColor: colors.primary[300],
  textColor: colors.gray[800],
}

const closeButtonStyle: ButtonStyleOverrides = {
  borderColor: colors.gray[300],
  textColor: colors.white,
  backgroundColor: colors.brickOrange,
}

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.black,
    opacity: 0.5,
  },
  handle: {
    backgroundColor: colors.gray[300],
  },
  modalBackground: {
    backgroundColor: colors.gray[200],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  container: {
    flex: 1,
    paddingTop: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: -0.31,
    marginTop: 28,
  },
  description: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: -0.31,
    marginTop: 6,
  },
  buttonContainer: {
    width: 345,
    gap: 12,
    marginTop: 24,
  },
}); 