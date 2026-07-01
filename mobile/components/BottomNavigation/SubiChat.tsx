import { Microphone } from "@/assets/icons/Microphone";
import WaveformIcon from "@/assets/icons/WaveformIcon";
import { useCreateChat } from "@/hooks/useChat";
import { useHomeVoice } from "@/hooks/useHomeVoice";
import voiceWebSocketService, { VoiceWebSocketMessage } from "@/services/voiceWebSocketService";
import { useChatStore } from "@/stores/chatStore";
import { Ionicons, Octicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../../constants/colors";
import { useTaskDetailContext } from "../../contexts/TaskDetailContext";
import { useCommentManagement } from "../../hooks/useComments";

interface SubiChatProps {
  onChatPress?: () => void;
  onSendPress?: () => void;
}

export const SubiChat: React.FC<SubiChatProps> = ({
  onChatPress,
  onSendPress,
}) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const pathname = usePathname();
  const { isTaskDetailOpen, taskId, isCalendarEvent } = useTaskDetailContext();
  const [comment, setComment] = useState("");
  const [chatMessage, setChatMessage] = useState("");

  const commentManagement = useCommentManagement(taskId || "");
  const { createComment, isCreating } = commentManagement;

  const {
    activeChatId,
    setPendingMessage,
    setPendingTransactionId,
    isVoiceModeOpen,
    setVoiceModeOpen,
    addVoiceMessage,
    voiceMessagesByChat,
    clearVoiceMessages,
    setActiveChatId: setStoreActiveChatId,
  } = useChatStore();
  const { mutateAsync: createChat } = useCreateChat();
  const { voiceState, handleVoiceButtonPress } = useHomeVoice();
  const handleVoiceButtonPressRef = useRef(handleVoiceButtonPress);
  const isOnChatScreen = pathname?.includes("/chat") ?? false;
  const hasChatMessage = chatMessage.trim().length > 0;
  const voiceChatKey = activeChatId || "__voice_default__";
  const isProcessing = voiceState === "processing" || voiceState === "speaking";
  const isRecording = voiceState === "recording";
  const hasRequestedVoiceChatCreationRef = useRef(false);

  const ensureVoiceChatExists = useCallback(async () => {
    if (activeChatId || hasRequestedVoiceChatCreationRef.current) {
      return;
    }

    hasRequestedVoiceChatCreationRef.current = true;

    try {
      const newChat = await createChat({
        title: "Voice conversation",
      });
      setStoreActiveChatId(newChat.id);
      router.replace({ pathname: "/chat", params: { chatId: newChat.id } });
    } catch (_) {
      // Keep voice mode usable even if chat creation fails; user can retry.
    }
  }, [activeChatId, createChat, router, setStoreActiveChatId]);

  useEffect(() => {
    if (!isTaskDetailOpen) {
      setComment("");
    }
  }, [isTaskDetailOpen]);

  useEffect(() => {
    handleVoiceButtonPressRef.current = handleVoiceButtonPress;
  }, [handleVoiceButtonPress]);

  useEffect(() => {
    if (activeChatId) {
      hasRequestedVoiceChatCreationRef.current = false;
    }
  }, [activeChatId]);

  useEffect(() => {
    if (!isVoiceModeOpen) {
      hasRequestedVoiceChatCreationRef.current = false;
    }
  }, [isVoiceModeOpen]);

  useEffect(() => {
    if (!(isVoiceModeOpen && isOnChatScreen)) {
      return;
    }

    voiceWebSocketService.resetToIdle("voice mode opened from chat input");
    const timer = setTimeout(() => {
      handleVoiceButtonPressRef.current();
    }, 300);

    return () => clearTimeout(timer);
  }, [isOnChatScreen, isVoiceModeOpen]);

  useEffect(() => {
    if (!(isVoiceModeOpen && isOnChatScreen)) {
      return;
    }

    const unsubscribe = voiceWebSocketService.onMessage((message: VoiceWebSocketMessage) => {
      if (message.type === "transcription") {
        const text = message.data?.transcript || message.message || "";
        if (text) {
          if (!activeChatId) {
            void ensureVoiceChatExists();
          }

          addVoiceMessage(voiceChatKey, {
            id: `voice-user-${Date.now()}`,
            role: "user",
            content: text,
            timestamp: new Date().toISOString(),
          });
        }
      } else if (message.type === "output_transcription") {
        const text = message.data?.transcript || message.message || "";
        if (text) {
          if (!activeChatId) {
            void ensureVoiceChatExists();
          }

          addVoiceMessage(voiceChatKey, {
            id: `voice-assistant-${Date.now()}`,
            role: "assistant",
            content: text,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });

    return () => unsubscribe();
  }, [
    activeChatId,
    addVoiceMessage,
    ensureVoiceChatExists,
    isOnChatScreen,
    isVoiceModeOpen,
    voiceChatKey,
  ]);

  useEffect(() => {
    if (!activeChatId) {
      return;
    }

    const stagedVoiceMessages = voiceMessagesByChat["__voice_default__"] || [];
    if (stagedVoiceMessages.length === 0) {
      return;
    }

    stagedVoiceMessages.forEach((message) => {
      addVoiceMessage(activeChatId, message);
    });
    clearVoiceMessages("__voice_default__");
  }, [activeChatId, addVoiceMessage, clearVoiceMessages, voiceMessagesByChat]);


  if (isTaskDetailOpen && isCalendarEvent) {
    return null;
  }

  const handleCommentSubmit = () => {
    if (comment.trim() && taskId) {
      createComment({
        transactionTaskId: taskId,
        commentData: { content: comment.trim() },
      });
      setComment("");
    }
  };

  const handleChatPress = () => {
    if (onChatPress) {
      onChatPress();
    } else {
      router.push("/home");
    }
  };

  const handleSendPress = () => {
    if (isTaskDetailOpen && taskId) {
      handleCommentSubmit();
    } else if (chatMessage.trim()) {
      if (onSendPress) {
        onSendPress();
      } else if (isOnChatScreen) {
        // Already on chat screen - send via store
        setPendingTransactionId(null);
        setPendingMessage(chatMessage.trim());
        setChatMessage("");
      } else {
        // Navigate to chat with the initial message via store
        const message = chatMessage.trim();
        setChatMessage("");
        setPendingTransactionId(null);
        setPendingMessage(message);
        router.push("/chat");
      }
    }
  };

  const handleVoiceModePress = () => {
    setVoiceModeOpen(true);
    if (!isOnChatScreen) {
      router.push("/chat");
    }
  };

  const handleEndVoiceMode = async () => {
    try {
      await voiceWebSocketService.stopRecording();
    } catch (_) {
      // Ignore errors when recording is already stopped.
    }
    voiceWebSocketService.resetToIdle("voice mode ended from chat input");
    setVoiceModeOpen(false);
  };

  const getVoiceButtonLabel = () => {
    if (isProcessing) {
      return voiceState === "processing" ? "Thinking..." : "Speaking...";
    }
    if (isRecording) {
      return "Listening...";
    }
    return "Start Listening";
  };

  // Show comment input when task detail is open
  if (isTaskDetailOpen && taskId) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Octicons name="paperclip" size={16} color={colors.gray[600]} />
          </View>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment..."
            placeholderTextColor={colors.gray[600]}
            multiline
            maxLength={500}
          />

          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!comment.trim() || isCreating) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendPress}
              activeOpacity={0.7}
              disabled={!comment.trim() || isCreating}
            >
              <Ionicons name="arrow-up" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (isVoiceModeOpen && isOnChatScreen) {
    return (
      <View style={[styles.container, styles.voiceModeContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.voiceModeActions}>
          <TouchableOpacity
            style={[styles.voiceButton, isProcessing && styles.voiceButtonProcessing]}
            onPress={handleVoiceButtonPress}
            disabled={isProcessing}
            activeOpacity={0.7}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <WaveformIcon width={20} height={20} color={colors.white} />
            )}
            <Text style={styles.voiceButtonText}>{getVoiceButtonLabel()}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.endChatButton} onPress={handleEndVoiceMode} activeOpacity={0.7}>
            <Ionicons name="close" size={18} color={colors.gray[800]} />
            <Text style={styles.endChatText}>End Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <TextInput
          style={styles.chatInput}
          value={chatMessage}
          onChangeText={setChatMessage}
          placeholder="Ask Subi anything..."
          placeholderTextColor={colors.gray[600]}
          multiline
          maxLength={500}
        />

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleChatPress}
            activeOpacity={0.7}
          >
            <Microphone width={24} height={24} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendButton}
            onPress={hasChatMessage ? handleSendPress : handleVoiceModePress}
            activeOpacity={0.7}
          >
            {hasChatMessage ? (
              <Ionicons name="arrow-up" size={24} color={colors.white} />
            ) : (
              <WaveformIcon width={24} height={24} color={colors.white} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 0.627,
    borderTopColor: "#dbd4d1",
  },
  voiceModeContainer: {
    backgroundColor: "transparent",
    borderTopWidth: 0,
  },
  content: {
    backgroundColor: "#faf7f5",
    marginHorizontal: 12,
    marginTop: 12.62,
    marginBottom: 12,
    height: 44,
    borderRadius: 20,
    paddingHorizontal: 6,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  chatInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    lineHeight: 22.5,
    color: colors.gray[800],
    maxHeight: 100,
    paddingVertical: 0,
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconButton: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#2B2827",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  voiceModeActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 12,
    marginTop: 12.62,
    marginBottom: 12,
  },
  voiceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 100,
    backgroundColor: colors.gray[800],
    gap: 10,
    paddingLeft: 12,
    paddingRight: 16,
  },
  voiceButtonProcessing: {
    backgroundColor: colors.gray[700],
  },
  voiceButtonText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Inter",
    color: colors.white,
  },
  endChatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 100,
    backgroundColor: colors.gray[300],
    gap: 6,
    paddingLeft: 12,
    paddingRight: 16,
  },
  endChatText: {
    fontSize: 16,
    fontWeight: "500",
    fontFamily: "Inter",
    color: colors.gray[800],
  },
  commentInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter-Medium",
    lineHeight: 22.5,
    color: colors.gray[800],
    maxHeight: 100,
    paddingVertical: 0,
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 99,
    backgroundColor: colors.gray[500],
    gap: 10,
    padding: 2,
  },
});

export default SubiChat;
