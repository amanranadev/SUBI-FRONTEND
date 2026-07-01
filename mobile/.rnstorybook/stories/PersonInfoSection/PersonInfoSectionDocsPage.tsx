import React, { useState } from "react";

import { PersonInfoSection } from "@/components/PersonInfoSection";

import {
  DocBulletList,
  DocCodeBlock,
  DocParagraph,
  DocPreviewCard,
  DocPropsTable,
  DocScreen,
  DocSection,
  DocSubtitle,
  DocTitle,
} from "../../components/DocsPrimitives";
import {
  PERSON_INFO_SECTION_DOCS_DESCRIPTION,
  PERSON_INFO_SECTION_PROP_DEFINITIONS,
} from "./personInfoSectionArgTypes";
import { PersonInfoSectionShowcase } from "./PersonInfoSectionShowcase";

const USAGE_EXAMPLE = `<PersonInfoSection
  firstName="Michelle"
  lastName="Schubert"
  email="michelle@oksubi.com"
  phone="555-555-5555"
  onFirstNameChange={setFirstName}
  onLastNameChange={setLastName}
  onEmailChange={setEmail}
  onPhoneChange={setPhone}
/>`;

export function PersonInfoSectionDocsPage() {
  const [firstName, setFirstName] = useState("Michelle");
  const [lastName, setLastName] = useState("Schubert");
  const [email, setEmail] = useState("michelle@oksubi.com");
  const [phone, setPhone] = useState("555-555-5555");

  return (
    <DocScreen>
      <DocTitle>PersonInfoSection</DocTitle>
      <DocSubtitle>{PERSON_INFO_SECTION_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          PersonInfoSection presents editable buyer, seller, agent, and contact
          details in a mobile-first layout. Parents supply values and change
          handlers while the component focuses on field composition and layout.
        </DocParagraph>
      </DocSection>

      <DocSection title="Composition">
        <DocBulletList
          items={[
            "FormFieldInput for every field — no custom inputs.",
            "Spacing and gaps reuse FormFieldInput design tokens.",
          ]}
        />
      </DocSection>

      <DocSection title="Playground">
        <DocPreviewCard label="Interactive preview">
          <PersonInfoSection
            firstName={firstName}
            lastName={lastName}
            email={email}
            phone={phone}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            onEmailChange={setEmail}
            onPhoneChange={setPhone}
          />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...PERSON_INFO_SECTION_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Accessibility">
        <DocBulletList
          items={[
            "Each field uses FormFieldInput labels and accessible text inputs.",
            "Disabled state delegates to FormFieldInput editable behavior.",
            "Parents can pass testID for container and derived field test IDs.",
          ]}
        />
      </DocSection>

      <DocSection title="Component gallery">
        <PersonInfoSectionShowcase />
      </DocSection>
    </DocScreen>
  );
}
