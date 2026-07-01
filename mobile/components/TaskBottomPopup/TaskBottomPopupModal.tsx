import DescriptionIcon from "@/assets/icons/DescriptionIcon";
import { colors } from "@/constants/colors";
import {
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef } from "react";
import { Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TaskBottomPopupModalProps {
  task: {
    id: string;
    taskId: string;
    title: string;
    description: string;
    address: string;
    date: string;
    time: string;
    location: string;
    isOverdue?: boolean;
    information?: string;
  } | null;
  ref: React.Ref<BottomSheetModal>;
  isEditing?: boolean;
  editedContent?: string;
  placeholder?: string;
  showIcon?: boolean;
  handleContentChange: (text: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
  handleDone: () => void;
  renderBackdrop?: (props: BottomSheetBackdropProps) => React.ReactElement<any>;
}

const TaskBottomPopupModal = ({
  task,
  ref,
  handleCancel,
  handleDone,
  handleContentChange,
  isEditing = false,
  editedContent,
  handleSave,
  renderBackdrop,
  placeholder = "Add content...",
  showIcon: showIcon = false,
}: TaskBottomPopupModalProps) => {
  const snapPoints = ["50%", "100%"];
  const { bottom } = useSafeAreaInsets();
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [keyboardHeight, setKeyboardHeight] = React.useState<number>(0);

  // Track keyboard height for iOS
  useEffect(() => {
    if (Platform.OS === "ios") {
      const showSubscription = Keyboard.addListener("keyboardWillShow", (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      });
      const hideSubscription = Keyboard.addListener("keyboardWillHide", () => {
        setKeyboardHeight(0);
      });

      return () => {
        showSubscription.remove();
        hideSubscription.remove();
      };
    }
  }, []);

  const handleInputFocus = useCallback(() => {
    // Clear any existing timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
    }

    // Snap to highest snap point when input is focused to prevent jerking
    // Use setTimeout to ensure this happens after keyboard starts opening
    // iOS needs longer delay to account for keyboard animation
    const delay = Platform.OS === "ios" ? 300 : 100;
    focusTimeoutRef.current = setTimeout(() => {
      try {
        if (ref && typeof ref !== "function" && ref.current) {
          ref.current.snapToIndex(1);
        }
      } catch (error) {
        // Silently handle errors to prevent crashes
        console.warn("Failed to snap bottom sheet:", error);
      }
    }, delay);
  }, [ref]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.white }}
      handleIndicatorStyle={{
        backgroundColor: colors.gray[500],
        width: 44,
        height: 4,
        borderRadius: 4,
      }}
      android_keyboardInputMode="adjustResize"
      keyboardBehavior={Platform.OS === "ios" ? "extend" : "interactive"}
      keyboardBlurBehavior="restore"
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      enablePanDownToClose={false}
    >
      <View style={styles.header}>
        <View style={styles.headerButtonContainer}>
          {isEditing && (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.title} numberOfLines={1}>
          {task?.title}
        </Text>
        <View style={styles.headerButtonContainer}>
          <TouchableOpacity onPress={isEditing ? handleSave : handleDone}>
            <Text style={styles.doneButton}>{isEditing ? "Save" : "Done"}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <BottomSheetScrollView 
        contentContainerStyle={[
          styles.content, 
          { 
            paddingBottom: Platform.OS === "ios" 
              ? Math.max(bottom + 16, keyboardHeight + 16)
              : bottom + 16
          }
        ]} 
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <View style={styles.inputContainer}>
          {showIcon && (
            <View style={styles.iconContainer}>
              <DescriptionIcon />
            </View>
          )}
          <View style={[styles.inputWrapper, !showIcon && styles.inputWrapperFull]}>
            <BottomSheetTextInput
              style={styles.input}
              value={editedContent}
              onChangeText={handleContentChange}
              onFocus={handleInputFocus}
              multiline
              textAlignVertical="top"
              placeholder={placeholder}
              placeholderTextColor={colors.gray[500]}
              editable={true}
              accessibilityLabel={placeholder}
              accessibilityHint="Enter text content"
              {...(Platform.OS === "android" && {
                includeFontPadding: false,
              })}
            />
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
};

export default TaskBottomPopupModal;

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray[800],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  headerButtonContainer: {
    width: 60,
    alignItems: "center",
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    textAlign: "center",
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary[400],
  },
  doneButton: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary[400],
  },
  content: {
    padding: 16,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  inputWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  inputWrapperFull: {
    paddingRight: 0,
  },
  input: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: Platform.OS === "android" ? 20 : 24,
    height: 200,
    padding: 0,
    margin: 0,
    ...(Platform.OS === "android" && {
      textAlignVertical: "top",
      paddingVertical: 0,
    }),
  },
});
