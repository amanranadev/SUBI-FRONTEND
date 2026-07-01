import UnionIcon from "@/assets/icons/UnionIcon";
import WaveformIcon from "@/assets/icons/WaveformIcon";
import { colors } from "@/constants/colors";
import { useHomeVoice } from "@/hooks/useHomeVoice";
import voiceWebSocketService, { VoiceWebSocketMessage } from "@/services/voiceWebSocketService";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

/** Soft glowing circle using SVG radial gradient to simulate Gaussian blur */
function GlowCircle({
  size,
  color,
  opacity,
  id,
}: {
  size: number;
  color: string;
  opacity: number;
  id: string;
}) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} style={{ position: "absolute" }}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
          <Stop offset="60%" stopColor={color} stopOpacity={opacity * 0.5} />
          <Stop offset="100%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={r} cy={r} r={r} fill={`url(#${id})`} />
    </Svg>
  );
}

/**
 * Animated background with blue & green glow circles
 * that smoothly cross-fade in a continuous random-feeling loop.
 */
function AnimatedGlowBackground() {
  // Blue group opacity: starts visible
  const blueOpacity = useSharedValue(1);
  // Green group opacity: starts hidden
  const greenOpacity = useSharedValue(0);

  useEffect(() => {
    // Slow, breathing cross-fade with long holds between transitions
    // Blue: stay visible 6s → fade out over 5s → stay dim 4s → fade in over 5s → repeat
    blueOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 100, easing: Easing.ease }),
        withDelay(
          6000,
          withTiming(0.15, { duration: 5000, easing: Easing.inOut(Easing.ease) })
        ),
        withDelay(
          4000,
          withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
        ),
      ),
      -1,
      false,
    );

    // Green: stay hidden 4s → fade in over 5s → stay visible 6s → fade out over 5s → repeat
    greenOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 100, easing: Easing.ease }),
        withDelay(
          4000,
          withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
        ),
        withDelay(
          6000,
          withTiming(0.1, { duration: 5000, easing: Easing.inOut(Easing.ease) })
        ),
      ),
      -1,
      false,
    );
  }, []);

  const blueStyle = useAnimatedStyle(() => ({
    opacity: blueOpacity.value,
  }));

  const greenStyle = useAnimatedStyle(() => ({
    opacity: greenOpacity.value,
  }));

  return (
    <View style={styles.glowBackground} pointerEvents="none">
      {/* Blue glow group – centered */}
      <Animated.View style={[styles.blueGlowGroup, blueStyle]}>
        <GlowCircle size={486} color={colors.poolBlue} opacity={0.8} id="glow-blue-outer" />
        <GlowCircle size={232} color={colors.poolBlue} opacity={1} id="glow-blue-inner" />
      </Animated.View>

      {/* Green glow group – offset per design (top: 179, left: -48) */}
      <Animated.View style={[styles.greenGlowGroup, greenStyle]}>
        <GlowCircle size={486} color={colors.lawnGreen} opacity={0.8} id="glow-green-outer" />
        <GlowCircle size={232} color={colors.lawnGreen} opacity={1} id="glow-green-inner" />
      </Animated.View>
    </View>
  );
}

type TranscriptEntry = {
  id: string;
  role: "user" | "ai";
  text: string;
};

export default function VoiceModeScreen() {
  const router = useRouter();
  const {
    voiceState,
    handleVoiceButtonPress,
  } = useHomeVoice();

  const [transcripts, setTranscripts] = useState<TranscriptEntry[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  const handleVoiceButtonPressRef = useRef(handleVoiceButtonPress);

  // Keep ref in sync without triggering effects
  useEffect(() => {
    handleVoiceButtonPressRef.current = handleVoiceButtonPress;
  }, [handleVoiceButtonPress]);

  // Reset everything and auto-start listening each time the screen is focused
  useFocusEffect(
    useCallback(() => {
      // Stop any active recording and reset voice state to idle
      voiceWebSocketService.resetToIdle("voice-mode screen focused");
      setTranscripts([]);

      // Small delay to let reset settle, then start listening
      const timer = setTimeout(() => {
        handleVoiceButtonPressRef.current();
      }, 300);

      return () => clearTimeout(timer);
    }, [])
  );

  // Subscribe to voice WS messages to capture transcripts
  useEffect(() => {
    const unsubscribe = voiceWebSocketService.onMessage((message: VoiceWebSocketMessage) => {
      if (message.type === "transcription") {
        const text = message.data?.transcript || message.message || "";
        if (text) {
          setTranscripts((prev) => [
            ...prev,
            { id: `user-${Date.now()}`, role: "user", text },
          ]);
        }
      } else if (message.type === "output_transcription") {
        const text = message.data?.transcript || message.message || "";
        if (text) {
          setTranscripts((prev) => [
            ...prev,
            { id: `ai-${Date.now()}`, role: "ai", text },
          ]);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom when new transcripts arrive
  useEffect(() => {
    if (transcripts.length > 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [transcripts]);

  const hasTranscripts = transcripts.length > 0;
  const isProcessing = voiceState === "processing" || voiceState === "speaking";
  const isRecording = voiceState === "recording";

  const getVoiceButtonLabel = () => {
    if (isProcessing) return voiceState === "processing" ? "Thinking..." : "Speaking...";
    if (isRecording) return "Listening...";
    return "Start Listening";
  };

  const handleEndChat = async () => {
    // Stop the microphone first (while state is still "recording"),
    // then reset to idle before navigating away
    try {
      await voiceWebSocketService.stopRecording();
    } catch (_) {
      // Ignore errors (e.g. not recording)
    }
    voiceWebSocketService.resetToIdle("end chat");
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with logo */}
      <View style={styles.header}>
        <UnionIcon width={88} height={24} color={colors.brickOrange} />
      </View>

      {/* Main content area – glow circles always visible as background */}
      <View style={styles.contentArea}>
        {/* Animated glow background – always rendered */}
        <AnimatedGlowBackground />

        {hasTranscripts ? (
          /* Transcript chat view */
          <ScrollView
            ref={scrollViewRef}
            style={styles.transcriptArea}
            contentContainerStyle={styles.transcriptContent}
            showsVerticalScrollIndicator={false}
          >
            {transcripts.map((entry) =>
              entry.role === "user" ? (
                <View key={entry.id} style={styles.userRow}>
                  <View style={styles.userBubble}>
                    <Text style={styles.userText}>{entry.text}</Text>
                  </View>
                </View>
              ) : (
                <View key={entry.id} style={styles.aiRow}>
                  <Text style={styles.aiText}>{entry.text}</Text>
                </View>
              )
            )}
          </ScrollView>
        ) : (
          /* Listening text when no transcripts yet */
          <View style={styles.centerTextWrapper}>
            <Text style={styles.listeningText}>
              {voiceState === "recording"
                ? "Listening..."
                : voiceState === "processing"
                  ? "Thinking..."
                  : voiceState === "speaking"
                    ? "Speaking..."
                    : "Tap to start"}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom buttons */}
      <View style={styles.bottomArea}>
        <View style={styles.bottomButtons}>
          {/* Voice toggle button – shows processing state */}
          <TouchableOpacity
            style={[
              styles.voiceButton,
              isProcessing && styles.voiceButtonProcessing,
            ]}
            onPress={handleVoiceButtonPress}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <WaveformIcon width={20} height={20} color={colors.white} />
            )}
            <Text style={styles.voiceButtonText}>{getVoiceButtonLabel()}</Text>
          </TouchableOpacity>

          {/* End Chat button */}
          <TouchableOpacity style={styles.endChatButton} onPress={handleEndChat}>
            <Ionicons name="close" size={18} color={colors.gray[800]} />
            <Text style={styles.endChatText}>End Chat</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  header: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 8,
  },
  contentArea: {
    flex: 1,
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  blueGlowGroup: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  greenGlowGroup: {
    position: "absolute",
    top: 179,
    left: -48,
    width: 486,
    height: 486,
    justifyContent: "center",
    alignItems: "center",
  },
  centerTextWrapper: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listeningText: {
    fontSize: 24,
    fontWeight: "500",
    fontFamily: "Inter",
    color: colors.gray[800],
    letterSpacing: 0.12,
  },

  /* Transcript chat styles */
  transcriptArea: {
    flex: 1,
  },
  transcriptContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  userRow: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  userBubble: {
    backgroundColor: colors.gray[100],
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: "70%",
  },
  userText: {
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter",
    color: colors.gray[800],
    lineHeight: 22,
  },
  aiRow: {
    alignItems: "flex-start",
    marginBottom: 28,
    paddingRight: 16,
  },
  aiText: {
    fontSize: 20,
    fontWeight: "400",
    fontFamily: "Inter",
    color: colors.gray[800],
    lineHeight: 20,
    letterSpacing: 0.1,
  },

  bottomArea: {
    alignItems: "center",
    paddingBottom: 40,
  },
  bottomButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
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
});
