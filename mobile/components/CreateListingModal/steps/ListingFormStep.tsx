import Button from "@/components/Button/Button";
import { BuyerSellerManager } from "@/components/shared/BuyerSellerManager/BuyerSellerManager";
import { DatePickerModal } from "@/components/shared/DatePickerModal";
import { colors } from "@/constants/colors";
import { ExtractedData } from "@/services/documentService";
import { BuyerSeller } from "@/types/transaction";
import { ListingFormData } from "@/types/transactionForm";
import { formatDateForDisplay } from "@/utils/dateFormatUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

interface ListingFormStepProps {
  initialData?: Partial<ListingFormData>;
  extractedData?: ExtractedData | null;
  onSubmit: (data: ListingFormData) => void;
  isSubmitting?: boolean;
}

export const ListingFormStep: React.FC<ListingFormStepProps> = ({
  initialData,
  extractedData,
  onSubmit,
  isSubmitting = false,
}) => {
  const { bottom } = useSafeAreaInsets();
  const [showListingDatePicker, setShowListingDatePicker] = useState(false);
  const [showExpirationDatePicker, setShowExpirationDatePicker] = useState(false);
  const [showRepresentingPicker, setShowRepresentingPicker] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
    getValues,
    setError,
    clearErrors,
  } = useForm<ListingFormData>({
    defaultValues: {
      listingType: initialData?.listingType || "",
      listingPrice: initialData?.listingPrice || "",
      listingDate: initialData?.listingDate || null,
      expirationDate: initialData?.expirationDate || null,
      taxId: initialData?.taxId || "",
      earnestMoney: initialData?.earnestMoney || "",
      representing: initialData?.representing || "",
      buyers: initialData?.buyers || [],
      sellers: initialData?.sellers || [],
      address: initialData?.address || "",
      county: initialData?.county || "",
      area: initialData?.area || "",
      communityDistrict: initialData?.communityDistrict || "",
      description: initialData?.description || "",
      userUploadIds: initialData?.userUploadIds || [],
    },
  });

  // Ensure listingType is always set from initialData (from user's initial selection)
  // This is critical - the listingType is selected at the start and must always be available
  useEffect(() => {
    if (initialData?.listingType && initialData.listingType.trim() !== "") {
      setValue("listingType", initialData.listingType, { shouldValidate: false, shouldDirty: false });
      console.log("✅ [DEBUG] Set listingType from initialData:", initialData.listingType);
    } else {
      console.warn("⚠️ [DEBUG] No listingType in initialData:", initialData);
    }
  }, [initialData?.listingType, setValue]);

  // Also set it on mount if not already set
  useEffect(() => {
    const currentValue = getValues("listingType");
    if ((!currentValue || currentValue.trim() === "") && initialData?.listingType) {
      setValue("listingType", initialData.listingType, { shouldValidate: false, shouldDirty: false });
      console.log("✅ [DEBUG] Set listingType on mount:", initialData.listingType);
    }
  }, []);

  const listingDate = watch("listingDate");
  const expirationDate = watch("expirationDate");
  const listingPrice = watch("listingPrice");
  const buyers = watch("buyers") || [];
  const sellers = watch("sellers") || [];

  /* Listing document auto-fill disabled — useAutoFill / documentDataMapper removed.
  const {
    mappedData,
    validationResult,
    confidence,
    warnings,
    extractedFields,
    isFilled,
    applyFill,
    undoFill,
    canUndo,
  } = useAutoFill({
    extractedData: extractedData || null,
    setValue,
    reset,
    getValues,
  });

  useEffect(() => {
    if (validationResult?.errors && validationResult.errors.length > 0) {
      validationResult.errors.forEach((error) => {
        if (error.field === "listingType") {
          return;
        }
        const fieldName = error.field as keyof ListingFormData;
        setError(fieldName, {
          type: "validation",
          message: error.message,
        });
      });
    } else {
      clearErrors("listingType");
      const fieldNames: (keyof ListingFormData)[] = [
        "listingType",
        "listingPrice",
        "listingDate",
        "expirationDate",
        "taxId",
      ];
      fieldNames.forEach((fieldName) => {
        if (errors[fieldName]?.type === "validation") {
          clearErrors(fieldName);
        }
      });
    }
  }, [validationResult?.errors, setError, clearErrors, errors]);
  */

  const handleFormSubmit = useCallback(
    (data: ListingFormData) => {
      console.log("🔍 [DEBUG] ListingFormStep handleFormSubmit called:", {
        hasListingType: !!data.listingType,
        listingType: data.listingType,
        initialDataListingType: initialData?.listingType,
        hasListingDate: !!data.listingDate,
        hasExpirationDate: !!data.expirationDate,
        hasListingPrice: !!data.listingPrice,
        hasTaxId: !!data.taxId,
        hasAddress: !!data.address,
        hasCounty: !!data.county,
        allFields: Object.keys(data),
      });

      // Always use the listingType from initialData (user's initial selection)
      // This ensures we strictly use the type the user selected at the start
      const finalData: ListingFormData = {
        ...data,
        listingType: initialData?.listingType || data.listingType || "",
      };

      if (!finalData.listingType || finalData.listingType.trim() === "") {
        Alert.alert("Error", "Listing type is required. Please go back and select a listing type.");
        return;
      }

      // Additional validation (form validation should catch most cases)
      if (!finalData.listingDate || !finalData.expirationDate) {
        Alert.alert("Missing Dates", "Both listing and expiration dates are required.");
        return;
      }
      // Removed date range validation - expiration date can be before listing date
      // as per requirements: expiration date is set to yesterday

      onSubmit(finalData);
    },
    [onSubmit, initialData?.listingType]
  );

  const handleBuyersChange = useCallback(
    (newBuyers: BuyerSeller[]) => {
      setValue("buyers", newBuyers);
    },
    [setValue]
  );

  const handleSellersChange = useCallback(
    (newSellers: BuyerSeller[]) => {
      setValue("sellers", newSellers);
    },
    [setValue]
  );

  /* Listing document auto-fill disabled.
  useEffect(() => {
    ...
  }, []);

  useEffect(() => {
    if (isFilled && extractedData) {
      setTimeout(() => {}, 100);
    }
  }, [isFilled, extractedData]);
  */

  const representingOptions = [
    { value: "buyer", label: "Buyer" },
    { value: "seller", label: "Seller" },
    { value: "both", label: "Both" },
  ];

  const selectedRepresenting = watch("representing");
  const representingLabel =
    representingOptions.find((opt) => opt.value === selectedRepresenting)?.label ||
    "Select who you are representing";

  const scrollViewRef = useRef<ScrollView>(null);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
        showsVerticalScrollIndicator={false}
        accessibilityLabel="Listing form"
      >
        {/* Listing document auto-fill UI disabled — useAutoFill removed.
        {extractedData && mappedData && ( ... )}
        {validationResult && validationResult.warnings.length > 0 && ( ... )}
        */}
        {/* Listing Summary Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Listing Summary</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Listing price *</Text>
            <Controller
              control={control}
              name="listingPrice"
              rules={{
                required: "Listing price is required",
                validate: (value) => {
                  const stringValue = String(value || "");
                  if (!value || stringValue.trim() === "") {
                    return "Listing price is required";
                  }
                  // Remove $ sign and parse
                  const cleaned = stringValue.replace(/\D/g, '');
                  if (!cleaned || cleaned === '0') {
                    return "Listing price must be greater than 0";
                  }
                  const numValue = parseFloat(cleaned);
                  if (isNaN(numValue) || numValue <= 0) {
                    return "Listing price must be a valid number greater than 0";
                  }
                  return true;
                },
              }}
              render={({ field: { onChange, value } }) => {
                // Format with $ sign and commas as user types, no decimals
                const formatPriceInput = (text: string): string => {
                  // Remove all non-digit characters
                  const digits = text.replace(/\D/g, '');
                  if (!digits) return '';

                  // Add commas for thousands
                  const number = parseInt(digits, 10);
                  const formatted = number.toLocaleString('en-US');

                  // Add $ sign
                  return `$${formatted}`;
                };

                return (
                  <View>
                    <TextInput
                      value={String(value || "")}
                      onChangeText={(text) => {
                        const formatted = formatPriceInput(text);
                        onChange(formatted);
                      }}
                      placeholder="$0"
                      placeholderTextColor={colors.gray[600]}
                      keyboardType="numeric"
                      style={[styles.input, errors.listingPrice && styles.inputError]}
                    />
                  </View>
                );
              }}
            />
            {errors.listingPrice && (
              <Text style={styles.errorText}>{errors.listingPrice.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Earnest Money</Text>
            <Controller
              control={control}
              name="earnestMoney"
              render={({ field: { onChange, value } }) => {
                // Format with $ sign and commas as user types, no decimals (same as Listing Price)
                const formatPriceInput = (text: string): string => {
                  // Remove all non-digit characters
                  const digits = text.replace(/\D/g, '');
                  if (!digits) return '';

                  // Add commas for thousands
                  const number = parseInt(digits, 10);
                  const formatted = number.toLocaleString('en-US');

                  // Add $ sign
                  return `$${formatted}`;
                };

                return (
                  <TextInput
                    value={typeof value === 'string' ? value : (value ? value.toString() : "")}
                    onChangeText={(text) => {
                      const formatted = formatPriceInput(text);
                      onChange(formatted);
                    }}
                    placeholder="$0"
                    placeholderTextColor={colors.gray[600]}
                    keyboardType="numeric"
                    style={[styles.input, errors.earnestMoney && styles.inputError]}
                  />
                );
              }}
            />
            {errors.earnestMoney && (
              <Text style={styles.errorText}>{errors.earnestMoney.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Listing date *</Text>
            <Controller
              control={control}
              name="listingDate"
              rules={{
                required: "Listing date is required",
              }}
              render={({ field: { value } }) => (
                <>
                  <TouchableOpacity
                    style={[styles.dateButton, errors.listingDate && styles.inputError]}
                    onPress={() => setShowListingDatePicker(true)}
                  >
                    <Text
                      style={[
                        styles.dateButtonText,
                        !value && styles.dateButtonTextPlaceholder,
                      ]}
                    >
                      {value ? formatDateForDisplay(value) : "Select date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
                  </TouchableOpacity>
                  <DatePickerModal
                    visible={showListingDatePicker}
                    value={value || new Date()}
                    minimumDate={new Date()}
                    onConfirm={(date) => {
                      setValue("listingDate", date);
                      setShowListingDatePicker(false);
                    }}
                    onCancel={() => setShowListingDatePicker(false)}
                  />
                </>
              )}
            />
            {errors.listingDate && (
              <Text style={styles.errorText}>{errors.listingDate.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Expiration date *</Text>
            <Controller
              control={control}
              name="expirationDate"
              rules={{
                required: "Expiration date is required",
                // Removed validation that expiration must be after listing date
                // as per requirements: expiration date is set to yesterday
              }}
              render={({ field: { value } }) => (
                <>
                  <TouchableOpacity
                    style={[styles.dateButton, errors.expirationDate && styles.inputError]}
                    onPress={() => setShowExpirationDatePicker(true)}
                  >
                    <Text
                      style={[
                        styles.dateButtonText,
                        !value && styles.dateButtonTextPlaceholder,
                      ]}
                    >
                      {value ? formatDateForDisplay(value) : "Select date"}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color={colors.gray[600]} />
                  </TouchableOpacity>
                  <DatePickerModal
                    visible={showExpirationDatePicker}
                    value={value || new Date()}
                    onConfirm={(date) => {
                      setValue("expirationDate", date);
                      setShowExpirationDatePicker(false);
                    }}
                    onCancel={() => setShowExpirationDatePicker(false)}
                  />
                </>
              )}
            />
            {errors.expirationDate && (
              <Text style={styles.errorText}>{errors.expirationDate.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tax ID# *</Text>
            <Controller
              control={control}
              name="taxId"
              rules={{
                required: "Tax ID is required",
                maxLength: {
                  value: 50,
                  message: "Tax ID cannot exceed 50 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Tax ID"
                  placeholderTextColor={colors.gray[600]}
                  maxLength={50}
                  style={[styles.input, errors.taxId && styles.inputError]}
                />
              )}
            />
            {errors.taxId && (
              <Text style={styles.errorText}>{errors.taxId.message}</Text>
            )}
          </View>
        </View>

        {/* Seller Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seller Info</Text>

          <View style={styles.field}>
            <Text style={styles.label}>I am representing</Text>
            <TouchableOpacity
              style={styles.pickerButton}
              onPress={() => setShowRepresentingPicker(true)}
            >
              <Text
                style={[
                  styles.pickerButtonText,
                  !selectedRepresenting && styles.pickerButtonTextPlaceholder,
                ]}
              >
                {representingLabel}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.gray[600]} />
            </TouchableOpacity>
          </View>

          <BuyerSellerManager
            buyers={buyers}
            sellers={sellers}
            onBuyersChange={handleBuyersChange}
            onSellersChange={handleSellersChange}
            type="buyers"
            label="Buyers"
          />

          <BuyerSellerManager
            buyers={buyers}
            sellers={sellers}
            onBuyersChange={handleBuyersChange}
            onSellersChange={handleSellersChange}
            type="sellers"
            label="Sellers"
          />
        </View>

        {/* Property Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Info</Text>

          <View style={styles.field}>
            <Text style={styles.label}>Address *</Text>
            <Controller
              control={control}
              name="address"
              rules={{
                required: "Address is required",
                maxLength: {
                  value: 200,
                  message: "Address cannot exceed 200 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Street number"
                  placeholderTextColor={colors.gray[600]}
                  maxLength={200}
                  style={[styles.input, errors.address && styles.inputError]}
                />
              )}
            />
            {errors.address && (
              <Text style={styles.errorText}>{errors.address.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>County *</Text>
            <Controller
              control={control}
              name="county"
              rules={{
                required: "County is required",
                maxLength: {
                  value: 100,
                  message: "County cannot exceed 100 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="County"
                  placeholderTextColor={colors.gray[600]}
                  maxLength={100}
                  style={[styles.input, errors.county && styles.inputError]}
                />
              )}
            />
            {errors.county && (
              <Text style={styles.errorText}>{errors.county.message}</Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Area</Text>
            <Controller
              control={control}
              name="area"
              rules={{
                maxLength: {
                  value: 100,
                  message: "Area cannot exceed 100 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Area"
                  placeholderTextColor={colors.gray[600]}
                  maxLength={100}
                  style={styles.input}
                />
              )}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Community/District</Text>
            <Controller
              control={control}
              name="communityDistrict"
              rules={{
                maxLength: {
                  value: 100,
                  message: "Community/District cannot exceed 100 characters",
                },
              }}
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  placeholder="Community/District"
                  placeholderTextColor={colors.gray[600]}
                  maxLength={100}
                  style={styles.input}
                />
              )}
            />
          </View>
        </View>

        <Button
          text={isSubmitting ? "Creating..." : "Save Listing"}
          onPress={() => {
            console.log("🔍 [DEBUG] Save Listing button clicked");
            const formData = getValues();
            console.log("🔍 [DEBUG] Current form data:", {
              listingType: formData.listingType,
              listingPrice: formData.listingPrice,
              listingDate: formData.listingDate,
              expirationDate: formData.expirationDate,
              taxId: formData.taxId,
              address: formData.address,
              county: formData.county,
              errors: errors,
              errorCount: Object.keys(errors).length,
            });

            // ALWAYS use the listingType from initialData (user's initial selection)
            // This is the type the user selected at the start - use it strictly
            const finalListingType = initialData?.listingType || formData.listingType || "";
            if (!finalListingType || finalListingType.trim() === "") {
              Alert.alert("Error", "Listing type is missing. Please go back and select a listing type.");
              return;
            }

            // Set it in the form if not already set
            if (formData.listingType !== finalListingType) {
              setValue("listingType", finalListingType, { shouldValidate: false, shouldDirty: false });
              console.log("✅ [DEBUG] Set listingType from user's initial selection:", finalListingType);
            }

            // Call handleSubmit - it will validate and call handleFormSubmit if valid
            handleSubmit(
              (data) => {
                console.log("✅ [DEBUG] Form validation passed, calling handleFormSubmit");
                handleFormSubmit(data);
              },
              (errors) => {
                console.log("❌ [DEBUG] Form validation failed:", errors);
                const firstError = Object.values(errors)[0];
                if (firstError?.message) {
                  Alert.alert("Validation Error", firstError.message);
                } else {
                  Alert.alert("Validation Error", "Please fill in all required fields.");
                }
              }
            )();
          }}
          disabled={isSubmitting}
          variant="black"
          icon={
            isSubmitting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : undefined
          }
          style={styles.submitButton}
        />
      </ScrollView>

      {/* Representing Picker Modal */}
      <Modal
        visible={showRepresentingPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRepresentingPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowRepresentingPicker(false)}
        >
          <View style={styles.pickerModal}>
            <Text style={styles.pickerModalTitle}>Select who you are representing</Text>
            {representingOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.pickerOption}
                onPress={() => {
                  setValue("representing", option.value);
                  setShowRepresentingPicker(false);
                }}
              >
                <Text
                  style={[
                    styles.pickerOptionText,
                    selectedRepresenting === option.value &&
                    styles.pickerOptionTextSelected,
                  ]}
                >
                  {option.label}
                </Text>
                {selectedRepresenting === option.value && (
                  <Ionicons name="checkmark" size={20} color={colors.gray[900]} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[300],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 8,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[800],
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.primary[400],
  },
  errorText: {
    fontSize: 14,
    color: colors.primary[400],
    marginTop: 4,
  },
  dateButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 48,
  },
  dateButtonText: {
    fontSize: 16,
    color: colors.gray[800],
  },
  dateButtonTextPlaceholder: {
    color: colors.gray[500],
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 48,
  },
  pickerButtonText: {
    fontSize: 16,
    color: colors.gray[800],
  },
  pickerButtonTextPlaceholder: {
    color: colors.gray[500],
  },
  submitButton: {
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerModal: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    width: "80%",
    maxWidth: 400,
  },
  pickerModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
    marginBottom: 16,
    textAlign: "center",
  },
  pickerOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  pickerOptionText: {
    fontSize: 16,
    color: colors.gray[700],
  },
  pickerOptionTextSelected: {
    fontWeight: "600",
    color: colors.gray[900],
  },
  autoFillActions: {
    marginBottom: 16,
  },
  autoFillAppliedContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: colors.green[500] + "10",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.green[500] + "30",
  },
  autoFillAppliedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  autoFillAppliedText: {
    fontSize: 14,
    color: colors.gray[900],
    fontWeight: "500",
  },
  undoButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  undoButtonText: {
    fontSize: 14,
    color: colors.blue[500],
    fontWeight: "600",
  },
  warningsContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: colors.yellow[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.yellow[500] + "30",
  },
  errorSection: {
    marginBottom: 12,
  },
  warningSection: {
    marginTop: 8,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.gray[900],
    marginBottom: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.gray[700],
    marginBottom: 4,
    lineHeight: 18,
  },
  highSeverityWarning: {
    color: colors.red[500],
    fontWeight: "600",
  },
});
