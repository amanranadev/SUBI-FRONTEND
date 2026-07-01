import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

interface VoiceListeningModalProps {
  onStopRecording: () => void;
  isRecording?: boolean;
  isProcessing?: boolean;
}

interface AnimatedSoundBarsProps {
  color?: string;
}

export const AnimatedSoundBars: React.FC<AnimatedSoundBarsProps> = ({ color = "#fd4d03" }) => {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.4)).current;
  const anim3 = useRef(new Animated.Value(0.5)).current;
  const anim4 = useRef(new Animated.Value(0.6)).current;
  const anim5 = useRef(new Animated.Value(0.4)).current;
  const anim6 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 600,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: false,
            }),
          ])
        ),
      ]);
    };

    const animations = [
      createAnimation(anim1, 0),
      createAnimation(anim2, 100),
      createAnimation(anim3, 200),
      createAnimation(anim4, 300),
      createAnimation(anim5, 400),
      createAnimation(anim6, 500),
    ];

    Animated.parallel(animations).start();

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [anim1, anim2, anim3, anim4, anim5, anim6]);

  const bars = [
    { anim: anim1, height: 25.858 },
    { anim: anim2, height: 34.134 },
    { anim: anim3, height: 39.37 },
    { anim: anim4, height: 39.37 },
    { anim: anim5, height: 34.134 },
    { anim: anim6, height: 25.858 },
  ];

  return (
    <View style={styles.soundBarsContainer}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.soundBar,
            {
              backgroundColor: color,
              height: bar.anim.interpolate({
                inputRange: [0, 1],
                outputRange: [bar.height * 0.3, bar.height],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
};

export const VoiceListeningModal = forwardRef<
  BottomSheetModal,
  VoiceListeningModalProps
>(({ onStopRecording, isRecording = true, isProcessing = false }, ref) => {
  const snapPoints = useMemo(() => ["40%"], []);

  const handleSheetChanges = useCallback((index: number) => {
    if (index === -1) {
      // Modal closed
    }
  }, []);

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
      <BottomSheetView style={styles.content}>
        {isProcessing ? (
          <>
            <AnimatedSoundBars />
            <Text style={styles.listeningText}>Processing…</Text>
          </>
        ) : (
          <>
            <AnimatedSoundBars />
            <Text style={styles.listeningText}>Listening…</Text>
            <TouchableOpacity
              style={styles.stopButton}
              onPress={onStopRecording}
              activeOpacity={0.8}
            >
              <Text style={styles.stopButtonText}>Stop Recording</Text>
            </TouchableOpacity>
          </>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

VoiceListeningModal.displayName = "VoiceListeningModal";

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
    paddingVertical: 60,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  soundBarsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 24,
    height: 40,
  },
  soundBar: {
    width: 6,
    backgroundColor: "#fd4d03",
    borderRadius: 3,
    minHeight: 10,
  },
  micButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    gap: 12,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fd4d03",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  micButtonLabel: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#867873",
    letterSpacing: -0.15,
  },
  listeningText: {
    fontFamily: "Inter-Regular",
    fontSize: 16,
    lineHeight: 24,
    color: "#867873",
    letterSpacing: -0.31,
    marginBottom: 32,
  },
  stopButton: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "#fd4d03",
    borderRadius: 24,
    minWidth: 160,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  stopButtonText: {
    fontFamily: "Inter-SemiBold",
    fontSize: 16,
    color: colors.white,
    letterSpacing: -0.31,
  },
  statusContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    width: "100%",
  },
  statusText: {
    fontFamily: "Inter-Regular",
    fontSize: 14,
    lineHeight: 20,
    color: "#867873",
    letterSpacing: -0.15,
  },
});

export default VoiceListeningModal;
