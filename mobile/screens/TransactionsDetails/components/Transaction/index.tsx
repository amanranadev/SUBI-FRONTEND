import { colors } from "@/constants/colors";
import { useTransactionManagement } from "@/hooks/useTransactions";
import { Transaction as TransactionType } from "@/types";
import { formatPrice } from "@/utils/transactionUtils";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import SaveButton from "../SaveButton";

interface TransactionProps {
  transaction: TransactionType;
}

interface TransactionFormData {
  pendDate: Date | null;
  closeDate: Date | null;
  amount: string;
  earnestMoney: string;
}

const Transaction: React.FC<TransactionProps> = ({ transaction }) => {
  const { updateTransaction } = useTransactionManagement(transaction.id);
  const [showPendDatePicker, setShowPendDatePicker] = useState(false);
  const [showCloseDatePicker, setShowCloseDatePicker] = useState(false);

  const parsePrice = (value: number | string | undefined): string => {
    if (!value) return "";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return isNaN(num) ? "" : num.toString();
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    defaultValues: {
      pendDate: transaction.pendDate ? new Date(transaction.pendDate) : null,
      closeDate: transaction.closeDate ? new Date(transaction.closeDate) : null,
      amount: parsePrice(transaction.amount),
      earnestMoney: parsePrice(transaction.earnestMoney),
    },
  });

  useEffect(() => {
    reset({
      pendDate: transaction.pendDate ? new Date(transaction.pendDate) : null,
      closeDate: transaction.closeDate ? new Date(transaction.closeDate) : null,
      amount: parsePrice(transaction.amount),
      earnestMoney: parsePrice(transaction.earnestMoney),
    });
  }, [transaction, reset]);

  const formatCurrency = (value: string): string => {
    const num = value.replace(/[^0-9.]/g, "");
    const parts = num.split(".");
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("");
    }
    return num;
  };

  const onSubmit = (data: TransactionFormData) => {
    const updates: Partial<TransactionType> = {
      pendDate: data.pendDate ? data.pendDate.toISOString() : "",
      pend_date: data.pendDate ? data.pendDate.toISOString() : "",
      closeDate: data.closeDate ? data.closeDate.toISOString() : "",
      close_date: data.closeDate ? data.closeDate.toISOString() : "",
      amount: data.amount ? parseFloat(data.amount) : 0,
      earnestMoney: data.earnestMoney ? parseFloat(data.earnestMoney) : 0,
      earnest_money: data.earnestMoney ? parseFloat(data.earnestMoney) : 0,
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

          {/* Pending Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Pending Date<Text style={styles.required}> *</Text>
            </Text>
            <Controller
              control={control}
              name="pendDate"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowPendDatePicker(true)}
                  >
                    <Text style={value ? styles.dateText : styles.datePlaceholder}>
                      {value ? format(value, "MMM dd, yyyy") : "Select date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
                  </TouchableOpacity>
                  {showPendDatePicker && (
                    Platform.OS === "ios" ? (
                      <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                          <TouchableOpacity onPress={() => setShowPendDatePicker(false)}>
                            <Text style={styles.datePickerCancel}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setShowPendDatePicker(false)}>
                            <Text style={styles.datePickerDone}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={value || new Date()}
                          mode="date"
                          display="spinner"
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              onChange(selectedDate);
                            }
                          }}
                          style={styles.datePicker}
                        />
                      </View>
                    ) : (
                      <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowPendDatePicker(false);
                          if (event.type === "set" && selectedDate) {
                            onChange(selectedDate);
                          }
                        }}
                      />
                    )
                  )}
                </>
              )}
            />
          </View>

          {/* Closing Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Closing Date<Text style={styles.required}> *</Text>
            </Text>
            <Controller
              control={control}
              name="closeDate"
              render={({ field: { onChange, value } }) => (
                <>
                  <TouchableOpacity
                    style={styles.dateInput}
                    onPress={() => setShowCloseDatePicker(true)}
                  >
                    <Text style={value ? styles.dateText : styles.datePlaceholder}>
                      {value ? format(value, "MMM dd, yyyy") : "Select date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
                  </TouchableOpacity>
                  {showCloseDatePicker && (
                    Platform.OS === "ios" ? (
                      <View style={styles.datePickerContainer}>
                        <View style={styles.datePickerHeader}>
                          <TouchableOpacity onPress={() => setShowCloseDatePicker(false)}>
                            <Text style={styles.datePickerCancel}>Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => setShowCloseDatePicker(false)}>
                            <Text style={styles.datePickerDone}>Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={value || new Date()}
                          mode="date"
                          display="spinner"
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              onChange(selectedDate);
                            }
                          }}
                          style={styles.datePicker}
                        />
                      </View>
                    ) : (
                      <DateTimePicker
                        value={value || new Date()}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                          setShowCloseDatePicker(false);
                          if (event.type === "set" && selectedDate) {
                            onChange(selectedDate);
                          }
                        }}
                      />
                    )
                  )}
                </>
              )}
            />
          </View>

          {/* Sale Price */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Sale Price<Text style={styles.required}> *</Text>
            </Text>
            <Controller
              control={control}
              name="amount"
              rules={{
                validate: (value) => {
                  if (!value) return true;
                  const num = parseFloat(value);
                  return !isNaN(num) || "Please enter a valid amount";
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.currencyInputWrapper}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    value={value}
                    onChangeText={(text) => onChange(formatCurrency(text))}
                    placeholder="0.00"
                    placeholderTextColor={colors.gray[500]}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              )}
            />
            {errors.amount && (
              <Text style={styles.errorText}>{errors.amount.message}</Text>
            )}
          </View>

          {/* Earnest Money */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Earnest Money</Text>
            <Controller
              control={control}
              name="earnestMoney"
              rules={{
                validate: (value) => {
                  if (!value) return true;
                  const num = parseFloat(value);
                  return !isNaN(num) || "Please enter a valid amount";
                },
              }}
              render={({ field: { onChange, value } }) => (
                <View style={styles.currencyInputWrapper}>
                  <Text style={styles.currencyPrefix}>$</Text>
                  <TextInput
                    style={styles.currencyInput}
                    value={value}
                    onChangeText={(text) => onChange(formatCurrency(text))}
                    placeholder="0.00"
                    placeholderTextColor={colors.gray[500]}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>
              )}
            />
            {errors.earnestMoney && (
              <Text style={styles.errorText}>{errors.earnestMoney.message}</Text>
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
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.gray[800],
    marginBottom: 8,
  },
  required: {
    color: colors.primary[400],
  },
  dateInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[500],
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 14,
    color: colors.gray[800],
  },
  datePlaceholder: {
    fontSize: 14,
    color: colors.gray[500],
  },
  datePickerContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.gray[500],
    overflow: "hidden",
  },
  datePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[400],
  },
  datePickerCancel: {
    fontSize: 16,
    color: colors.gray[600],
  },
  datePickerDone: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.blue[500],
  },
  datePicker: {
    height: 200,
  },
  currencyInputWrapper: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[500],
    borderRadius: 8,
    height: 46,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  currencyPrefix: {
    fontSize: 14,
    color: colors.gray[600],
    marginRight: 4,
  },
  currencyInput: {
    flex: 1,
    fontSize: 14,
    color: colors.gray[800],
  },
  errorText: {
    fontSize: 12,
    color: colors.primary[400],
    marginTop: 4,
  },
});

export default Transaction;
