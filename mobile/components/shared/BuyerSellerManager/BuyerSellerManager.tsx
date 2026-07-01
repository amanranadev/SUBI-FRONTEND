import UserAvatar from "@/components/UserAvatar";
import { colors } from "@/constants/colors";
import { BuyerSeller } from "@/types/transaction";
import {
  formatPhoneNumber,
  isValidUSAPhoneNumber,
  stripPhoneNumber,
} from "@/utils/phoneUtils";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface BuyerSellerManagerProps {
  buyers: BuyerSeller[];
  sellers: BuyerSeller[];
  onBuyersChange: (buyers: BuyerSeller[]) => void;
  onSellersChange: (sellers: BuyerSeller[]) => void;
  type: "buyers" | "sellers";
  label: string;
}

interface BuyerSellerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  representing: boolean;
}

/**
 * BuyerSellerManager component for managing buyers and sellers in transaction forms
 */
export const BuyerSellerManager: React.FC<BuyerSellerManagerProps> = memo(({
  buyers,
  sellers,
  onBuyersChange,
  onSellersChange,
  type,
  label,
}) => {
  const [expandedIndices, setExpandedIndices] = useState<Set<number>>(new Set());

  const items = useMemo(() => {
    return type === "buyers" ? buyers : sellers;
  }, [type, buyers, sellers]);

  const handleAdd = useCallback(() => {
    // Create new item with empty fields - user must fill required fields
    const newItem: BuyerSeller = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      representing: false,
      isFromAPI: false,
    };

    if (type === "buyers") {
      onBuyersChange([...items, newItem]);
    } else {
      onSellersChange([...items, newItem]);
    }

    // Show form for the newly added item
    const newIndex = items.length;
    setExpandedIndices((prev) => new Set([...prev, newIndex]));
  }, [items, type, onBuyersChange, onSellersChange]);

  const handleEdit = useCallback((index: number) => {
    setExpandedIndices((prev) => new Set([...prev, index]));
  }, []);

  const handleToggleExpand = useCallback((index: number) => {
    // Toggle edit form visibility - eye icon shows/hides the edit form
    setExpandedIndices((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      return newExpanded;
    });
  }, []);

  const handleDelete = useCallback(
    (index: number) => {
      const item = items[index];
      const name = `${item.firstName} ${item.lastName}`.trim() || "this person";

      Alert.alert(
        `Delete ${label}`,
        `Are you sure you want to delete ${name}?`,
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              const updated = items.filter((_, i) => i !== index);
              if (type === "buyers") {
                onBuyersChange(updated);
              } else {
                onSellersChange(updated);
              }
            },
          },
        ]
      );
    },
    [items, type, label, onBuyersChange, onSellersChange]
  );

  const handleSave = useCallback(
    (data: BuyerSellerFormData, index: number) => {
      const buyerSeller: BuyerSeller = {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: stripPhoneNumber(data.phone),
        representing: data.representing,
        isFromAPI: false,
      };

      if (index < items.length) {
        // Update existing
        const updated = [...items];
        updated[index] = buyerSeller;
        if (type === "buyers") {
          onBuyersChange(updated);
        } else {
          onSellersChange(updated);
        }
      } else {
        // Add new
        const updated = [...items, buyerSeller];
        if (type === "buyers") {
          onBuyersChange(updated);
        } else {
          onSellersChange(updated);
        }
      }

      // Collapse the form for this item
      setExpandedIndices((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.delete(index);
        return newExpanded;
      });
    },
    [items, type, onBuyersChange, onSellersChange]
  );

  const handleImportFromContacts = useCallback(() => {
    // Placeholder for future implementation
    Alert.alert(
      "Import from Contacts",
      "This feature will be available soon.",
      [{ text: "OK" }]
    );
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: BuyerSeller; index: number }) => {
      const initials = `${item.firstName?.[0] || ""}${item.lastName?.[0] || ""}`.toUpperCase();
      const name = `${item.firstName} ${item.lastName}`.trim() || "Unnamed";
      const isFormVisible = expandedIndices.has(index);

      return (
        <View style={styles.cardContainer}>
          <View style={styles.itemContainer}>
            <View style={styles.itemContent}>
              <UserAvatar
                initials={initials || "?"}
                size={40}
                backgroundColor={colors.purple[100]}
              />
              <TouchableOpacity
                style={styles.itemInfo}
                onPress={() => handleToggleExpand(index)}
                activeOpacity={0.7}
              >
                <Text style={styles.itemName}>{name}</Text>
                {item.email && (
                  <Text style={styles.itemEmail}>{item.email}</Text>
                )}
                {item.phone && (
                  <Text style={styles.itemPhone}>
                    {formatPhoneNumber(item.phone)}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.itemActions}>
              <TouchableOpacity
                onPress={() => handleToggleExpand(index)}
                style={styles.actionButton}
                accessibilityLabel={isFormVisible ? `Hide ${name} edit form` : `Show ${name} edit form`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons
                  name={isFormVisible ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.gray[600]}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleDelete(index)}
                style={styles.actionButton}
                accessibilityLabel={`Delete ${name}`}
              >
                <Ionicons name="trash" size={20} color={colors.red[500]} />
              </TouchableOpacity>
            </View>
          </View>
          {isFormVisible && (
            <BuyerSellerForm
              initialData={item}
              onSave={(data) => handleSave(data, index)}
              onCancel={() => {
                setExpandedIndices((prev) => {
                  const newExpanded = new Set(prev);
                  newExpanded.delete(index);
                  return newExpanded;
                });
              }}
            />
          )}
        </View>
      );
    },
    [handleDelete, handleToggleExpand, handleSave, expandedIndices]
  );

  const renderEmptyState = useCallback(() => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyStateText}>No {label.toLowerCase()} added yet</Text>
      </View>
    );
  }, [label]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleImportFromContacts}
            style={styles.importButton}
            accessibilityLabel={`Import ${label} from contacts`}
          >
            <Ionicons name="person-add" size={18} color={colors.gray[600]} />
            <Text style={styles.importButtonText}>Import</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleAdd}
            style={styles.addButton}
            accessibilityLabel={`Add ${label.slice(0, -1)}`}
          >
            <Ionicons name="add" size={20} color={colors.white} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {items.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={items}
          renderItem={renderItem}
          keyExtractor={(item, index) => `buyer-seller-${type}-${index}`}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
  );
}, (prevProps, nextProps) => {
  // Memo comparison - check content, not just length
  if (
    prevProps.type !== nextProps.type ||
    prevProps.label !== nextProps.label ||
    prevProps.buyers.length !== nextProps.buyers.length ||
    prevProps.sellers.length !== nextProps.sellers.length
  ) {
    return false;
  }

  // Deep comparison of buyers and sellers arrays
  const buyersEqual = prevProps.buyers.every(
    (buyer, index) =>
      buyer.firstName === nextProps.buyers[index]?.firstName &&
      buyer.lastName === nextProps.buyers[index]?.lastName &&
      buyer.email === nextProps.buyers[index]?.email &&
      buyer.phone === nextProps.buyers[index]?.phone
  );

  const sellersEqual = prevProps.sellers.every(
    (seller, index) =>
      seller.firstName === nextProps.sellers[index]?.firstName &&
      seller.lastName === nextProps.sellers[index]?.lastName &&
      seller.email === nextProps.sellers[index]?.email &&
      seller.phone === nextProps.sellers[index]?.phone
  );

  return buyersEqual && sellersEqual;
});

BuyerSellerManager.displayName = "BuyerSellerManager";

interface BuyerSellerFormProps {
  initialData?: BuyerSeller;
  onSave: (data: BuyerSellerFormData) => void;
  onCancel: () => void;
}

const BuyerSellerForm: React.FC<BuyerSellerFormProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<BuyerSellerFormData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    email: initialData?.email || "",
    phone: initialData?.phone ? formatPhoneNumber(initialData.phone) : "",
    representing: initialData?.representing || false,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BuyerSellerFormData, string>>>({});

  const validate = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof BuyerSellerFormData, string>> = {};

    // First name is required
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length > 50) {
      newErrors.firstName = "First name cannot exceed 50 characters";
    }

    // Last name is required
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length > 50) {
      newErrors.lastName = "Last name cannot exceed 50 characters";
    }

    // Email is optional but must be valid format if provided
    // (At least one email per group is validated at form submission level)
    if (formData.email.trim() && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Phone is optional but must be valid if provided
    if (formData.phone && !isValidUSAPhoneNumber(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (validate()) {
      onSave(formData);
    }
  }, [formData, validate, onSave]);

  return (
    <View style={styles.formContainer}>
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>
          {initialData ? "Edit" : "Add"} Person
        </Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
      </View>

      <View style={styles.formContent}>
        <View style={styles.formRow}>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>First Name *</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              value={formData.firstName}
              onChangeText={(text) =>
                setFormData({ ...formData, firstName: text })
              }
              placeholder="First name"
              placeholderTextColor={colors.gray[600]}
              maxLength={50}
            />
            {errors.firstName && (
              <Text style={styles.errorText}>{errors.firstName}</Text>
            )}
          </View>
          <View style={styles.formField}>
            <Text style={styles.fieldLabel}>Last Name *</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              value={formData.lastName}
              onChangeText={(text) =>
                setFormData({ ...formData, lastName: text })
              }
              placeholder="Last name"
              placeholderTextColor={colors.gray[600]}
              maxLength={50}
            />
            {errors.lastName && (
              <Text style={styles.errorText}>{errors.lastName}</Text>
            )}
          </View>
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="email@example.com"
            placeholderTextColor={colors.gray[600]}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.formField}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={formData.phone}
            onChangeText={(text) => {
              // Remove all non-digits and limit to 10
              const digits = text.replace(/\D/g, '').slice(0, 10);
              const formatted = formatPhoneNumber(digits);
              setFormData({ ...formData, phone: formatted });
            }}
            placeholder="(xxx)-xxx-xxxx"
            placeholderTextColor={colors.gray[600]}
            keyboardType="phone-pad"
            maxLength={14} // (xxx)-xxx-xxxx format = 14 characters
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
        </View>
      </View>

      <View style={styles.formActions}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSubmit} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.gray[900],
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.gray[200],
  },
  importButtonText: {
    fontSize: 14,
    color: colors.gray[600],
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: colors.gray[900],
  },
  addButtonText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: "500",
  },
  emptyState: {
    padding: 24,
    alignItems: "center",
    backgroundColor: colors.gray[100],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderStyle: "dashed",
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  itemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
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
  itemActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  expandedDetails: {
    marginTop: 8,
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: colors.gray[600],
  },
  separator: {
    height: 8,
  },
  cardContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginBottom: 8,
    overflow: "hidden",
  },
  formContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.white,
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[900],
  },
  closeButton: {
    padding: 4,
  },
  formContent: {
    gap: 16,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
    marginBottom: 8,
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
    marginTop: 16,
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: colors.gray[600],
    fontWeight: "500",
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.gray[900],
  },
  saveButtonText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: "500",
  },
});
