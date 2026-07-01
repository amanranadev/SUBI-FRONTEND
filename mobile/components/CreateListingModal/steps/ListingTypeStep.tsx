import { colors } from "@/constants/colors";
import { LISTING_TYPE_LABELS, LISTING_TYPES, ListingType } from "../types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface ListingTypeStepProps {
  selectedType: ListingType | null;
  onTypeSelect: (type: ListingType) => void;
  error?: string;
}

export const ListingTypeStep: React.FC<ListingTypeStepProps> = ({
  selectedType,
  onTypeSelect,
  error,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>What type of listing is this?</Text>
      <Text style={styles.subtitle}>
        Choose the type of listing you want to create
      </Text>

      <View style={styles.optionsContainer}>
        {Object.entries(LISTING_TYPES).map(([key, value]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.optionCard,
              selectedType === value && styles.optionCardSelected,
            ]}
            onPress={() => onTypeSelect(value)}
            accessibilityLabel={`Select ${LISTING_TYPE_LABELS[value]}`}
          >
            <View style={styles.optionContent}>
              <Text
                style={[
                  styles.optionText,
                  selectedType === value && styles.optionTextSelected,
                ]}
              >
                {LISTING_TYPE_LABELS[value]}
              </Text>
              {selectedType === value && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.gray[900]}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray[600],
    marginBottom: 24,
    textAlign: "center",
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gray[300],
  },
  optionCardSelected: {
    borderColor: colors.gray[900],
    backgroundColor: colors.gray[50],
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[700],
  },
  optionTextSelected: {
    fontWeight: "600",
    color: colors.gray[900],
  },
  errorText: {
    fontSize: 14,
    color: colors.red[500],
    marginTop: 8,
    textAlign: "center",
  },
});
