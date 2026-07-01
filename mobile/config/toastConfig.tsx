import Check from "@/assets/icons/Check";
import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TaskSuccessProps {
  text1: string;
  text2: string;
  data?: {
    id: string;
    undoAction: () => void;
  };
}

export const toastConfig = {
  frequencyUpdated: (props: any) => {
    const { text1 } = props;

    return (
      <View style={styles.toastContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Check />
          </View>
          <Text style={styles.messageText}>{text1}</Text>
        </View>
      </View>
    );
  },

  taskSuccess: (props: any) => {
    const { text1, text2, props: customProps } = props;

    return (
      <View style={styles.toastContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
            <Check />
          </View>
          <Text style={styles.messageText}>{text1}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            customProps?.undoAction?.();
          }}
        >
          <Text style={styles.actionText}>{text2}</Text>
        </TouchableOpacity>
      </View>
    );
  },
};

const styles = StyleSheet.create({
  toastContainer: {
    height: 64,
    justifyContent: "space-between",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.accentGreen,
    backgroundColor: colors.accentGreenLight,
    flexDirection: "row",
    width: "90%",
    padding: 20,
    marginHorizontal: 10,
    alignItems: "center",
  },
  contentContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconContainer: {
    backgroundColor: colors.accentGreen,
    borderRadius: 100,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  messageText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[800],
  },
  actionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[800],
    textDecorationLine: "underline",
  },
});
