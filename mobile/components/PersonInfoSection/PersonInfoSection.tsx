import React, { memo, useMemo } from "react";
import { Pressable, View } from "react-native";

import { Icon } from "../../assets/icon-system";
import { FormFieldInput } from "../FormFieldInput";

import {
  personInfoSectionStyles,
  personInfoSectionTokens,
} from "./PersonInfoSection.styles";
import type { PersonInfoSectionProps } from "./PersonInfoSection.types";

function PersonInfoSectionComponent({
  firstName,
  lastName,
  email,
  phone,
  onFirstNameChange,
  onLastNameChange,
  onEmailChange,
  onPhoneChange,
  disabled = false,
  showRemove = false,
  onRemovePress,
  removeAccessibilityLabel = "Remove person",
  removeTestID,
  testID,
}: PersonInfoSectionProps) {
  const showPhoneField = phone !== undefined || onPhoneChange !== undefined;

  const fieldEditable = useMemo(
    () => ({
      firstName: !disabled && onFirstNameChange != null,
      lastName: !disabled && onLastNameChange != null,
      email: !disabled && onEmailChange != null,
      phone: !disabled && onPhoneChange != null,
    }),
    [
      disabled,
      onEmailChange,
      onFirstNameChange,
      onLastNameChange,
      onPhoneChange,
    ],
  );

  return (
    <View style={personInfoSectionStyles.container} testID={testID}>
      <View style={personInfoSectionStyles.nameRow}>
        <View style={personInfoSectionStyles.nameField}>
          <FormFieldInput
            label="FIRST NAME"
            value={firstName}
            onChangeText={onFirstNameChange}
            editable={fieldEditable.firstName}
            optionalText=""
            placeholder="First Name"
            testID={testID ? `${testID}-first-name` : undefined}
          />
        </View>
        <View style={personInfoSectionStyles.nameField}>
          <FormFieldInput
            label="LAST NAME"
            value={lastName}
            onChangeText={onLastNameChange}
            editable={fieldEditable.lastName}
            optionalText=""
            placeholder="Last Name"
            testID={testID ? `${testID}-last-name` : undefined}
          />
        </View>
        {showRemove ? (
          <View style={personInfoSectionStyles.removeButtonSlot}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={removeAccessibilityLabel}
              disabled={disabled}
              onPress={onRemovePress}
              style={personInfoSectionStyles.removeButton}
              testID={removeTestID}
            >
              <Icon
                name="trash"
                size={personInfoSectionTokens.icon.removeSize}
                color={personInfoSectionTokens.colors.removeIcon}
                accessible={false}
              />
            </Pressable>
          </View>
        ) : null}
      </View>

      <View style={personInfoSectionStyles.fullWidthField}>
        <FormFieldInput
          label="EMAIL"
          value={email}
          onChangeText={onEmailChange}
          editable={fieldEditable.email}
          optionalText=""
          placeholder="agent@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          testID={testID ? `${testID}-email` : undefined}
        />
      </View>

      {showPhoneField ? (
        <View style={personInfoSectionStyles.fullWidthField}>
          <FormFieldInput
            label="PHONE"
            value={phone ?? ""}
            onChangeText={onPhoneChange}
            editable={fieldEditable.phone}
            placeholder="(555) 555-5555"
            keyboardType="phone-pad"
            optionalText=""
            testID={testID ? `${testID}-phone` : undefined}
          />
        </View>
      ) : null}
    </View>
  );
}

export const PersonInfoSection = memo(PersonInfoSectionComponent);
PersonInfoSection.displayName = "PersonInfoSection";
