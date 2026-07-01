import { colors } from "@/constants/colors";
import { useTransactionManagement } from "@/hooks/useTransactions";
import { Transaction } from "@/types";
import {
  formatPhoneNumber,
  isValidUSAPhoneNumber,
  stripPhoneNumber,
} from "@/utils/phoneUtils";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import FormInput from "../FormInput";
import SaveButton from "../SaveButton";

interface ClientsProps {
  transaction: Transaction;
}

interface ClientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const Clients: React.FC<ClientsProps> = ({ transaction }) => {
  const { updateTransaction } = useTransactionManagement(transaction.id);

  const buyers = transaction.buyersAndSellersParsed?.buyers || [];
  const firstBuyer = buyers[0] || {};

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    defaultValues: {
      firstName: firstBuyer.firstName || "",
      lastName: firstBuyer.lastName || "",
      email: firstBuyer.email || "",
      phone: firstBuyer.phone ? formatPhoneNumber(firstBuyer.phone) : "",
    },
  });

  // Update form data when transaction changes
  useEffect(() => {
    const buyers = transaction.buyersAndSellersParsed?.buyers || [];
    const firstBuyer = buyers[0] || {};
    const phoneValue = firstBuyer.phone || "";

    reset({
      firstName: firstBuyer.firstName || "",
      lastName: firstBuyer.lastName || "",
      email: firstBuyer.email || "",
      phone: phoneValue ? formatPhoneNumber(phoneValue) : "",
    });
  }, [transaction, reset]);

  const onSubmit = (data: ClientFormData) => {
    const buyers = transaction.buyersAndSellersParsed?.buyers || [];
    const firstBuyer = buyers[0] || {};

    // Strip phone number formatting before saving to API
    const phoneForAPI = data.phone ? stripPhoneNumber(data.phone) : "";

    const updatedBuyer = {
      ...firstBuyer,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: phoneForAPI,
    };

    const updatedBuyers = [updatedBuyer, ...buyers.slice(1)];

    const updatedBuyersAndSellers = {
      buyers: updatedBuyers,
      sellers: transaction.buyersAndSellersParsed?.sellers || [],
    };

    const updates: Partial<Transaction> = {
      buyersAndSellers: JSON.stringify(updatedBuyersAndSellers),
      buyers_and_sellers: JSON.stringify(updatedBuyersAndSellers),
      buyersAndSellersParsed: updatedBuyersAndSellers,
    };

    updateTransaction({ transactionId: transaction.id, updates });
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
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
                <FormInput
                  field={{
                    id: "firstName",
                    label: "Client first name",
                    value: value,
                    placeholder: "Enter first name",
                  }}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>
                {errors.firstName.message as string}
              </Text>
            )}
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
                <FormInput
                  field={{
                    id: "lastName",
                    label: "Client last name",
                    value: value,
                    placeholder: "Enter last name",
                  }}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>
                {errors.lastName.message as string}
              </Text>
            )}
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
                <FormInput
                  field={{
                    id: "email",
                    label: "Client email",
                    value: value,
                    placeholder: "Enter email address",
                    keyboardType: "email-address",
                  }}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && (
              <Text style={styles.errorText}>
                {errors.email.message as string}
              </Text>
            )}
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
                <FormInput
                  field={{
                    id: "phone",
                    label: "Client phone",
                    value: value,
                    placeholder: "(xxx)-xxx-xxxx",
                    keyboardType: "phone-pad",
                  }}
                  onChangeText={(text) => {
                    // Format phone number as user types
                    const formatted = formatPhoneNumber(text);
                    onChange(formatted);
                  }}
                />
              )}
            />
            {errors.phone && (
              <Text style={styles.errorText}>
                {errors.phone.message as string}
              </Text>
            )}
          </View>

          <SaveButton onPress={handleSubmit(onSubmit)} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: colors.primary[400],
    marginTop: 4,
  },
  inputError: {
    borderColor: colors.primary[400],
  },
});

export default Clients;
