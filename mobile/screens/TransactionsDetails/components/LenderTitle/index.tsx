import { useTransactionManagement } from "@/hooks/useTransactions";
import { Transaction } from "@/types";
import { colors } from "@/constants/colors";
import React, { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  Text
} from "react-native";
import FormInput from "../FormInput";
import SaveButton from "../SaveButton";

interface LenderTitleProps {
  transaction: Transaction;
}

interface LenderTitleFormData {
  lender: string;
  titleCo: string;
  titleNumber: string;
  titleOfficer: string;
  escrowOfficer: string;
  escrowAddress: string;
  escrowAgentEmail: string;
}

const LenderTitle: React.FC<LenderTitleProps> = ({ transaction }) => {
  const { updateTransaction } = useTransactionManagement(transaction.id);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LenderTitleFormData>({
    defaultValues: {
      lender: transaction.lender || "",
      titleCo: transaction.titleCo || transaction.title_co || "",
      titleNumber: transaction.titleNumber || transaction.title_number || "",
      titleOfficer: transaction.titleOfficer || transaction.title_officer || "",
      escrowOfficer:
        transaction.escrowOfficer || transaction.escrow_officer || "",
      escrowAddress:
        transaction.escrowAddress || transaction.escrow_address || "",
      escrowAgentEmail: transaction.escrowAgentEmail || transaction.escrow_agent_email || "",
    },
  });

  // Update form data when transaction changes
  useEffect(() => {
    reset({
      lender: transaction.lender || "",
      titleCo: transaction.titleCo || transaction.title_co || "",
      titleNumber: transaction.titleNumber || transaction.title_number || "",
      titleOfficer: transaction.titleOfficer || transaction.title_officer || "",
      escrowOfficer:
        transaction.escrowOfficer || transaction.escrow_officer || "",
      escrowAddress:
        transaction.escrowAddress || transaction.escrow_address || "",
      escrowAgentEmail: transaction.escrowAgentEmail || transaction.escrow_agent_email || "",
    });
  }, [transaction, reset]);

  const onSubmit = (data: LenderTitleFormData) => {
    const updates: Partial<Transaction> = {
      lender: data.lender,
      titleCo: data.titleCo,
      title_co: data.titleCo,
      titleNumber: data.titleNumber,
      title_number: data.titleNumber,
      titleOfficer: data.titleOfficer,
      title_officer: data.titleOfficer,
      escrowOfficer: data.escrowOfficer,
      escrow_officer: data.escrowOfficer,
      escrowAddress: data.escrowAddress,
      escrow_address: data.escrowAddress,
      escrowAgentEmail: data.escrowAgentEmail,
      escrow_agent_email: data.escrowAgentEmail,
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
              name="lender"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Lender name cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "lender",
                    label: "Lender",
                    value: value,
                    placeholder: "Enter lender name",
                  }}
                  onChangeText={onChange}
                  style={errors.lender && styles.inputError}
                />
              )}
            />
            {errors.lender && (
              <Text style={styles.errorText}>
                {errors.lender.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="titleCo"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Title company cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "titleCo",
                    label: "Title Company",
                    value: value,
                    placeholder: "Enter title company",
                  }}
                  onChangeText={onChange}
                  style={errors.titleCo && styles.inputError}
                />
              )}
            />
            {errors.titleCo && (
              <Text style={styles.errorText}>
                {errors.titleCo.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="titleNumber"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Title number cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "titleNumber",
                    label: "Title Number",
                    value: value,
                    placeholder: "Enter title number",
                  }}
                  onChangeText={onChange}
                  style={errors.titleNumber && styles.inputError}
                />
              )}
            />
            {errors.titleNumber && (
              <Text style={styles.errorText}>
                {errors.titleNumber.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="titleOfficer"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Title officer cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "titleOfficer",
                    label: "Title Officer",
                    value: value,
                    placeholder: "Enter title officer",
                  }}
                  onChangeText={onChange}
                  style={errors.titleOfficer && styles.inputError}
                />
              )}
            />
            {errors.titleOfficer && (
              <Text style={styles.errorText}>
                {errors.titleOfficer.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="escrowOfficer"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Escrow officer cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "escrowOfficer",
                    label: "Escrow Officer",
                    value: value,
                    placeholder: "Enter escrow officer",
                  }}
                  onChangeText={onChange}
                  style={errors.escrowOfficer && styles.inputError}
                />
              )}
            />
            {errors.escrowOfficer && (
              <Text style={styles.errorText}>
                {errors.escrowOfficer.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="escrowAddress"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Escrow address cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "escrowAddress",
                    label: "Escrow Address",
                    value: value,
                    placeholder: "Enter escrow address",
                  }}
                  onChangeText={onChange}
                  style={errors.escrowAddress && styles.inputError}
                />
              )}
            />
            {errors.escrowAddress && (
              <Text style={styles.errorText}>
                {errors.escrowAddress.message as string}
              </Text>
            )}
            <Controller
              control={control}
              name="escrowAgentEmail"
              rules={{
                maxLength: {
                  value: 50,
                  message: "Escrow email cannot be more than 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <FormInput
                  field={{
                    id: "escrowAgentEmail",
                    label: "Escrow Email",
                    value: value,
                    placeholder: "Enter escrow email",
                  }}
                  onChangeText={onChange}
                  style={errors.escrowAgentEmail && styles.inputError}
                />
              )}
            />
            {errors.escrowAgentEmail && (
              <Text style={styles.errorText}>
                {errors.escrowAgentEmail.message as string}
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

export default LenderTitle;
