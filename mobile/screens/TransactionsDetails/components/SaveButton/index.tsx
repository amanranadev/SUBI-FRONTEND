import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SaveButtonProps {
  onPress: () => void;
}

const SaveButton: React.FC<SaveButtonProps> = ({ onPress }) => {
  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={styles.saveButton}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    alignItems: "flex-end",
    marginTop: 24,
  },
  saveButton: {
    backgroundColor: colors.gray[800],
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.white,
    fontFamily: "Inter",
  },
});

export default SaveButton;
