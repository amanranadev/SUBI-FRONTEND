import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated } from "react-native";
import Toast from "react-native-toast-message";
import { useVoiceCommands } from "./useVoiceCommands";
import voiceWebSocketService, { VoiceState } from "@/services/voiceWebSocketService";
import { colors } from "@/constants/colors";

// Constants
const MODAL_READY_DELAY_MS = 50;
const RESPONSE_TIMEOUT_MS = 30000; // 30 seconds timeout for AI response

/**
 * Custom hook for managing voice AI interaction on the home screen.
 * Handles voice state, animations, and button interactions.
 */
export function useHomeVoice() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const responseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const {
    isConnected,
    connect,
    startListening,
    stopListening,
  } = useVoiceCommands();

  // Clear any existing timeout
  const clearResponseTimeout = useCallback(() => {
    if (responseTimeoutRef.current) {
      clearTimeout(responseTimeoutRef.current);
      responseTimeoutRef.current = null;
    }
  }, []);

  // Voice state handling - updates button state inline
  const handleVoiceStateChange = useCallback((state: VoiceState) => {
    setVoiceState(state);

    // Handle timeout based on state
    if (state === "processing") {
      // Start timeout when processing begins
      clearResponseTimeout();
      responseTimeoutRef.current = setTimeout(() => {
        Toast.show({
          type: "error",
          text1: "No response from AI",
          text2: "Please try again",
          position: "top",
          visibilityTime: 4000,
        });
        // Reset the service state (not just local state) so recording can start again
        voiceWebSocketService.resetToIdle("response timeout");
      }, RESPONSE_TIMEOUT_MS);
    } else if (state === "speaking" || state === "idle" || state === "ready") {
      // Clear timeout when we get a response or return to idle
      clearResponseTimeout();
    }

    // Signal modal ready when speaking starts - this allows audio to play
    // The voiceWebSocketService creates a new promise right before transitioning to "speaking"
    // Small delay ensures the promise is fully set up before we resolve it
    if (state === "speaking") {
      setTimeout(() => {
        voiceWebSocketService.signalModalReady();
      }, MODAL_READY_DELAY_MS);
    }
  }, [clearResponseTimeout]);


  // Subscribe to voice state changes
  useEffect(() => {
    const unsubscribe = voiceWebSocketService.onVoiceState(handleVoiceStateChange);

    // Check initial state
    const initialState = voiceWebSocketService.getVoiceState();
    handleVoiceStateChange(initialState);

    return () => {
      unsubscribe();
      clearResponseTimeout();
    };
  }, [handleVoiceStateChange, clearResponseTimeout]);

  // Subscribe to voice errors
  useEffect(() => {
    const unsubscribe = voiceWebSocketService.onError((error) => {
      Toast.show({
        type: "error",
        text1: error.message,
        position: "top",
        visibilityTime: 4000,
        autoHide: true,
      });
    });
    return () => unsubscribe();
  }, []);

  // Pulse animation for recording state only
  useEffect(() => {
    if (voiceState === "recording") {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [voiceState, pulseAnim]);

  // Handle voice button press based on current state
  const handleVoiceButtonPress = useCallback(async () => {
    if (voiceState === "recording") {
      try {
        await stopListening();
      } catch (error) {
        console.error("Failed to stop recording:", error);
      }
      return;
    }

    if (voiceState === "processing") {
      return;
    }

    // Start recording (idle, ready, or speaking state)
    try {
      if (!isConnected) {
        const connected = await connect();
        if (!connected) {
          Toast.show({
            type: "error",
            text1: "Failed to connect to voice service",
            position: "top",
          });
          return;
        }
      }

      const started = await startListening();
      if (!started) {
        Toast.show({
          type: "error",
          text1: "Failed to start recording",
          text2: "Please check microphone permissions",
          position: "top",
        });
      }
    } catch (error) {
      console.error("Failed to start recording:", error);
      Toast.show({
        type: "error",
        text1: "Failed to start recording",
        position: "top",
      });
    }
  }, [voiceState, isConnected, connect, startListening, stopListening]);

  // Derived button style based on voice state
  const voiceButtonStyle = useMemo(() => {
    switch (voiceState) {
      case "recording":
        return { backgroundColor: colors.red[800] };
      case "processing":
        return { backgroundColor: colors.primary[400] }; // Orange for processing
      case "speaking":
        return { backgroundColor: colors.green[500] };
      case "ready":
        return { backgroundColor: colors.gray[800] }; // Ready for next input
      case "idle":
      default:
        return { backgroundColor: colors.gray[800] };
    }
  }, [voiceState]);

  // Derived button label based on voice state
  const voiceButtonLabel = useMemo(() => {
    switch (voiceState) {
      case "recording":
        return "Listening...";
      case "processing":
        return "Thinking...";
      case "speaking":
        return "Speaking...";
      case "ready":
        return "Tap to speak";
      case "idle":
      default:
        return "Voice Mode";
    }
  }, [voiceState]);

  return {
    voiceState,
    pulseAnim,
    handleVoiceButtonPress,
    voiceButtonStyle,
    voiceButtonLabel,
    isDisabled: voiceState === "processing" || voiceState === "speaking",
  };
}
