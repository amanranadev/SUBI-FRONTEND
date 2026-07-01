import React, { memo, useCallback, useMemo } from "react";
import { AccessibilityInfo, View } from "react-native";

import { Icon } from "../../assets/icon-system";
import { PersonInfoSection } from "../PersonInfoSection";
import { PrimaryButton, buttonTokens } from "../PrimaryButton";

import { personInfoListStyles, personInfoListTokens } from "./PersonInfoList.styles";
import type {
  PersonInfo,
  PersonInfoListItemProps,
  PersonInfoListProps,
} from "./PersonInfoList.types";

const DEFAULT_ADD_BUTTON_LABEL = "Add Buyer";
const ADD_BUTTON_TEXT = "Add";
const IMPORT_BUTTON_TEXT = "Import";
const IMPORT_BUTTON_ACCESSIBILITY_LABEL = "Import From Contacts";

function generatePersonId(): string {
  return `person-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function createEmptyPerson(): PersonInfo {
  return {
    id: generatePersonId(),
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  };
}

function deriveRemoveAccessibilityLabel(addButtonLabel: string): string {
  if (addButtonLabel.startsWith("Add ")) {
    return addButtonLabel.replace(/^Add /, "Remove ");
  }
  return `Remove ${addButtonLabel}`;
}

const PersonInfoListItem = memo(function PersonInfoListItem({
  person,
  index,
  disabled,
  showRemove,
  removeAccessibilityLabel,
  onRemove,
  onFieldChange,
  testID,
}: PersonInfoListItemProps) {
  const handleFirstNameChange = useCallback(
    (value: string) => {
      onFieldChange(person.id, "firstName", value);
    },
    [onFieldChange, person.id],
  );

  const handleLastNameChange = useCallback(
    (value: string) => {
      onFieldChange(person.id, "lastName", value);
    },
    [onFieldChange, person.id],
  );

  const handleEmailChange = useCallback(
    (value: string) => {
      onFieldChange(person.id, "email", value);
    },
    [onFieldChange, person.id],
  );

  const handlePhoneChange = useCallback(
    (value: string) => {
      onFieldChange(person.id, "phone", value);
    },
    [onFieldChange, person.id],
  );

  const handleRemove = useCallback(() => {
    onRemove(person.id);
  }, [onRemove, person.id]);

  return (
    <View
      style={personInfoListStyles.personEntry}
      accessibilityLabel={`Person ${index + 1}`}
      testID={testID}
    >
      {person.sourceBadge ? (
        <View style={personInfoListStyles.personEntryHeader}>
          <View style={personInfoListStyles.sourceBadgeSlot}>
            {person.sourceBadge}
          </View>
        </View>
      ) : null}

      <PersonInfoSection
        firstName={person.firstName}
        lastName={person.lastName}
        email={person.email}
        phone={person.phone}
        onFirstNameChange={disabled ? undefined : handleFirstNameChange}
        onLastNameChange={disabled ? undefined : handleLastNameChange}
        onEmailChange={disabled ? undefined : handleEmailChange}
        onPhoneChange={disabled ? undefined : handlePhoneChange}
        disabled={disabled}
        showRemove={showRemove}
        onRemovePress={handleRemove}
        removeAccessibilityLabel={removeAccessibilityLabel}
        removeTestID={testID ? `${testID}-remove` : undefined}
        testID={testID ? `${testID}-fields` : undefined}
      />
    </View>
  );
});

PersonInfoListItem.displayName = "PersonInfoListItem";

function PersonInfoListComponent({
  people,
  onChange,
  addButtonLabel = DEFAULT_ADD_BUTTON_LABEL,
  showImportButton = false,
  onImportPress,
  minItems = 0,
  maxItems,
  disabled = false,
  testID,
}: PersonInfoListProps) {
  const removeAccessibilityLabel = useMemo(
    () => deriveRemoveAccessibilityLabel(addButtonLabel),
    [addButtonLabel],
  );

  const isMaxItemsReached = useMemo(
    () => maxItems != null && people.length >= maxItems,
    [maxItems, people.length],
  );

  const canRemove = useMemo(
    () => !disabled && people.length > minItems,
    [disabled, minItems, people.length],
  );

  const handleAdd = useCallback(() => {
    if (disabled || isMaxItemsReached) {
      return;
    }

    onChange([...people, createEmptyPerson()]);
    AccessibilityInfo.announceForAccessibility(addButtonLabel);
  }, [addButtonLabel, disabled, isMaxItemsReached, onChange, people]);

  const handleRemove = useCallback(
    (personId: string) => {
      if (!canRemove) {
        return;
      }

      onChange(people.filter((person) => person.id !== personId));
      AccessibilityInfo.announceForAccessibility(removeAccessibilityLabel);
    },
    [canRemove, onChange, people, removeAccessibilityLabel],
  );

  const handleFieldChange = useCallback(
    (
      personId: string,
      field: "firstName" | "lastName" | "email" | "phone",
      value: string,
    ) => {
      if (disabled) {
        return;
      }

      onChange(
        people.map((person) =>
          person.id === personId ? { ...person, [field]: value } : person,
        ),
      );
    },
    [disabled, onChange, people],
  );

  const addIcon = useMemo(
    () => (
      <Icon
        name="add"
        size={personInfoListTokens.icon.actionSize}
        color={buttonTokens.colors.textOnBrand}
        accessible={false}
      />
    ),
    [],
  );

  const importIcon = useMemo(
    () => (
      <Icon
        name="add"
        size={personInfoListTokens.icon.actionSize}
        color={buttonTokens.colors.textPrimary}
        accessible={false}
      />
    ),
    [],
  );

  const showAddButton = !disabled;
  const showHeaderActions = showImportButton || showAddButton;

  return (
    <View
      style={personInfoListStyles.container}
      accessibilityLabel="People list"
      testID={testID}
    >
      {showHeaderActions ? (
        <View style={personInfoListStyles.headerActions}>
          {showImportButton ? (
            <PrimaryButton
              variant="outline"
              size="sm"
              leftIcon={importIcon}
              disabled={disabled}
              onPress={onImportPress}
              accessibilityLabel={IMPORT_BUTTON_ACCESSIBILITY_LABEL}
              testID={testID ? `${testID}-import` : undefined}
            >
              {IMPORT_BUTTON_TEXT}
            </PrimaryButton>
          ) : null}
          {showAddButton ? (
            <PrimaryButton
              size="sm"
              leftIcon={addIcon}
              disabled={isMaxItemsReached}
              onPress={handleAdd}
              accessibilityLabel={addButtonLabel}
              testID={testID ? `${testID}-add` : undefined}
            >
              {ADD_BUTTON_TEXT}
            </PrimaryButton>
          ) : null}
        </View>
      ) : null}

      <View
        style={personInfoListStyles.peopleSection}
        accessibilityLabel="People entries"
      >
        {people.map((person, index) => (
          <PersonInfoListItem
            key={person.id}
            person={person}
            index={index}
            disabled={disabled}
            showRemove={canRemove}
            removeAccessibilityLabel={removeAccessibilityLabel}
            onRemove={handleRemove}
            onFieldChange={handleFieldChange}
            testID={testID ? `${testID}-person-${index}` : undefined}
          />
        ))}
      </View>
    </View>
  );
}

export const PersonInfoList = memo(PersonInfoListComponent);
PersonInfoList.displayName = "PersonInfoList";
