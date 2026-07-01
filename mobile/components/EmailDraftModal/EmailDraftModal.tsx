import ChevronDown from '@/assets/icons/ChevronDown';
import MailIcon from '@/assets/icons/MailIcon';
import { colors } from '@/constants/colors';
import { MessageComposedData, MessageComposedResponse } from '@/types/message';
import { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import React, { forwardRef, useCallback, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Button from '../Button/Button';
import { ButtonStyleOverrides } from '../Button/types';

interface EmailDraftModalProps {
  messageData?: MessageComposedData | MessageComposedResponse;
  onEditDraft?: () => void;
  onSend?: () => void;
  defaultVia?: string;
}

type ViaOption = {
  label: string;
  value: string;
};

const VIA_OPTIONS: ViaOption[] = [
  { label: 'Email', value: 'email' },
  { label: 'SMS', value: 'sms' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Slack', value: 'slack' },
];

// Default message text (used as fallback)
const defaultMessageText = `
Subject: Today's Showing Time

Hi John,

Would it work to push today's showing to 1:30 instead of 1:00?

No worries if not. Thanks,
Jason
`;

// Default contact (used as fallback)
const defaultContact = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: null,
};

const EmailDraftModal = forwardRef<BottomSheetModal, EmailDraftModalProps>(
  ({ messageData, onEditDraft, onSend, defaultVia = 'email' }, ref) => {
    const [selectedVia, setSelectedVia] = useState<string>(defaultVia);
    const [pickerVisible, setPickerVisible] = useState(false);

    // Extract data from messageData (handle both MessageComposedData and MessageComposedResponse)
    const data = messageData && 'data' in messageData ? messageData.data : messageData;

    // Use props data or fallback to defaults
    const contact = data?.contact || defaultContact;
    const subject = data?.subject || "Today's Showing Time";
    const body = data?.body || defaultMessageText.trim();

    // Format message text to include subject if not already present
    const formatMessageText = (subject: string, body: string): string => {
      const bodyLower = body.toLowerCase();
      const subjectLower = subject.toLowerCase();
      // Check if subject is already in the body
      if (bodyLower.includes(`subject: ${subjectLower}`) || bodyLower.includes(`subject:${subjectLower}`)) {
        return body;
      }
      // Prepend subject if it exists and body doesn't start with it
      return `Subject: ${subject}\n\n${body}`;
    };

    const messageText = formatMessageText(subject, body);

    const getInitials = (name: string): string => {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    };

    const initials = getInitials(contact.name);
    const selectedLabel = VIA_OPTIONS.find(opt => opt.value === selectedVia)?.label || 'Email';

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
        ref={ref as any}
        index={0}
        snapPoints={['50%', '60%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.modalBackground}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetView style={styles.container}>
          <View>
            <Text style={styles.draftText}>Draft ready to send.</Text>
          </View>
          <View style={styles.contentContainer}>
            <View style={styles.toContainer}>
              <Text style={styles.toText}>To:</Text>
              <View style={styles.nameContainer}>
                <View style={styles.icon}>
                  <Text style={styles.iconText}>{initials}</Text>
                </View>
                <Text style={styles.nameText}>{contact.name}</Text>
                <Text style={styles.emailText}>{contact.email}</Text>
              </View>
            </View>
            <View style={styles.viaContainer}>
              <Text style={styles.viaText}>Via:</Text>
              <TouchableOpacity
                style={styles.viaPickerButton}
                onPress={() => setPickerVisible(true)}
                activeOpacity={0.8}
              >
                <MailIcon width={12} height={12} />
                <Text style={styles.viaPickerText}>{selectedLabel}</Text>
                <ChevronDown width={6} height={3} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <Modal
              visible={pickerVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setPickerVisible(false)}
            >
              <TouchableOpacity
                style={styles.pickerOverlay}
                activeOpacity={1}
                onPress={() => setPickerVisible(false)}
              >
                <View style={styles.pickerModal}>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={selectedVia}
                      onValueChange={(itemValue) => {
                        setSelectedVia(itemValue);
                        setPickerVisible(false);
                      }}
                      style={styles.picker}
                      itemStyle={styles.pickerItem}
                    >
                      {VIA_OPTIONS.map((option) => (
                        <Picker.Item
                          key={option.value}
                          label={option.label}
                          value={option.value}
                          color={colors.gray[800]}
                        />
                      ))}
                    </Picker>
                  </View>
                </View>
              </TouchableOpacity>
            </Modal>
          </View>

          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>
              {messageText}
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              onPress={onEditDraft || (() => { })}
              variant="white"
              text="Edit Draft"
              styleOverrides={cancelButtonStyle}
            />
            <Button
              onPress={onSend || (() => { })}
              variant="orange"
              text="Send Email"
              styleOverrides={sendEmailButtonStyle}
            />
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    )
  });

EmailDraftModal.displayName = 'EmailDraftModal';

export { EmailDraftModal };

const sendEmailButtonStyle: ButtonStyleOverrides = {
  flex: 1,
  borderRadius: 14,
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 16,
  paddingRight: 16,
}

const cancelButtonStyle: ButtonStyleOverrides = {
  flex: 1,
  borderRadius: 14,
  paddingTop: 8,
  paddingBottom: 8,
  paddingLeft: 16,
  paddingRight: 16,
  borderWidth: 1.72,
  borderColor: colors.gray[300],
  shadow: false,
}

const styles = StyleSheet.create({
  modalBackground: {
    backgroundColor: colors.gray[200],
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    backgroundColor: colors.gray[300],
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  draftText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 24,
    overflow: 'hidden',
    letterSpacing: -0.31,
  },
  contentContainer: {
    gap: 12,
    marginTop: 18,
  },
  toText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 20,
    overflow: 'hidden',
    minWidth: 40,
  },
  toContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    justifyContent: 'space-evenly',
    backgroundColor: colors.gray[300],
    borderRadius: 14,
    height: 39,
    width: 253
  },
  icon: {
    width: 24,
    height: 24,
    borderRadius: 100,
    backgroundColor: colors.poolBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#16B3F2',
    textAlign: 'center',
    lineHeight: 16,
    overflow: 'hidden',
  },
  nameText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 20,
    overflow: 'hidden',
  },
  emailText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 16,
    overflow: 'hidden',
  },
  viaText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[600],
    lineHeight: 20,
    overflow: 'hidden',
    minWidth: 40,
  },
  viaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viaPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.gray[300],
    borderRadius: 14,
    minHeight: 39,
  },
  viaPickerText: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 20,
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModal: {
    width: '92%',
    maxHeight: '60%',
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pickerWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  picker: {
    height: 200,
    backgroundColor: colors.white,
  },
  pickerItem: {
    color: colors.gray[800],
    fontSize: 16,
    fontFamily: 'Inter',
  },
  messageContainer: {
    width: 345,
    height: 279,
    marginTop: 24,
    backgroundColor: '#F3F3F5',
    borderRadius: 16,
    borderWidth: 1.72,
    borderColor: '#EBE6E3',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  messageText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.gray[800],
    lineHeight: 24,
    overflow: 'hidden',
    letterSpacing: -0.31,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.black,
    opacity: 0.5,
  },
});