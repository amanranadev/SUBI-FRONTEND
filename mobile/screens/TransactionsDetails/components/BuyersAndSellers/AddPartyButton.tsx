import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

interface AddPartyButtonProps {
  label: string;
  onPress: () => void;
}

const AddPartyButton: React.FC<AddPartyButtonProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name="add" size={18} color={colors.gray[700]} />
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[500],
    borderStyle: "dashed",
    backgroundColor: colors.gray[100],
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
  },
});

export default AddPartyButton;
