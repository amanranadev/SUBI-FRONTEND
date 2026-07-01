import { colors } from '@/constants/colors';
import { MessageComposedData, MessageComposedResponse } from '@/types/message';
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, { forwardRef, useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import Button from '../Button/Button';
import { ButtonStyleOverrides } from '../Button/types';
import { EmailReviewCard } from '../EmailReviewCard/EmailReviewCard';
import { VoiceInputButton } from './VoiceInputButton';

interface EmailReviewModalProps {
  messageData?: MessageComposedResponse | MessageComposedData;
  onMakeChanges?: () => void;
  onSend?: () => void;
  onVoiceInput?: () => void;
}

const EmailReviewModal = forwardRef<BottomSheetModal, EmailReviewModalProps>(
  ({ messageData, onMakeChanges, onSend, onVoiceInput }, ref) => {
    const snapPoints = ['50%', '75%'];

    // Extract data from messageData (handle both MessageComposedData and MessageComposedResponse)
    const data = messageData && 'data' in messageData ? messageData.data : messageData;

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

    return (
      <BottomSheetModal
        index={1}
        snapPoints={snapPoints}
        ref={ref}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.handle}
        backgroundStyle={styles.modalBackground}
      >
        <BottomSheetView style={styles.container}>
          {data && <EmailReviewCard data={data} />}
          <View style={styles.buttonContainer}>
            <Button
              text="Make Changes"
              onPress={onMakeChanges || (() => { })}
              variant="white"
              style={styles.button}
              styleOverrides={makeChangesButtonStyle}
              textStyle={styles.buttonText}
            />
            <Button
              text="Send It"
              onPress={onSend || (() => { })}
              variant="orange"
              style={styles.button}
              styleOverrides={sendItButtonStyle}
              textStyle={styles.buttonText}
            />
          </View>
          <VoiceInputButton onPress={onVoiceInput || (() => { })} />
        </BottomSheetView>
      </BottomSheetModal>
    )
  }
);

EmailReviewModal.displayName = "EmailReviewModal";

const makeChangesButtonStyle: ButtonStyleOverrides = {
  borderColor: colors.gray[300],
  borderRadius: 1000,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 32,
  paddingRight: 32,
  shadow: false,
}

const sendItButtonStyle: ButtonStyleOverrides = {
  borderRadius: 1000,
  paddingTop: 20,
  paddingBottom: 20,
  paddingLeft: 32,
  paddingRight: 32,
  shadow: true,
  elevation: 3,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  container: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
    paddingBottom: 44,
    gap: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginTop: 0,
  },
  buttonText: {
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
  },
});

export { EmailReviewModal };
