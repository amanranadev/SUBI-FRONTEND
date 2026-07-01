import React, { useState } from "react";

import { ItemListEditor } from "@/components/ItemListEditor";

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
  ITEM_LIST_EDITOR_DOCS_DESCRIPTION,
  ITEM_LIST_EDITOR_PROP_DEFINITIONS,
} from "./itemListEditorArgTypes";
import { ItemListEditorShowcase } from "./ItemListEditorShowcase";

const USAGE_EXAMPLE = `const [items, setItems] = useState([
  "Microwave",
  "Refrigerator",
]);

<ItemListEditor
  items={items}
  onChange={setItems}
  label="ADD ITEM"
  placeholder="Add item that stays"
/>`;

export function ItemListEditorDocsPage() {
  const [items, setItems] = useState(["Microwave", "Refrigerator"]);

  return (
    <DocScreen>
      <DocTitle>ItemListEditor</DocTitle>
      <DocSubtitle>{ITEM_LIST_EDITOR_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          ItemListEditor lets users build a list of string values through a
          draft input and Add action. It is a business-level reusable component
          for workflows such as items that stay with a property, not a generic
          list primitive.
        </DocParagraph>
      </DocSection>

      <DocSection title="Design principles">
        <DocBulletList
          items={[
            "Business component with intentionally narrow scope.",
            "Composes existing design-system primitives only.",
            "Parent owns items, persistence, validation, and submission.",
            "Component owns the current draft input value.",
          ]}
        />
      </DocSection>

      <DocSection title="Composition">
        <DocBulletList
          items={[
            "FormFieldInput for the draft value field.",
            "PrimaryButton for the Add action.",
            "Icon for item check and remove affordances.",
          ]}
        />
      </DocSection>

      <DocSection title="Playground">
        <DocPreviewCard label="Interactive preview">
          <ItemListEditor
            items={items}
            onChange={setItems}
            label="ADD ITEM"
            placeholder="Add item that stays"
            helperText="Optional"
          />
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...ITEM_LIST_EDITOR_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Accessibility">
        <DocBulletList
          items={[
            "Input and Add button expose accessible labels.",
            "Remove buttons announce the item name in their label.",
            "The items section exposes an accessible group label for screen readers.",
            "Item added and Item removed are announced when actions succeed.",
          ]}
        />
      </DocSection>

      <DocSection title="Component gallery">
        <ItemListEditorShowcase />
      </DocSection>
    </DocScreen>
  );
}
