import { colors } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CheckboxItem as CheckboxItemType } from "../../types";

interface CheckboxItemProps {
  item: CheckboxItemType;
  onToggle: (id: string) => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({ item, onToggle }) => {
  return (
    <TouchableOpacity
      style={styles.checkboxItem}
      onPress={() => onToggle(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.checkboxWrapper}>
        <View style={[styles.checkbox, item.checked && styles.checkboxChecked]}>
          {item.checked && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>{item.label}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  checkboxItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderColor: colors.gray[400],
    borderRadius: 4,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[800],
  },
  checkmark: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "bold",
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[700],
    fontFamily: "Inter",
    letterSpacing: 0.08,
  },
});

export default CheckboxItem;
