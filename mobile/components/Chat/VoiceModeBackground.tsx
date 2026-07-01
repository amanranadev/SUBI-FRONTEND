import { colors } from "@/constants/colors";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, RadialGradient, Stop } from "react-native-svg";

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

export const VoiceModeBackground: React.FC = () => {
    const blueOpacity = useSharedValue(1);
    const greenOpacity = useSharedValue(0);

    useEffect(() => {
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
                )
            ),
            -1,
            false
        );

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
                )
            ),
            -1,
            false
        );
    }, [blueOpacity, greenOpacity]);

    const blueStyle = useAnimatedStyle(() => ({ opacity: blueOpacity.value }));
    const greenStyle = useAnimatedStyle(() => ({ opacity: greenOpacity.value }));

    return (
        <View style={styles.glowBackground} pointerEvents="none">
            <Animated.View style={[styles.blueGlowGroup, blueStyle]}>
                <GlowCircle size={486} color={colors.poolBlue} opacity={0.8} id="chat-glow-blue-outer" />
                <GlowCircle size={232} color={colors.poolBlue} opacity={1} id="chat-glow-blue-inner" />
            </Animated.View>

            <Animated.View style={[styles.greenGlowGroup, greenStyle]}>
                <GlowCircle size={486} color={colors.lawnGreen} opacity={0.8} id="chat-glow-green-outer" />
                <GlowCircle size={232} color={colors.lawnGreen} opacity={1} id="chat-glow-green-inner" />
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    glowBackground: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
    },
    blueGlowGroup: {
        position: "absolute",
        top: 179,
        left: -48,
        width: 486,
        height: 486,
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
});

export default VoiceModeBackground;
