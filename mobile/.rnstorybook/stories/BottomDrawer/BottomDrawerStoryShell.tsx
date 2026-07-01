import React, { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
  BottomDrawer,
  bottomDrawerTokens,
  type BottomDrawerProps,
} from "../../../components/BottomDrawer";
import { PrimaryButton } from "../../../components/PrimaryButton";

interface BottomDrawerStoryShellProps extends Omit<BottomDrawerProps, "open" | "onClose"> {
  initialOpen?: boolean;
  showTrigger?: boolean;
  triggerLabel?: string;
}

export function BottomDrawerStoryShell({
  initialOpen = false,
  showTrigger = true,
  triggerLabel = "Open drawer",
  footer,
  children,
  ...drawerProps
}: BottomDrawerStoryShellProps) {
  const [open, setOpen] = useState(initialOpen);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <View style={styles.screen}>
      {showTrigger ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={triggerLabel}
          onPress={handleOpen}
          style={styles.trigger}
        >
          <Text style={styles.triggerText}>{triggerLabel}</Text>
        </Pressable>
      ) : null}
      <BottomDrawer
        {...drawerProps}
        open={open}
        onClose={handleClose}
        footer={footer}
      >
        {children}
      </BottomDrawer>
    </View>
  );
}

export function BottomDrawerDemoFooter({
  label = "Save",
  onPress,
}: {
  label?: string;
  onPress?: () => void;
}) {
  return (
    <PrimaryButton fullWidth onPress={onPress}>
      {label}
    </PrimaryButton>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 480,
    backgroundColor: "#FFFFFF",
    padding: 16,
    justifyContent: "center",
  },
  trigger: {
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: "#F5821E",
  },
  triggerText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
