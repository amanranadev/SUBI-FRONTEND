import React, { memo, useCallback, useMemo, useState } from "react";
import {
  AccessibilityInfo,
  Pressable,
  Text,
  View,
} from "react-native";

import { Icon } from "../../assets/icon-system";
import { FormFieldInput } from "../FormFieldInput";
import { PrimaryButton } from "../PrimaryButton";

import { itemListEditorStyles, itemListEditorTokens } from "./ItemListEditor.styles";
import type {
  ItemListEditorProps,
  ItemListEditorRowProps,
} from "./ItemListEditor.types";

const DEFAULT_LABEL = "ADD ITEM";
const DEFAULT_PLACEHOLDER = "Add item";
const DEFAULT_EMPTY_STATE_TEXT = "No items added yet.";

function normalizeItem(value: string): string {
  return value.trim().toLowerCase();
}

function isDuplicateItem(items: string[], value: string): boolean {
  const normalized = normalizeItem(value);
  return items.some((item) => normalizeItem(item) === normalized);
}

const ItemListEditorRow = memo(function ItemListEditorRow({
  item,
  disabled,
  onRemove,
  testID,
}: ItemListEditorRowProps) {
  const handleRemove = useCallback(() => {
    onRemove(item);
  }, [item, onRemove]);

  return (
    <View
      style={itemListEditorStyles.itemRow}
      accessibilityLabel={item}
      testID={testID}
    >
      <View style={itemListEditorStyles.itemContent}>
        <Icon
          name="check-circle"
          size={itemListEditorTokens.chip.iconSize}
          color={itemListEditorTokens.colors.checkIcon}
          accessible={false}
        />
        <Text style={itemListEditorStyles.itemText}>{item}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Remove ${item}`}
        disabled={disabled}
        onPress={handleRemove}
        style={itemListEditorStyles.removeButton}
        testID={testID ? `${testID}-remove` : undefined}
      >
        <Icon
          name="close"
          size={itemListEditorTokens.chip.iconSize}
          color={itemListEditorTokens.colors.itemText}
          accessible={false}
        />
      </Pressable>
    </View>
  );
});

ItemListEditorRow.displayName = "ItemListEditorRow";

function ItemListEditorComponent({
  items,
  onChange,
  label = DEFAULT_LABEL,
  placeholder = DEFAULT_PLACEHOLDER,
  helperText,
  emptyStateText = DEFAULT_EMPTY_STATE_TEXT,
  maxItems,
  disabled = false,
  testID,
}: ItemListEditorProps) {
  const [draftValue, setDraftValue] = useState("");

  const trimmedDraft = useMemo(() => draftValue.trim(), [draftValue]);

  const isMaxItemsReached = useMemo(
    () => maxItems != null && items.length >= maxItems,
    [items.length, maxItems],
  );

  const canAdd = useMemo(() => {
    if (disabled || isMaxItemsReached) {
      return false;
    }
    if (!trimmedDraft) {
      return false;
    }
    return !isDuplicateItem(items, trimmedDraft);
  }, [disabled, isMaxItemsReached, items, trimmedDraft]);

  const handleAdd = useCallback(() => {
    if (!canAdd) {
      return;
    }

    onChange([...items, trimmedDraft]);
    setDraftValue("");
    AccessibilityInfo.announceForAccessibility("Item added");
  }, [canAdd, items, onChange, trimmedDraft]);

  const handleRemove = useCallback(
    (itemToRemove: string) => {
      if (disabled) {
        return;
      }

      onChange(items.filter((item) => item !== itemToRemove));
      AccessibilityInfo.announceForAccessibility("Item removed");
    },
    [disabled, items, onChange],
  );

  return (
    <View style={itemListEditorStyles.container} testID={testID}>
      <View style={itemListEditorStyles.labelRow}>
        <Text style={itemListEditorStyles.label}>{label}</Text>
        {helperText ? (
          <Text style={itemListEditorStyles.helperText}>{helperText}</Text>
        ) : null}
      </View>

      <View style={itemListEditorStyles.inputRow}>
        <View style={itemListEditorStyles.inputField}>
          <FormFieldInput
            showLabel={false}
            label={label}
            value={draftValue}
            onChangeText={setDraftValue}
            placeholder={placeholder}
            editable={!disabled}
            optionalText=""
            returnKeyType="done"
            onSubmitEditing={handleAdd}
            accessibilityLabel={placeholder}
            testID={testID ? `${testID}-input` : undefined}
          />
        </View>
        <PrimaryButton
          size="md"
          disabled={!canAdd}
          onPress={handleAdd}
          accessibilityLabel="Add item"
          testID={testID ? `${testID}-add` : undefined}
        >
          Add
        </PrimaryButton>
      </View>

      <View
        style={itemListEditorStyles.itemsSection}
        accessibilityLabel="Added items"
      >
        {items.length === 0 ? (
          <Text style={itemListEditorStyles.emptyState}>{emptyStateText}</Text>
        ) : (
          items.map((item, index) => (
            <ItemListEditorRow
              key={`${normalizeItem(item)}-${index}`}
              item={item}
              disabled={disabled}
              onRemove={handleRemove}
              testID={testID ? `${testID}-item-${index}` : undefined}
            />
          ))
        )}
      </View>
    </View>
  );
}

export const ItemListEditor = memo(ItemListEditorComponent);
ItemListEditor.displayName = "ItemListEditor";
