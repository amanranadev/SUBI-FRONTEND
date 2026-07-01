import React, { useState } from "react";

import { PersonInfoList, type PersonInfo } from "@/components/PersonInfoList";

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
  PERSON_INFO_LIST_DOCS_DESCRIPTION,
  PERSON_INFO_LIST_PROP_DEFINITIONS,
} from "./personInfoListArgTypes";
import { PersonInfoListShowcase } from "./PersonInfoListShowcase";

const USAGE_EXAMPLE = `const [buyers, setBuyers] = useState([
  {
    id: "1",
    firstName: "Michelle",
    lastName: "Schubert",
    email: "michelle@oksubi.com",
    phone: "(509)-494-9408",
  },
]);

<PersonInfoList
  people={buyers}
  minItems={1}
  maxItems={10}
  showImportButton
  onChange={setBuyers}
/>`;

const INITIAL_PEOPLE: PersonInfo[] = [
  {
    id: "1",
    firstName: "Michelle",
    lastName: "Schubert",
    email: "michelle@oksubi.com",
    phone: "(509)-494-9408",
  },
];

export function PersonInfoListDocsPage() {
  const [people, setPeople] = useState(INITIAL_PEOPLE);

  return (
    <DocScreen>
      <DocTitle>PersonInfoList</DocTitle>
      <DocSubtitle>{PERSON_INFO_LIST_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          PersonInfoList manages a collection of people for buyers, sellers,
          agents, and contacts. It composes PersonInfoSection for each entry and
          exposes add, remove, and optional import actions without owning
          validation, API calls, or persistence.
        </DocParagraph>
      </DocSection>

      <DocSection title="Design principles">
        <DocBulletList
          items={[
            "Collection wrapper — not a person card implementation.",
            "Reuses PersonInfoSection for every person entry.",
            "Parent owns people data, validation, and business workflows.",
            "Component owns add, remove, rendering, and collection constraints.",
          ]}
        />
      </DocSection>

      <DocSection title="Collection constraints">
        <DocBulletList
          items={[
            "minItems — remove actions are hidden when people.length <= minItems.",
            "maxItems — the Add button is disabled when the limit is reached.",
            "Remove is not rendered in a disabled state; it is omitted entirely at minItems.",
          ]}
        />
      </DocSection>

      <DocSection title="Playground">
        <DocPreviewCard label="Interactive preview">
          <PersonInfoList
            people={people}
            onChange={setPeople}
            minItems={1}
            maxItems={10}
            showImportButton
            onImportPress={() => undefined}
          />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...PERSON_INFO_LIST_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Accessibility">
        <DocBulletList
          items={[
            "Add, import, and remove actions expose accessible labels.",
            "Each person entry is announced as Person 1, Person 2, and so on.",
            "PersonInfoSection fields inherit FormFieldInput accessibility.",
          ]}
        />
      </DocSection>

      <DocSection title="Component gallery">
        <PersonInfoListShowcase />
      </DocSection>
    </DocScreen>
  );
}
