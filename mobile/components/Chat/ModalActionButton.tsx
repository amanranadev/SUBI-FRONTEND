import { colors } from '@/constants/colors';
import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

interface ModalActionButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const ModalActionButton: React.FC<ModalActionButtonProps> = ({
  label,
  onPress,
  disabled = false,
  containerStyle,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, containerStyle]}
      activeOpacity={0.7}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 40,
    borderRadius: 9999,
    backgroundColor: colors.primary[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.gray[700],
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.15,
    fontWeight: '500',
    fontFamily: 'Inter',
  },
});

export default ModalActionButton;
