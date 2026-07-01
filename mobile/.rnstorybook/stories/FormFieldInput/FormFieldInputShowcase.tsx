import React from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "../../../assets/icon-system";
import {
  FormFieldInput,
  formFieldInputTokens,
} from "../../../components/FormFieldInput";
import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

export type FormFieldInputShowcaseSection =
  | "all"
  | "figma"
  | "auth"
  | "states"
  | "icons"
  | "interactive-left"
  | "interactive-right"
  | "password"
  | "password-visible"
  | "password-error"
  | "password-disabled"
  | "sizes"
  | "multiline";

export interface FormFieldInputShowcaseProps {
  section?: FormFieldInputShowcaseSection;
}

export function FormFieldInputShowcase({
  section = "all",
}: FormFieldInputShowcaseProps) {
  const show = (key: Exclude<FormFieldInputShowcaseSection, "all">) =>
    section === "all" || section === key;

  return (
    <GalleryScreen>
      {show("figma") ? (
        <GallerySection
          title="1. Figma Invite Fields"
          description="Uppercase label, 48px rounded field, muted placeholder."
        >
          <GalleryItem label="First Name" wide>
            <View style={styles.figmaWidth}>
              <FormFieldInput label="FIRST NAME" placeholder="First Name" />
            </View>
          </GalleryItem>
          <GalleryItem label="Email" wide>
            <View style={styles.figmaWidth}>
              <FormFieldInput label="EMAIL" placeholder="agent@example.com" />
            </View>
          </GalleryItem>
          <GalleryItem label="Phone" wide>
            <View style={styles.figmaWidth}>
              <FormFieldInput label="PHONE" placeholder="(555) 555-5555" />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("auth") ? (
        <GallerySection
          title="2. Auth Inputs"
          description="Login and password examples from the mobile app/web form split."
        >
          <GalleryItem label="Email" wide>
            <FormFieldInput
              label="Email address"
              placeholder="name@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              required
            />
          </GalleryItem>
          <GalleryItem label="Password" wide>
            <FormFieldInput
              label="Password"
              placeholder="Password"
              isPassword
              required
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("states") ? (
        <GallerySection title="3. States" description="Default, success, error, muted, disabled.">
          <GalleryItem label="Default" wide>
            <FormFieldInput label="FIRST NAME" placeholder="First Name" />
          </GalleryItem>
          <GalleryItem label="Success" wide>
            <FormFieldInput
              label="EMAIL"
              value="agent@example.com"
              variant="success"
              helperText="Looks good."
            />
          </GalleryItem>
          <GalleryItem label="Error" wide>
            <FormFieldInput
              label="EMAIL"
              value="agent"
              errorText="Enter a valid email address."
            />
          </GalleryItem>
          <GalleryItem label="Muted" wide>
            <FormFieldInput
              label="REFERENCE"
              value="Auto-filled from document"
              variant="muted"
            />
          </GalleryItem>
          <GalleryItem label="Disabled" wide>
            <FormFieldInput
              label="LOCKED FIELD"
              value="Read only"
              editable={false}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("icons") ? (
        <GallerySection title="4. Icons and Clear" description="Adornment and clear-button slots.">
          <GalleryItem label="Left icon" wide>
            <FormFieldInput
              label="SEARCH"
              placeholder="Search files"
              leftIcon={
                <Icon
                  name="search"
                  size={18}
                  color={formFieldInputTokens.colors.textMuted}
                  accessible={false}
                />
              }
            />
          </GalleryItem>
          <GalleryItem label="Right icon" wide>
            <FormFieldInput
              label="DOCUMENT"
              placeholder="Select document"
              rightIcon={
                <Icon
                  name="document"
                  size={18}
                  color={formFieldInputTokens.colors.textMuted}
                  accessible={false}
                />
              }
            />
          </GalleryItem>
          <GalleryItem label="Clear" wide>
            <FormFieldInput
              label="SEARCH"
              value="Black Pearl"
              showClearButton
              onClear={() => {}}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("interactive-left") ? (
        <GallerySection
          title="Interactive Left Icon"
          description="Left icon becomes pressable when onLeftIconPress is provided."
        >
          <GalleryItem label="Interactive left icon" wide>
            <FormFieldInput
              label="SEARCH"
              placeholder="Search files"
              leftIcon={
                <Icon
                  name="search"
                  size={18}
                  color={formFieldInputTokens.colors.textMuted}
                  accessible={false}
                />
              }
              onLeftIconPress={() => {}}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("interactive-right") ? (
        <GallerySection
          title="Interactive Right Icon"
          description="Right icon becomes pressable when onRightIconPress is provided."
        >
          <GalleryItem label="Interactive right icon" wide>
            <FormFieldInput
              label="DOCUMENT"
              placeholder="Select document"
              rightIcon={
                <Icon
                  name="document"
                  size={18}
                  color={formFieldInputTokens.colors.textMuted}
                  accessible={false}
                />
              }
              onRightIconPress={() => {}}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("password") ? (
        <GallerySection
          title="Password"
          description="Built-in visibility toggle via isPassword. Hidden by default."
        >
          <GalleryItem label="Password" wide>
            <FormFieldInput
              label="PASSWORD"
              placeholder="Password"
              value="MySecret123"
              isPassword
              required
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("password-visible") ? (
        <GallerySection
          title="Password Visible"
          description="Tap the eye icon to reveal password text."
        >
          <GalleryItem label="Password visible" wide>
            <FormFieldInput
              label="PASSWORD"
              placeholder="Password"
              value="MySecret123"
              isPassword
              helperText="Tap Show password to reveal text."
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("password-error") ? (
        <GallerySection
          title="Password Error"
          description="Password field with validation error."
        >
          <GalleryItem label="Password error" wide>
            <FormFieldInput
              label="PASSWORD"
              placeholder="Password"
              value="short"
              isPassword
              errorText="Password must be at least 8 characters."
              required
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("password-disabled") ? (
        <GallerySection
          title="Disabled Password"
          description="Password field in disabled state."
        >
          <GalleryItem label="Disabled password" wide>
            <FormFieldInput
              label="PASSWORD"
              value="LockedPassword"
              isPassword
              editable={false}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("sizes") ? (
        <GallerySection title="6. Sizes" description="md matches invite form; lg matches review sheet.">
          <GalleryItem label="Small" wide>
            <FormFieldInput inputSize="sm" label="SMALL" placeholder="Small" />
          </GalleryItem>
          <GalleryItem label="Medium" wide>
            <FormFieldInput inputSize="md" label="MEDIUM" placeholder="Medium" />
          </GalleryItem>
          <GalleryItem label="Large" wide>
            <FormFieldInput inputSize="lg" label="LARGE" placeholder="Large" />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("multiline") ? (
        <GallerySection title="7. Multiline" description="Description and notes fields.">
          <GalleryItem label="Description" wide>
            <FormFieldInput
              label="DESCRIPTION"
              placeholder="Add a description"
              multiline
              numberOfLines={4}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  figmaWidth: {
    width: "100%",
    maxWidth: 305,
  },
});
