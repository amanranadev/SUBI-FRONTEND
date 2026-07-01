import React, { useEffect, useRef } from "react";
import { Animated, View } from "react-native";
import { colors } from "@/constants/colors";

interface CompactSoundBarsProps {
  color?: string;
}

export const CompactSoundBars: React.FC<CompactSoundBarsProps> = ({
  color = colors.white
}) => {
  const anim1 = useRef(new Animated.Value(0.3)).current;
  const anim2 = useRef(new Animated.Value(0.5)).current;
  const anim3 = useRef(new Animated.Value(0.7)).current;
  const anim4 = useRef(new Animated.Value(0.5)).current;
  const anim5 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const createAnimation = (animValue: Animated.Value, delay: number) => {
      return Animated.sequence([
        Animated.delay(delay),
        Animated.loop(
          Animated.sequence([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 400,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0.3,
              duration: 400,
              useNativeDriver: false,
            }),
          ])
        ),
      ]);
    };

    const animations = [
      createAnimation(anim1, 0),
      createAnimation(anim2, 80),
      createAnimation(anim3, 160),
      createAnimation(anim4, 240),
      createAnimation(anim5, 320),
    ];

    Animated.parallel(animations).start();

    return () => {
      animations.forEach((anim) => anim.stop());
    };
  }, [anim1, anim2, anim3, anim4, anim5]);

  const bars = [
    { anim: anim1, height: 16 },
    { anim: anim2, height: 24 },
    { anim: anim3, height: 32 },
    { anim: anim4, height: 24 },
    { anim: anim5, height: 16 },
  ];

  return (
    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 }}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={{
            width: 4,
            borderRadius: 2,
            backgroundColor: color,
            height: bar.anim.interpolate({
              inputRange: [0, 1],
              outputRange: [bar.height * 0.3, bar.height],
            }),
          }}
        />
      ))}
    </View>
  );
};

export default CompactSoundBars;
