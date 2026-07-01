import React, { useState } from "react";

import { Badge } from "@/components/ChipsBadges";
import { PersonInfoList, type PersonInfo } from "@/components/PersonInfoList";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const MICHELLE: PersonInfo = {
  id: "buyer-1",
  firstName: "Michelle",
  lastName: "Schubert",
  email: "michelle@oksubi.com",
  phone: "(509)-494-9408",
};

const JORDAN: PersonInfo = {
  id: "buyer-2",
  firstName: "Jordan",
  lastName: "Lee",
  email: "jordan.lee@example.com",
  phone: "(206)-555-0182",
};

const IMPORTED_PERSON: PersonInfo = {
  id: "buyer-imported",
  firstName: "Alex",
  lastName: "Rivera",
  email: "alex.rivera@example.com",
  phone: "(425)-555-0144",
  sourceBadge: <Badge label="Imported" variant="muted" size="sm" />,
};

function ControlledPersonInfoList({
  initialPeople = [] as PersonInfo[],
  minItems,
  maxItems,
  disabled = false,
  showImportButton = false,
  addButtonLabel,
}: {
  initialPeople?: PersonInfo[];
  minItems?: number;
  maxItems?: number;
  disabled?: boolean;
  showImportButton?: boolean;
  addButtonLabel?: string;
}) {
  const [people, setPeople] = useState(initialPeople);

  return (
    <PersonInfoList
      people={people}
      onChange={setPeople}
      minItems={minItems}
      maxItems={maxItems}
      disabled={disabled}
      showImportButton={showImportButton}
      onImportPress={() => undefined}
      addButtonLabel={addButtonLabel}
    />
  );
}

export type PersonInfoListShowcaseSection =
  | "all"
  | "single"
  | "multiple"
  | "import"
  | "maxItems"
  | "disabled"
  | "buyerExample";

export function PersonInfoListShowcase({
  section = "all",
}: {
  section?: PersonInfoListShowcaseSection;
}) {
  const show = (name: PersonInfoListShowcaseSection) =>
    section === "all" || section === name;

  return (
    <GalleryScreen>
      {show("single") ? (
        <GallerySection title="Single person">
          <GalleryItem label="minItems = 1 — no delete action" wide>
            <ControlledPersonInfoList
              initialPeople={[MICHELLE]}
              minItems={1}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("multiple") ? (
        <GallerySection title="Multiple people">
          <GalleryItem label="Delete actions visible" wide>
            <ControlledPersonInfoList
              initialPeople={[MICHELLE, JORDAN]}
              minItems={1}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("import") ? (
        <GallerySection title="Import contacts">
          <GalleryItem label="Import action visible" wide>
            <ControlledPersonInfoList
              initialPeople={[IMPORTED_PERSON]}
              showImportButton
              minItems={1}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("maxItems") ? (
        <GallerySection title="Max items reached">
          <GalleryItem label="Add disabled at limit" wide>
            <ControlledPersonInfoList
              initialPeople={[MICHELLE, JORDAN]}
              minItems={1}
              maxItems={2}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("disabled") ? (
        <GallerySection title="Disabled">
          <GalleryItem label="Read-only mode" wide>
            <ControlledPersonInfoList
              initialPeople={[MICHELLE, JORDAN]}
              minItems={1}
              disabled
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("buyerExample") ? (
        <GallerySection title="Buyer example">
          <GalleryItem label="Two buyers" wide>
            <ControlledPersonInfoList
              initialPeople={[MICHELLE, JORDAN]}
              minItems={1}
              maxItems={10}
              showImportButton
              addButtonLabel="Add Buyer"
            />
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}
