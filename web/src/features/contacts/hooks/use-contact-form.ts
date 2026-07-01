import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CONTACT_TYPES,
  getContactTypeConfig,
  type ContactRequiredField,
} from "@/features/contacts/constants";
import type {
  ContactFormData,
  ContactResult,
  CreateContactData,
} from "@/features/contacts/types";
import {
  mapContactToFormData,
  normalizeContactFormData,
} from "@/features/contacts/utils";
import { getContactSchema, getEmptyFormValues } from "../schemas/contact-schema";

const CONTACT_PAYLOAD_FIELDS: Array<keyof CreateContactData> = [
  "companyName",
  "individualName",
  "phoneNumber",
  "email",
  "website",
  "license",
  "notes",
  "isFavorite",
  "vendorType",
];

function getChangedContactPayload(
  currentValues: ContactFormData,
  initialValues: ContactFormData,
): CreateContactData | null {
  const normalizedCurrentValues = normalizeContactFormData(currentValues);
  const normalizedInitialValues = normalizeContactFormData(initialValues);

  const changedFields = CONTACT_PAYLOAD_FIELDS.filter(
    (field) => normalizedCurrentValues[field] !== normalizedInitialValues[field],
  );

  if (changedFields.length === 0) {
    return null;
  }

  const payload: Partial<
    Record<keyof CreateContactData, CreateContactData[keyof CreateContactData]>
  > = {
    vendorType: normalizedCurrentValues.vendorType,
  };

  for (const field of changedFields) {
    payload[field] = normalizedCurrentValues[field];
  }

  return payload as CreateContactData;
}

interface UseContactFormProps {
  contact?: ContactResult | null;
  onSubmit: (data: CreateContactData) => Promise<boolean | void> | boolean | void;
}

export function useContactForm({ contact, onSubmit }: UseContactFormProps) {
  const initialValues = React.useMemo(
    () => mapContactToFormData(contact) || getEmptyFormValues(),
    [contact],
  );

  const [schema, setSchema] = React.useState(() => {
    const initialType =
      initialValues.contactType === CONTACT_TYPES.VENDOR && initialValues.vendorType
        ? initialValues.vendorType
        : initialValues.contactType;

    return getContactSchema(getContactTypeConfig(initialType).requiredFields);
  });

  const form = useForm<ContactFormData>({
    mode: "onChange",
    resolver: zodResolver(schema),
    defaultValues: initialValues,
  });

  const contactType = form.watch("contactType");
  const vendorType = form.watch("vendorType");
  const isFavorite = form.watch("isFavorite");

  const selectedConfig = React.useMemo(() => {
    if (contactType === CONTACT_TYPES.VENDOR && vendorType) {
      return getContactTypeConfig(vendorType);
    }
    return getContactTypeConfig(contactType || CONTACT_TYPES.LENDER);
  }, [contactType, vendorType]);

  const effectiveRequiredFields = React.useMemo(() => {
    const requiredFields = new Set<ContactRequiredField>(selectedConfig.requiredFields);
    if (contact) {
      requiredFields.add("website");
    }
    return Array.from(requiredFields);
  }, [contact, selectedConfig.requiredFields]);

  React.useEffect(() => {
    form.reset(initialValues);
  }, [form, initialValues]);

  React.useEffect(() => {
    setSchema(getContactSchema(effectiveRequiredFields));
  }, [effectiveRequiredFields]);

  const handleCreateSubmit = async (values: ContactFormData) => {
    const normalized = normalizeContactFormData(values);
    return onSubmit(normalized);
  };

  const handleEditSubmit = async () => {
    const dirtyFieldNames = Object.entries(form.formState.dirtyFields)
      .filter(([, isDirty]) => Boolean(isDirty))
      .map(([fieldName]) => fieldName as keyof ContactFormData);

    if (dirtyFieldNames.length === 0) return;

    const fieldsToValidate = Array.from(
      new Set<keyof ContactFormData>([
        ...dirtyFieldNames,
        ...effectiveRequiredFields,
      ]),
    );

    const isValid = await form.trigger(fieldsToValidate, { shouldFocus: true });
    if (!isValid) return;

    const changedPayload = getChangedContactPayload(form.getValues(), initialValues);
    if (!changedPayload) return;

    return onSubmit(changedPayload);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (contact) {
      await handleEditSubmit();
    } else {
      await form.handleSubmit(handleCreateSubmit)(event);
    }
  };

  const toggleFavorite = () => {
    form.setValue("isFavorite", !isFavorite, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleContactTypeChange = (value: string) => {
    form.setValue("contactType", value as ContactFormData["contactType"], {
      shouldValidate: true,
      shouldDirty: true,
    });
    if (value !== CONTACT_TYPES.VENDOR) {
      form.setValue("vendorType", undefined, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleVendorTypeChange = (value: string) => {
    form.setValue("vendorType", value as ContactFormData["vendorType"], {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return {
    form,
    contactType,
    vendorType,
    isFavorite,
    effectiveRequiredFields,
    handleFormSubmit,
    toggleFavorite,
    handleContactTypeChange,
    handleVendorTypeChange,
    isVendor: contactType === CONTACT_TYPES.VENDOR,
  };
}
