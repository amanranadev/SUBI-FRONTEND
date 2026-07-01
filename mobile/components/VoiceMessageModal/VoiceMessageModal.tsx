import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";
import { VoiceInputButton } from "../EmailReviewModal/VoiceInputButton";

interface VoiceMessageModalProps {
  message?: string;
  isStreaming?: boolean;
  isDisabled?: boolean; // Disable mic button when AI is speaking/processing/listening
  isProcessing?: boolean; // AI is processing the request
  isSpeaking?: boolean; // AI is speaking/playing audio
  isResponseReady?: boolean; // AI finished speaking, user can respond (even if audio playing)
  onClose?: () => void;
  onStartRecording?: () => void;
  onModalReady?: () => void; // Called when modal is visible (for audio sync)
}

export const VoiceMessageModal = forwardRef<
  BottomSheetModal,
  VoiceMessageModalProps
>(
  (
    {
      message = "",
      isStreaming = false,
      isDisabled = false,
      isProcessing = false,
      isSpeaking = false,
      isResponseReady = false,
      onClose,
      onStartRecording,
      onModalReady,
    },
    ref
  ) => {
    const scrollViewRef = useRef<any>(null);
    const modalRef = useRef<any>(null);

    useEffect(() => {
      if (ref && typeof ref !== "function" && ref.current) {
        modalRef.current = ref.current;
      }
    }, [ref]);

    useEffect(() => {
      if (scrollViewRef.current && message) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }, [message]);

    const snapPoints = useMemo(() => ["30%"], []);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1 && onClose) {
          onClose();
        }
        // Signal modal is ready when it becomes visible (index >= 0)
        // This enables audio-visual synchronization with the voice service
        if (index >= 0 && onModalReady) {
          onModalReady();
        }
      },
      [onClose, onModalReady]
    );

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
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        handleIndicatorStyle={styles.handle}
      >
        <BottomSheetScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Status message when AI is processing or speaking */}
          {(isProcessing || isSpeaking) && (
            <View style={styles.statusContainer}>
              <Text style={styles.statusText}>
                {isProcessing
                  ? "AI is processing your request..."
                  : "AI is speaking..."}
              </Text>
            </View>
          )}

          {/* Microphone button to start new recording - only show when AI is processing/speaking (else flow) */}
          {/* Hide when idle to avoid confusion with main screen button */}
          {/* SUBI_BUGBOARD - remove the isProcessing || isSpeaking condition below to see the small mick modal */}
          {onStartRecording && (isProcessing || isSpeaking) && (
            <VoiceInputButton
              onPress={() => {
                if (!isDisabled && onStartRecording) {
                  setTimeout(() => {
                    onStartRecording();
                  }, 300);
                }
              }}
              disabled={isDisabled}
              label={
                isDisabled
                  ? isProcessing
                    ? "Processing..."
                    : isSpeaking
                      ? "AI is speaking..."
                      : "Please wait..."
                  : "Tap to respond"
              }
              containerStyle={styles.micButtonContainer}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

VoiceMessageModal.displayName = "VoiceMessageModal";

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray[800],
  },
  handle: {
    backgroundColor: colors.gray[300],
  },
  content: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: 24,
    flexGrow: 1,
  },
  messageContainer: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 0.574,
    borderColor: "#ebe6e3",
    padding: 20,
    minHeight: 200,
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
  },
  messageText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "#2b2827",
    letterSpacing: -0.31,
    flex: 1,
  },
  cursor: {
    marginLeft: 2,
  },
  cursorText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "#fd4d03",
    letterSpacing: -0.31,
  },
  micButtonContainer: {
    marginTop: 24,
  },
  statusContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  statusText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#867873",
    letterSpacing: -0.15,
  },
});

export default VoiceMessageModal;
