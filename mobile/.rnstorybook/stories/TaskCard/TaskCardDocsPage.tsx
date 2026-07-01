import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { TaskCard } from "@/components/TaskCard";

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
  TASK_CARD_COMPOSITION,
  TASK_CARD_DOCS_DESCRIPTION,
  TASK_CARD_PROP_DEFINITIONS,
} from "./taskCardArgTypes";
import { TaskCardShowcase } from "./TaskCardShowcase";

const USAGE_EXAMPLE = `<TaskCard
  transactionName="345 Diagon Alley - New"
  taskName="Earnest Money Delivery"
  dueDate={new Date()}
  onEditPress={() => {}}
  onSkipPress={() => {}}
  onDonePress={() => {}}
  onDocumentPress={() => {}}
  onDeletePress={() => {}}
/>`;

export function TaskCardDocsPage() {
  const [dueDate, setDueDate] = useState<Date | undefined>(new Date(2026, 5, 15));
  const [status, setStatus] = useState<"pending" | "done" | "skipped">("pending");

  return (
    <DocScreen>
      <DocTitle>TaskCard</DocTitle>
      <DocSubtitle>{TASK_CARD_DOCS_DESCRIPTION}</DocSubtitle>

      <DocSection title="Overview">
        <DocParagraph>
          TaskCard presents a single transaction task with due date selection,
          document and delete header actions, and Edit, Skip, and Done footer
          actions. It is intended for checklist and task review flows inside
          transaction workflows.
        </DocParagraph>
      </DocSection>

      <DocSection title="Design principles">
        <DocBulletList
          items={[
            "Business component scoped to transaction task presentation.",
            "Composed from existing design system primitives only.",
            "Parents own actions, validation, persistence, and navigation.",
          ]}
        />
      </DocSection>

      <DocSection title="Composition">
        <DocBulletList items={[...TASK_CARD_COMPOSITION]} />
      </DocSection>

      <DocSection title="Playground">
        <DocPreviewCard label="Interactive preview">
          <View style={docsStyles.preview}>
            <TaskCard
              transactionName="345 Diagon Alley - New"
              taskName="Earnest Money Delivery"
              dueDate={dueDate}
              status={status}
              onDateChange={setDueDate}
              onEditPress={() => undefined}
              onSkipPress={() => setStatus("skipped")}
              onDonePress={() => setStatus("done")}
              onDocumentPress={() => undefined}
              onDeletePress={() => undefined}
            />
          </View>
        </DocPreviewCard>
      </DocSection>

      <DocSection title="Props">
        <DocPropsTable rows={[...TASK_CARD_PROP_DEFINITIONS]} />
      </DocSection>

      <DocSection title="Usage example">
        <DocCodeBlock code={USAGE_EXAMPLE} />
      </DocSection>

      <DocSection title="Examples">
        <TaskCardShowcase />
      </DocSection>
    </DocScreen>
  );
}

const docsStyles = StyleSheet.create({
  preview: {
    width: "100%",
  },
});
