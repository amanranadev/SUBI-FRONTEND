import { colors } from '@/constants/colors'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import ButtonProps, { ButtonVariant, VariantStyles } from './types'

const Button: React.FC<ButtonProps> = ({
  icon,
  text,
  onPress,
  disabled = false,
  style,
  textStyle,
  variant = 'white',
  fullWidth = false,
  styleOverrides,
  testID,
  ...props
}) => {
  // Get variant-specific styles
  const getVariantStyles = (variant: ButtonVariant): VariantStyles => {
    switch (variant) {
      case 'black':
        return {
          backgroundColor: colors.black,
          borderColor: colors.black,
          textColor: colors.white,
        }
      case 'orange':
      case 'primary':
        return {
          backgroundColor: colors.primary[400],
          borderColor: colors.primary[400],
          textColor: colors.white,
        }
      case 'secondary':
        return {
          backgroundColor: colors.gray[300],
          borderColor: colors.gray[300],
          textColor: colors.gray[800],
        }
      case 'white':
      default:
        return {
          backgroundColor: colors.white,
          borderColor: '#000',
          textColor: colors.gray[800],
        }
    }
  }

  const variantStyles = getVariantStyles(variant)

  // Shadow styles
  const shadowStyles: ViewStyle = styleOverrides?.shadow !== false ? {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: styleOverrides?.elevation ?? 2,
  } : {}

  // Extract ViewStyle properties from styleOverrides
  const viewStyleOverrides: ViewStyle = styleOverrides ? {
    ...(styleOverrides.width !== undefined && { width: styleOverrides.width }),
    ...(styleOverrides.height !== undefined && { height: styleOverrides.height }),
    ...(styleOverrides.flex !== undefined && { flex: styleOverrides.flex }),
    ...(styleOverrides.borderWidth !== undefined && { borderWidth: styleOverrides.borderWidth }),
    ...(styleOverrides.backgroundColor !== undefined && { backgroundColor: styleOverrides.backgroundColor }),
    ...(styleOverrides.borderColor !== undefined && { borderColor: styleOverrides.borderColor }),
    ...(styleOverrides.borderRadius !== undefined && { borderRadius: styleOverrides.borderRadius }),
    ...(styleOverrides.paddingTop !== undefined && { paddingTop: styleOverrides.paddingTop }),
    ...(styleOverrides.paddingBottom !== undefined && { paddingBottom: styleOverrides.paddingBottom }),
    ...(styleOverrides.paddingLeft !== undefined && { paddingLeft: styleOverrides.paddingLeft }),
    ...(styleOverrides.paddingRight !== undefined && { paddingRight: styleOverrides.paddingRight }),
  } : {}

  // Apply styleOverrides directly with variant defaults as fallback
  const dynamicStyles: ViewStyle = {
    backgroundColor: viewStyleOverrides.backgroundColor ?? variantStyles.backgroundColor,
    borderColor: viewStyleOverrides.borderColor ?? variantStyles.borderColor,
    ...viewStyleOverrides,
    ...(fullWidth && { width: '100%' as const }),
    ...shadowStyles,
  }

  const buttonStyle = [
    styles.button,
    dynamicStyles,
    disabled && styles.buttonDisabled,
    style,
  ]

  const textStyleFinal = [
    styles.buttonText,
    {
      color: styleOverrides?.textColor ?? variantStyles.textColor,
      fontSize: styleOverrides?.fontSize,
      fontWeight: styleOverrides?.fontWeight ?? '500',
      lineHeight: styleOverrides?.lineHeight ?? 20,
      letterSpacing: styleOverrides?.letterSpacing ?? -0.15,
    },
    disabled && styles.buttonTextDisabled,
    textStyle, // textStyle prop can override everything
  ]

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityState={{ disabled }}
      {...props}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={textStyleFinal}>
        {text}
      </Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    gap: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    backgroundColor: colors.buttonDisabled,
    borderColor: colors.gray[500],
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 0,
  },
  buttonText: {
    // fontWeight is now handled dynamically via styleOverrides
  },
  buttonTextDisabled: {
    color: colors.white,
  },
})

export default Button
