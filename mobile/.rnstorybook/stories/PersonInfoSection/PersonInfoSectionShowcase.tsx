import React, { useState } from "react";

import { PersonInfoSection } from "@/components/PersonInfoSection";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const DEFAULT_VALUES = {
  firstName: "Michelle",
  lastName: "Schubert",
  email: "michelle@oksubi.com",
  phone: "555-555-5555",
} as const;

const LONG_VALUES = {
  firstName: "Michelle-Anne",
  lastName: "Schubert-Wellington",
  email: "michelle.schubert.wellington@oksubi-enterprise.com",
  phone: "+1 (555) 555-5555 ext. 402",
} as const;

function EditablePersonInfoSection({
  initialValues = DEFAULT_VALUES,
  disabled = false,
  showPhone = true,
}: {
  initialValues?: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  disabled?: boolean;
  showPhone?: boolean;
}) {
  const [firstName, setFirstName] = useState(initialValues.firstName);
  const [lastName, setLastName] = useState(initialValues.lastName);
  const [email, setEmail] = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone ?? "");

  return (
    <PersonInfoSection
      firstName={firstName}
      lastName={lastName}
      email={email}
      phone={showPhone ? phone : undefined}
      onFirstNameChange={setFirstName}
      onLastNameChange={setLastName}
      onEmailChange={setEmail}
      onPhoneChange={showPhone ? setPhone : undefined}
      disabled={disabled}
    />
  );
}

export type PersonInfoSectionShowcaseSection =
  | "all"
  | "default"
  | "noPhone"
  | "disabled"
  | "longValues";

export function PersonInfoSectionShowcase({
  section = "all",
}: {
  section?: PersonInfoSectionShowcaseSection;
}) {
  const show = (name: PersonInfoSectionShowcaseSection) =>
    section === "all" || section === name;

  return (
    <GalleryScreen>
      {show("default") ? (
        <GallerySection title="Default">
          <GalleryItem label="Editable" wide>
            <EditablePersonInfoSection />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("noPhone") ? (
        <GallerySection title="Without phone">
          <GalleryItem label="Phone omitted" wide>
            <EditablePersonInfoSection showPhone={false} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("disabled") ? (
        <GallerySection title="Disabled">
          <GalleryItem label="Read-only" wide>
            <EditablePersonInfoSection disabled />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("longValues") ? (
        <GallerySection title="Long values">
          <GalleryItem label="Responsive layout" wide>
            <EditablePersonInfoSection initialValues={LONG_VALUES} />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}
