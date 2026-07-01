import UserAvatar from "@/components/UserAvatar";
import { colors } from "@/constants/colors";
import { useTransactionManagement } from "@/hooks/useTransactions";
import { BuyerSeller, Transaction } from "@/types/transaction";
import {
  formatPhoneNumber,
  isValidUSAPhoneNumber,
  stripPhoneNumber,
} from "@/utils/phoneUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface ProfileInfoCardProps {
  buyerSeller: BuyerSeller;
  transaction: Transaction;
  label: "Buyer" | "Seller";
  index: number;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const ProfileInfoCard: React.FC<ProfileInfoCardProps> = ({
  buyerSeller,
  transaction,
  label,
  index,
}) => {
  const { updateTransaction } = useTransactionManagement(transaction.id);
  const [isExpanded, setIsExpanded] = useState(false);

  const initials = `${buyerSeller.firstName?.[0] || ""}${buyerSeller.lastName?.[0] || ""}`.toUpperCase();
  const name = `${buyerSeller.firstName} ${buyerSeller.lastName}`.trim() || `${label} ${index + 1}`;
  const isFromDocument = buyerSeller.isFromAPI || false;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      firstName: buyerSeller.firstName || "",
      lastName: buyerSeller.lastName || "",
      email: buyerSeller.email || "",
      phone: buyerSeller.phone ? formatPhoneNumber(buyerSeller.phone) : "",
    },
  });

  // Update form data when buyerSeller changes
  useEffect(() => {
    const phoneValue = buyerSeller.phone || "";

    reset({
      firstName: buyerSeller.firstName || "",
      lastName: buyerSeller.lastName || "",
      email: buyerSeller.email || "",
      phone: phoneValue ? formatPhoneNumber(phoneValue) : "",
    });
  }, [buyerSeller, reset]);

  const onSubmit = (data: ClientFormData) => {
    // Strip phone number formatting before saving to API
    const phoneForAPI = data.phone ? stripPhoneNumber(data.phone) : "";

    const updatedBuyerSeller = {
      ...buyerSeller,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: phoneForAPI,
    };

    const buyers = transaction.buyersAndSellersParsed?.buyers || [];
    const sellers = transaction.buyersAndSellersParsed?.sellers || [];

    let updatedBuyers = [...buyers];
    let updatedSellers = [...sellers];

    if (label === "Buyer") {
      updatedBuyers[index] = updatedBuyerSeller;
    } else {
      updatedSellers[index] = updatedBuyerSeller;
    }

    const updatedBuyersAndSellers = {
      buyers: updatedBuyers,
      sellers: updatedSellers,
    };

    const updates: Partial<Transaction> = {
      buyersAndSellers: JSON.stringify(updatedBuyersAndSellers),
      buyers_and_sellers: JSON.stringify(updatedBuyersAndSellers),
      buyersAndSellersParsed: updatedBuyersAndSellers,
    };

    updateTransaction({ transactionId: transaction.id, updates });
    setIsExpanded(false);
  };

  const handleSaveToContacts = () => {
    // Placeholder for future implementation
    console.log("Save to contacts:", buyerSeller);
  };

  const handleDelete = () => {
    const buyers = transaction.buyersAndSellersParsed?.buyers || [];
    const sellers = transaction.buyersAndSellersParsed?.sellers || [];

    let updatedBuyers = [...buyers];
    let updatedSellers = [...sellers];

    if (label === "Buyer") {
      updatedBuyers = updatedBuyers.filter((_, i) => i !== index);
    } else {
      updatedSellers = updatedSellers.filter((_, i) => i !== index);
    }

    const updatedBuyersAndSellers = {
      buyers: updatedBuyers,
      sellers: updatedSellers,
    };

    const updates: Partial<Transaction> = {
      buyersAndSellers: JSON.stringify(updatedBuyersAndSellers),
      buyers_and_sellers: JSON.stringify(updatedBuyersAndSellers),
      buyersAndSellersParsed: updatedBuyersAndSellers,
    };

    updateTransaction({ transactionId: transaction.id, updates });
  };

  return (
    <View style={styles.card}>
      <View style={styles.itemContainer}>
        <View style={styles.itemContent}>
          <UserAvatar
            initials={initials || "?"}
            size={40}
            backgroundColor={colors.purple[100]}
          />
          <View style={styles.itemInfo}>
            <View style={styles.itemNameRow}>
              <Text style={styles.itemName}>{name}</Text>
              {isFromDocument && (
                <View style={styles.fromDocumentTag}>
                  <Text style={styles.fromDocumentText}>from document</Text>
                </View>
              )}
            </View>
            {buyerSeller.email && (
              <Text style={styles.itemEmail}>{buyerSeller.email}</Text>
            )}
            {buyerSeller.phone && (
              <Text style={styles.itemPhone}>
                {formatPhoneNumber(buyerSeller.phone)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.itemActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsExpanded(!isExpanded)}
            accessibilityLabel={isExpanded ? `Hide ${name} edit form` : `Show ${name} edit form`}
          >
            <Ionicons
              name={isExpanded ? "eye-off" : "eye"}
              size={20}
              color={colors.gray[600]}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert(
                "Delete Contact",
                `Are you sure you want to delete ${name}?`,
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: handleDelete,
                  },
                ]
              );
            }}
            accessibilityLabel={`Delete ${name}`}
          >
            <Ionicons name="trash" size={20} color={colors.red[500]} />
          </TouchableOpacity>
        </View>
      </View>

      {isExpanded && (
        <View style={styles.formContainer}>
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>
                First Name <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <Controller
                control={control}
                name="firstName"
                rules={{
                  maxLength: {
                    value: 50,
                    message: "First name cannot be more than 50 characters",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.firstName && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="First name"
                    placeholderTextColor={colors.gray[500]}
                    maxLength={50}
                  />
                )}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>
                  {errors.firstName.message as string}
                </Text>
              )}
            </View>

            <View style={styles.formField}>
              <Text style={styles.fieldLabel}>
                Last Name <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <Controller
                control={control}
                name="lastName"
                rules={{
                  maxLength: {
                    value: 50,
                    message: "Last name cannot be more than 50 characters",
                  },
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={[styles.input, errors.lastName && styles.inputError]}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Last name"
                    placeholderTextColor={colors.gray[500]}
                    maxLength={50}
                  />
                )}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>
                  {errors.lastName.message as string}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              Email Address <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <Controller
              control={control}
              name="email"
              rules={{
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Email is invalid",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.inputError]}
                  value={value}
                  onChangeText={onChange}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.gray[500]}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>
                {errors.email.message as string}
              </Text>
            )}
          </View>

          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>
              Phone Number <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <Controller
              control={control}
              name="phone"
              rules={{
                validate: (value) => {
                  if (!value || value.trim() === "") return true; // Allow empty
                  return (
                    isValidUSAPhoneNumber(value) ||
                    "Phone number must be 10 digits"
                  );
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={value}
                  onChangeText={(text) => {
                    // Format phone number as user types
                    const formatted = formatPhoneNumber(text);
                    onChange(formatted);
                  }}
                  placeholder="(xxx)-xxx-xxxx"
                  placeholderTextColor={colors.gray[500]}
                  keyboardType="phone-pad"
                  maxLength={14}
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.errorText}>
                {errors.phone.message as string}
              </Text>
            )}
          </View>

          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsExpanded(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
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
    borderColor: colors.gray[300],
    padding: 12,
    marginBottom: 8,
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  itemInfo: {
    flex: 1,
    gap: 4,
  },
  itemNameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[900],
  },
  itemEmail: {
    fontSize: 14,
    color: colors.gray[600],
  },
  itemPhone: {
    fontSize: 14,
    color: colors.gray[600],
  },
  fromDocumentTag: {
    backgroundColor: colors.blue[100],
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fromDocumentText: {
    fontSize: 10,
    color: colors.blue[700],
    fontWeight: "500",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  formContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 8,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: "400",
    color: colors.gray[500],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.gray[900],
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.red[500],
  },
  errorText: {
    fontSize: 12,
    color: colors.red[500],
    marginTop: 4,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[600],
  },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.gray[900],
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});

export default ProfileInfoCard;
