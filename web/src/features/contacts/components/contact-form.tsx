"use client";

import { ContactPhoneAutocomplete } from "@/features/contacts/components/contact-autocomplete";
import { ContactEmailAutocomplete } from "@/features/contacts/components/contact-email-autocomplete";
import {
  CONTACT_TYPES_ARRAY,
  getVendorSubcategories,
  type ContactRequiredField,
} from "@/features/contacts/constants";
import type {
  ContactResult,
  CreateContactData,
} from "@/features/contacts/types";
import { Form } from "@/shared/ui/form";
import { FormInputField } from "@/shared/ui/form-input-field";
import { FormSelectWithController } from "@/shared/ui/form-selector-with-controller";
import { FormTextareaField } from "@/shared/ui/form-textarea-field";
import { Controller } from "react-hook-form";

import { useContactForm } from "../hooks/use-contact-form";
import { ContactFormFooter } from "./contact-form/contact-form-footer";
import { ContactFormHeader } from "./contact-form/contact-form-header";

interface ContactFormProps {
  contact?: ContactResult | null;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (
    data: CreateContactData,
  ) => Promise<boolean | void> | boolean | void;
}

export function ContactForm({
  contact,
  isSubmitting = false,
  onCancel,
  onSubmit,
}: ContactFormProps) {
  const {
    form,
    isFavorite,
    effectiveRequiredFields,
    handleFormSubmit,
    toggleFavorite,
    handleContactTypeChange,
    handleVendorTypeChange,
    isVendor,
  } = useContactForm({ contact, onSubmit });

  const required = (field: string) =>
    effectiveRequiredFields.includes(field as ContactRequiredField);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <ContactFormHeader
        isEdit={Boolean(contact)}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        onCancel={onCancel}
      />

      <Form {...form}>
        <form
          onSubmit={handleFormSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
            <div className="grid gap-4 py-1 md:grid-cols-2">
              <FormSelectWithController
                control={form.control}
                name="contactType"
                label="Contact Type"
                placeholder="Select contact type"
                options={CONTACT_TYPES_ARRAY.map((type) => ({
                  value: type,
                  label: type,
                }))}
                required
                onChange={handleContactTypeChange}
              />

              {isVendor ? (
                <FormSelectWithController
                  control={form.control}
                  name="vendorType"
                  label="Vendor Type"
                  placeholder="Select vendor type"
                  options={getVendorSubcategories().map((type) => ({
                    value: type.type,
                    label: type.type,
                  }))}
                  required={required("vendorType")}
                  optional={!required("vendorType")}
                  onChange={handleVendorTypeChange}
                />
              ) : null}
            </div>

            <div className="grid gap-4 py-1 md:grid-cols-2">
              <FormInputField
                control={form.control}
                name="individualName"
                label="Individual Name"
                placeholder="Enter individual name"
                required={required("individualName")}
                optional={!required("individualName")}
              />
              <FormInputField
                control={form.control}
                name="companyName"
                label="Company Name"
                placeholder="Enter company name"
                required={required("companyName")}
                optional={!required("companyName")}
              />
            </div>

            <div className="grid gap-4 py-1 md:grid-cols-2">
              <Controller
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Phone{" "}
                      {required("phoneNumber") && (
                        <span className="text-destructive">*</span>
                      )}
                    </label>
                    <ContactPhoneAutocomplete
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </div>
                )}
              />
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                      Email{" "}
                      {required("email") && (
                        <span className="text-destructive">*</span>
                      )}
                    </label>
                    <ContactEmailAutocomplete
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="Enter email address"
                    />
                  </div>
                )}
              />
            </div>

            <div className="grid gap-4 py-1 md:grid-cols-2">
              <FormInputField
                control={form.control}
                name="website"
                label="Website"
                placeholder="https://example.com"
                required={required("website")}
                optional={!required("website")}
              />
              <FormInputField
                control={form.control}
                name="license"
                label="License Number"
                placeholder="LIC123456"
                required={required("license")}
                optional={!required("license")}
              />
            </div>

            <FormTextareaField
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Add any details that will help you remember this contact"
              required={required("notes")}
              optional={!required("notes")}
              rows={5}
              textareaClassName="min-h-32 rounded-[1.25rem]"
            />
          </div>

          <ContactFormFooter
            isEdit={Boolean(contact)}
            isSubmitting={isSubmitting}
            isDirty={form.formState.isDirty}
            isValid={form.formState.isValid}
            onCancel={onCancel}
          />
        </form>
      </Form>
    </div>
  );
}
