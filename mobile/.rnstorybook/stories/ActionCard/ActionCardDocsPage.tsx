import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { Icon } from "@/assets/icon-system";
import { ActionCard } from "@/components/ActionCard";
import { actionCardTokens } from "@/components/ActionCard/ActionCard.styles";

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
  ACTION_CARD_DOCS_DESCRIPTION,
  ACTION_CARD_ICON_GUIDANCE,
  ACTION_CARD_PROP_DEFINITIONS,
} from "./actionCardArgTypes";
import { ActionCardShowcase } from "./ActionCardShowcase";

const ICON_SIZE = actionCardTokens.sizing.iconSize;
const ICON_COLOR = actionCardTokens.colors.title;

const USAGE_EXAMPLE = `<ActionCard
  title="Upload Checklist"
  description="Import from CSV file"
  icon={
    <Icon
      name="document-upload"
    />
  }
  onPress={handleUpload}
/>`;

export function ActionCardDocsPage() {
  const [selected, setSelected] = useState(false);

  return (
    <DocScreen>
      <DocTitle>ActionCard</DocTitle>
      <DocSubtitle>{ACTION_CARD_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          ActionCard presents a single action choice with an icon, title, and
          optional description. It is used for checklist workflows such as
          standard, create, upload, and saved template options.
        </DocParagraph>
      </DocSection>

      <DocSection title="Design principles">
        <DocBulletList
          items={[
            "Action-focused, not a generic card framework.",
            "Composable via a passed icon ReactNode.",
            "Selectable and pressable for focused workflows.",
            "Parents own selection logic and press handlers.",
          ]}
        />
      </DocSection>

      <DocSection title="Icon guidance">
        <DocBulletList
          items={ACTION_CARD_ICON_GUIDANCE.map(
            ({ action, icon }) => `${action}: ${icon}`,
          )}
        />
      </DocSection>

      <DocSection title="Playground">
        <DocPreviewCard label="Interactive preview">
          <View style={docsStyles.preview}>
            <ActionCard
              title="Upload Checklist"
              description="Import from CSV file"
              selected={selected}
              onPress={() => setSelected((current) => !current)}
              icon={
                <Icon
                  name="document-upload"
                  size={ICON_SIZE}
                  color={ICON_COLOR}
                  accessible={false}
                />
              }
            />
          </View>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...ACTION_CARD_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Accessibility">
        <DocBulletList
          items={[
            "The entire card is a single accessible button.",
            "Accessibility label combines title, description, and selected state.",
            "Selected and disabled states are exposed through accessibilityState.",
          ]}
        />
      </DocSection>

      <DocSection title="Component gallery">
        <ActionCardShowcase />
      </DocSection>
    </DocScreen>
  );
}

const docsStyles = StyleSheet.create({
  preview: {
    width: "100%",
    maxWidth: 240,
    alignSelf: "center",
    padding: 2,
  },
});
