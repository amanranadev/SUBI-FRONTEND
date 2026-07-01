import React from 'react'
import { TextStyle, TouchableOpacityProps, ViewStyle } from 'react-native'

export type ButtonVariant = 'white' | 'black' | 'orange' | 'primary' | 'secondary'

export type ButtonStyleOverrides = Pick<
  ViewStyle,
  | 'width'
  | 'height'
  | 'flex'
  | 'borderWidth'
  | 'backgroundColor'
  | 'borderColor'
  | 'borderRadius'
  | 'paddingTop'
  | 'paddingBottom'
  | 'paddingLeft'
  | 'paddingRight'
  | 'elevation'
> &
  Pick<TextStyle, 
  | 'fontSize' 
  | 'fontWeight' 
  | 'lineHeight' 
  | 'letterSpacing' 
  | 'color'
  | 'textAlign'
  > & {
    textColor?: string
    shadow?: boolean
  }

export type VariantStyles = {
  backgroundColor: string
  borderColor: string
  textColor: string
}

export type ButtonProps = TouchableOpacityProps & {
  icon?: React.ReactNode
  text: string
  onPress: () => void
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  variant?: ButtonVariant
  fullWidth?: boolean
  // Style overrides for custom styling - only these properties are allowed
  styleOverrides?: ButtonStyleOverrides
}

export default ButtonProps
