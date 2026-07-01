import { colors } from "@/constants/colors";
import {
  formatPhoneNumber,
  isValidUSAPhoneNumber,
} from "@/utils/phoneUtils";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Controller,
  Control,
  FieldErrors,
  UseFormSetValue,
  UseFormGetValues,
} from "react-hook-form";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BuyersAndSellersFormData, PartyFormData } from "./types";

interface PartyCardProps {
  index: number;
  party: PartyFormData;
  type: "buyer" | "seller";
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: () => void;
  control: Control<BuyersAndSellersFormData>;
  errors: FieldErrors<BuyersAndSellersFormData>;
  setValue: UseFormSetValue<BuyersAndSellersFormData>;
  getValues: UseFormGetValues<BuyersAndSellersFormData>;
}

const PartyCard: React.FC<PartyCardProps> = ({
  index,
  party,
  type,
  isExpanded,
  onToggleExpand,
  onDelete,
  control,
  errors,
}) => {
  const fieldPrefix = type === "buyer" ? "buyers" : "sellers";
  const label = type === "buyer" ? "Buyer" : "Seller";
  const partyErrors = errors[fieldPrefix]?.[index];

  const displayName =
    party.firstName && party.lastName
      ? `${party.firstName} ${party.lastName}`
      : `${label} ${index + 1}`;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.cardTitle}>
            {isExpanded ? `${label} ${index + 1}` : displayName}
          </Text>
          {party.isFromAPI && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>from document</Text>
            </View>
          )}
        </View>
        <View style={styles.headerRight}>
          {!party.isFromAPI && (
            <TouchableOpacity
              onPress={onDelete}
              style={styles.iconButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash-outline" size={18} color={colors.primary[400]} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={onToggleExpand}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={isExpanded ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.gray[600]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.cardContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>First Name</Text>
            <Controller
              control={control}
              name={`${fieldPrefix}.${index}.firstName`}
              rules={{
                maxLength: {
                  value: 50,
                  message: "First name cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter first name"
                    placeholderTextColor={colors.gray[500]}
                    returnKeyType="done"
                  />
                </View>
              )}
            />
            {partyErrors?.firstName && (
              <Text style={styles.errorText}>
                {partyErrors.firstName.message as string}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Last Name</Text>
            <Controller
              control={control}
              name={`${fieldPrefix}.${index}.lastName`}
              rules={{
                maxLength: {
                  value: 50,
                  message: "Last name cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter last name"
                    placeholderTextColor={colors.gray[500]}
                    returnKeyType="done"
                  />
                </View>
              )}
            />
            {partyErrors?.lastName && (
              <Text style={styles.errorText}>
                {partyErrors.lastName.message as string}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <Controller
              control={control}
              name={`${fieldPrefix}.${index}.email`}
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email is invalid",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter email address"
                    placeholderTextColor={colors.gray[500]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                  />
                </View>
              )}
            />
            {partyErrors?.email && (
              <Text style={styles.errorText}>
                {partyErrors.email.message as string}
              </Text>
            )}
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone</Text>
            <Controller
              control={control}
              name={`${fieldPrefix}.${index}.phone`}
              rules={{
                validate: (value) => {
                  if (!value || value.trim() === "") return true;
                  return (
                    isValidUSAPhoneNumber(value) ||
                    "Phone number must be 10 digits"
                  );
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) => {
                      const formatted = formatPhoneNumber(text);
                      onChange(formatted);
                    }}
                    placeholder="(xxx)-xxx-xxxx"
                    placeholderTextColor={colors.gray[500]}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                  />
                </View>
              )}
            />
            {partyErrors?.phone && (
              <Text style={styles.errorText}>
                {partyErrors.phone.message as string}
              </Text>
            )}
          </View>

          <Controller
            control={control}
            name={`${fieldPrefix}.${index}.representing`}
            render={({ field: { onChange, value } }) => (
              <TouchableOpacity
                style={styles.checkboxContainer}
                onPress={() => onChange(!value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    value && styles.checkboxChecked,
                  ]}
                >
                  {value && (
                    <Ionicons name="checkmark" size={14} color={colors.white} />
                  )}
                </View>
                <Text style={styles.checkboxLabel}>
                  I am representing this {type}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[400],
    marginBottom: 12,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[800],
  },
  badge: {
    backgroundColor: colors.blue[100],
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.blue[800],
  },
  iconButton: {
    padding: 4,
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  inputContainer: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.gray[800],
    marginBottom: 8,
  },
  inputWrapper: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[500],
    borderRadius: 8,
    height: 46,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  input: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.gray[800],
  },
  errorText: {
    fontSize: 12,
    color: colors.primary[400],
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.gray[500],
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.gray[800],
    borderColor: colors.gray[800],
  },
  checkboxLabel: {
    fontSize: 14,
    color: colors.gray[700],
  },
});

export default PartyCard;
