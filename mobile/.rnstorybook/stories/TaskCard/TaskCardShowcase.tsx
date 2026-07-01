import React, { useState } from "react";
import { StyleSheet, View } from "react-native";

import { TaskCard } from "@/components/TaskCard";

import {
  GalleryItem,
  GalleryScreen,
  GallerySection,
} from "../../components/StoryGalleryLayout";

const SAMPLE_DATE = new Date(2026, 5, 15);

const LONG_TASK_NAME =
  "Coordinate earnest money delivery with title company and confirm receipt before closing deadline";

function InteractiveTaskCard({
  initialDueDate,
  initialStatus = "pending" as const,
}: {
  initialDueDate?: Date | null;
  initialStatus?: "pending" | "done" | "skipped";
}) {
  const [dueDate, setDueDate] = useState<Date | null | undefined>(initialDueDate);
  const [status, setStatus] = useState(initialStatus);

  return (
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
  );
}

export type TaskCardShowcaseSection =
  | "all"
  | "pending"
  | "done"
  | "skipped"
  | "withDate"
  | "withoutDate"
  | "longTaskName"
  | "multipleCards";

export function TaskCardShowcase({
  section = "all",
}: {
  section?: TaskCardShowcaseSection;
}) {
  const show = (name: Exclude<TaskCardShowcaseSection, "all">) =>
    section === "all" || section === name;

  return (
    <GalleryScreen>
      {show("pending") ? (
        <GallerySection title="Pending task">
          <GalleryItem label="Default pending state" wide>
            <InteractiveTaskCard initialDueDate={SAMPLE_DATE} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("done") ? (
        <GallerySection title="Done task">
          <GalleryItem label="Completed task" wide>
            <TaskCard
              transactionName="345 Diagon Alley - New"
              taskName="Earnest Money Delivery"
              dueDate={SAMPLE_DATE}
              status="done"
              onDateChange={() => undefined}
              onEditPress={() => undefined}
              onSkipPress={() => undefined}
              onDonePress={() => undefined}
              onDocumentPress={() => undefined}
              onDeletePress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("skipped") ? (
        <GallerySection title="Skipped task">
          <GalleryItem label="Skipped state" wide>
            <TaskCard
              transactionName="345 Diagon Alley - New"
              taskName="Earnest Money Delivery"
              dueDate={SAMPLE_DATE}
              status="skipped"
              onDateChange={() => undefined}
              onEditPress={() => undefined}
              onSkipPress={() => undefined}
              onDonePress={() => undefined}
              onDocumentPress={() => undefined}
              onDeletePress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("withDate") ? (
        <GallerySection title="With date">
          <GalleryItem label="Due date selected" wide>
            <InteractiveTaskCard initialDueDate={SAMPLE_DATE} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("withoutDate") ? (
        <GallerySection title="Without date">
          <GalleryItem label="No due date selected" wide>
            <InteractiveTaskCard initialDueDate={null} />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("longTaskName") ? (
        <GallerySection title="Long task name">
          <GalleryItem label="Wrapping task title" wide>
            <TaskCard
              transactionName="345 Diagon Alley - New Purchase With Extended Closing Contingencies"
              taskName={LONG_TASK_NAME}
              dueDate={SAMPLE_DATE}
              onDateChange={() => undefined}
              onEditPress={() => undefined}
              onSkipPress={() => undefined}
              onDonePress={() => undefined}
              onDocumentPress={() => undefined}
              onDeletePress={() => undefined}
            />
          </GalleryItem>
        </GallerySection>
      ) : null}

      {show("multipleCards") ? (
        <GallerySection title="Multiple cards">
          <GalleryItem label="Task list usage" wide>
            <View style={styles.stack}>
              <InteractiveTaskCard initialDueDate={SAMPLE_DATE} />
              <TaskCard
                transactionName="742 Evergreen Terrace - Pending"
                taskName="Order Home Inspection"
                dueDate={new Date(2026, 5, 20)}
                status="done"
                onDateChange={() => undefined}
                onEditPress={() => undefined}
                onSkipPress={() => undefined}
                onDonePress={() => undefined}
                onDocumentPress={() => undefined}
                onDeletePress={() => undefined}
              />
              <TaskCard
                transactionName="221B Baker Street - Closed"
                taskName="Send Closing Disclosure"
                status="skipped"
                onDateChange={() => undefined}
                onEditPress={() => undefined}
                onSkipPress={() => undefined}
                onDonePress={() => undefined}
                onDocumentPress={() => undefined}
                onDeletePress={() => undefined}
              />
            </View>
          </GalleryItem>
        </GallerySection>
      ) : null}
    </GalleryScreen>
  );
}

const styles = StyleSheet.create({
  stack: {
    width: "100%",
    gap: 16,
  },
});
