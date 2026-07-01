import { useTransactionManagement } from "@/hooks/useTransactions";
import { Transaction } from "@/types";
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
import CheckboxItem from "../CheckboxItem";
import FormInput from "../FormInput";
import SaveButton from "../SaveButton";
import { colors } from "@/constants/colors";

interface PropertyProps {
  transaction: Transaction;
}

interface PropertyFormData {
  address: string;
  parcel: string;
  nwmls: string;
  cityState: string;
  yearBuilt: string;
}

const Property: React.FC<PropertyProps> = ({ transaction }) => {
  const { updateTransaction } = useTransactionManagement(transaction.id);

  const { control, handleSubmit, reset, watch, formState: { errors } } = useForm<PropertyFormData>({
    defaultValues: {
      address: transaction.address || "",
      parcel: transaction.parcelNumber || transaction.parcel_number || "",
      nwmls: transaction.nwmlsNumber || transaction.nwmls_number || "",
      cityState: transaction.cityState || transaction.city_state || "",
      yearBuilt: transaction.age ? new Date(transaction.age).getFullYear().toString() : "",
    },
  });

  const [itemsThatStay, setItemsThatStay] = React.useState([
    { id: "washer", label: "Washer", checked: false },
    { id: "ceiling-fans", label: "Ceiling fans", checked: false },
    { id: "dryer", label: "Dryer", checked: false },
    { id: "window-treatments", label: "Window treatments", checked: false },
    { id: "garage-openers", label: "Garage door openers", checked: false },
  ]);

  // Update form data when transaction changes
  useEffect(() => {
    reset({
      address: transaction.address || "",
      parcel: transaction.parcelNumber || transaction.parcel_number || "",
      nwmls: transaction.nwmlsNumber || transaction.nwmls_number || "",
      cityState: transaction.cityState || transaction.city_state || "",
      yearBuilt: transaction.age ? new Date(transaction.age).getFullYear().toString() : "",
    });
    const itemsThatStayString = transaction.itemsThatStay || transaction.items_that_stay || "";
    if (itemsThatStayString) {
      const itemsThatStayArray = itemsThatStayString.split(", ");
      setItemsThatStay((prev) =>
        prev.map((item) => ({
          ...item,
          checked: itemsThatStayArray.includes(item.label)
        }))
      );
    }
  }, [transaction, reset]);

  const handleCheckboxToggle = (id: string) => {
    setItemsThatStay((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const onSubmit = (data: PropertyFormData) => {
    const year = String(data.yearBuilt).padStart(4, "0");
    const fullDateTime = `${year}-01-01T00:00:00.000Z`;
    const updates: Partial<Transaction> = {
      address: data.address,
      parcelNumber: data.parcel,
      parcel_number: data.parcel,
      nwmlsNumber: data.nwmls,
      nwmls_number: data.nwmls,
      cityState: data.cityState,
      city_state: data.cityState,
      age: fullDateTime,
    };

    // Add items that stay
    const itemsThatStayString = itemsThatStay
      .filter((item) => item.checked)
      .map((item) => item.label)
      .join(", ");
    updates.itemsThatStay = itemsThatStayString;
    updates.items_that_stay = itemsThatStayString;

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
              name="address"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Property address cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "address",
                    label: "Property address",
                    value: value,
                    placeholder: "Enter property address",
                  }}
                  onChangeText={onChange}
                  style={errors.address && styles.inputError}
                />
              )}
            />
            {errors.address && (
              <Text style={styles.errorText}>
                {errors.address.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="parcel"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Parcel number cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "parcel",
                    label: "Parcel number",
                    value: value,
                    placeholder: "Enter parcel number",
                  }}
                  style={errors.parcel && styles.inputError}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.parcel && (
              <Text style={styles.errorText}>
                {errors.parcel.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="nwmls"
              rules={{
                maxLength: {
                  value: 50,
                  message: "NWMLS number cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "nwmls",
                    label: "NWMLS Number",
                    value: value,
                    placeholder: "Enter NWMLS number",
                  }}
                  style={errors.nwmls && styles.inputError}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.nwmls && (
              <Text style={styles.errorText}>
                {errors.nwmls.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="cityState"
              rules={{
                maxLength: {
                  value: 50,
                  message: "City, state cannot be more than 50 characters",
                },
              }}
              
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "cityState",
                    label: "City, State",
                    value: value,
                    placeholder: "Enter city, state",
                  }}
                  style={errors.cityState && styles.inputError}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.cityState && (
              <Text style={styles.errorText}>
                {errors.cityState.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="yearBuilt"
              rules={{
                maxLength: {
                  value: 4,
                  message: "Year built cannot be more than current year",
                },
                min: {
                  value: new Date().getFullYear() - 100,
                  message: "Year built cannot be less than 100 years ago",
                },
                max: {
                  value: new Date().getFullYear(),
                  message: "Year built cannot be more than current year",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "yearBuilt",
                    label: "Year built",
                    value: value,
                    placeholder: "Enter year built",
                    keyboardType: "numeric",
                  }}
                  style={errors.yearBuilt && styles.inputError}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.yearBuilt && (
              <Text style={styles.errorText}>
                {errors.yearBuilt?.message as string}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items that stay</Text>
            <View style={styles.checkboxContainer}>
              {itemsThatStay.map((item) => (
                <CheckboxItem
                  key={item.id}
                  item={item}
                  onToggle={handleCheckboxToggle}
                />
              ))}
            </View>
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: "400",
    color: "#2b2827",
    marginBottom: 8,
    fontFamily: "Inter",
  },
  checkboxContainer: {
    gap: 16,
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

export default Property;
