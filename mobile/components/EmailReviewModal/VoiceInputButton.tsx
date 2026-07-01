import Microphone from "@/assets/icons/Microphone";
import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface VoiceInputButtonProps {
  onPress: () => void;
  disabled?: boolean;
  label?: string;
  buttonColor?: string;
  containerStyle?: object;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  onPress,
  disabled = false,
  label = "You can speak or tap your choice",
  buttonColor = colors.primary[400],
  containerStyle,
}) => {
  const getIconColor = () => {
    if (disabled) return colors.gray[400];
    return colors.white;
  };

  const getButtonBackgroundColor = () => {
    if (disabled) return colors.gray[400];
    return buttonColor;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: getButtonBackgroundColor() },
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
      >
        <View style={styles.buttonInner}>
          <Microphone width={24} height={24} color={getIconColor()} />
        </View>
      </TouchableOpacity>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    gap: 12,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  buttonInner: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.gray[600],
    textAlign: "center",
    letterSpacing: -0.15,
  },
});

export default VoiceInputButton;
