import React, { memo } from "react";
import type { StyleProp, ViewStyle } from "react-native";

import { AppHeader } from "@/components/AppHeader";

import { loginScreenTokens } from "./loginScreen.tokens";

export interface LoginScreenHeaderProps {
  containerStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Login-specific header composition.
 *
 * Uses the shared AppHeader primitive with logo-only defaults. Auth screens can
 * evolve independently here (e.g. back button on forgot-password, centered logo,
 * alternate actions) without coupling those concerns into AppHeader itself.
 */
export const LoginScreenHeader = memo(function LoginScreenHeader({
  containerStyle,
  testID = "login-screen-header",
}: LoginScreenHeaderProps) {
  return (
    <AppHeader
      variant="transparent"
      containerStyle={[
        { backgroundColor: loginScreenTokens.colors.screenBackground },
        containerStyle,
      ]}
      testID={testID}
    />
  );
});
