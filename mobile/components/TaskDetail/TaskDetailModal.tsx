import { colors } from "@/constants/colors";
import { useTaskDetailContext } from "@/contexts/TaskDetailContext";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import TaskBottomPopupModal from "../TaskBottomPopup/TaskBottomPopupModal";
import TaskDetailsContent from "./TaskDetailsContent";

interface TaskDetailModalProps {
  task: {
    id: string;
    taskId: string;
    title: string;
    information?: string;
    description: string;
    address: string;
    date: string;
    time: string;
    location: string;
    isOverdue?: boolean;
    isCalendarEvent?: boolean;
  } | null;
  showAllComments: boolean;
  onClose: () => void;
  onMenuPress: () => void;
  onViewAllComments: () => void;
  onCommentSubmit?: (comment: string) => void; // Optional - comment submission is handled internally
  onDescriptionSave: (description: string) => void;
  onDateChange: (date: Date) => void;
  onInformationSave: (information: string) => void;
  onTimePress?: () => void;
  onTimeChange?: (date: Date) => void;
  onNameChange?: (name: string) => void;
  onDelete?: () => void; // Temporary test button
  events?: string[];
}

const TaskDetailModal = forwardRef<BottomSheetModal, TaskDetailModalProps>(
  ({
    task,
    showAllComments,
    onClose,
    onMenuPress,
    onViewAllComments,
    onCommentSubmit,
    onDescriptionSave,
    onDateChange,
    onInformationSave,
    onTimePress,
    onTimeChange,
    onNameChange,
    onDelete,
    events
  }, ref) => {
    const snapPoints = ["25%", "70%", "90%"];
    const { bottom } = useSafeAreaInsets();
    const { setTaskDetailOpen } = useTaskDetailContext();
    const descriptionSheetRef = useRef<BottomSheetModal>(null);
    const informationSheetRef = useRef<BottomSheetModal>(null);

    const [editedDescription, setEditedDescription] = useState(task?.description || "");
    const [isDescriptionEditing, setIsDescriptionEditing] = useState(false);

    const [editedInformation, setEditedInformation] = useState(task?.information || "");
    const [isInformationEditing, setIsInformationEditing] = useState(false);

    // Reset state when task changes or sheet opens
    useEffect(() => {
      setEditedDescription(task?.description || "");
      setIsDescriptionEditing(false);
      setEditedInformation(task?.information || "");
      setIsInformationEditing(false);
    }, [task?.description, task?.information]);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          setTaskDetailOpen(false);
        }
      },
      [setTaskDetailOpen]
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.12}
          style={styles.backdrop}
        />
      ),
      []
    );

    const renderTaskPopupBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const openDescriptionSheet = useCallback(() => {
      setEditedDescription(task?.description || "");
      setIsDescriptionEditing(false);
      descriptionSheetRef.current?.present();
    }, [task?.description]);

    const handleDescriptionChange = useCallback(
      (text: string) => {
        setEditedDescription(text);
        if (!isDescriptionEditing) {
          setIsDescriptionEditing(true);
        }
      },
      [isDescriptionEditing]
    );

    const handleDescriptionCancel = useCallback(() => {
      setEditedDescription(task?.description || "");
      setIsDescriptionEditing(false);
    }, [task?.description]);

    const handleDescriptionSave = useCallback(() => {
      onDescriptionSave?.(editedDescription);
      setIsDescriptionEditing(false);
      descriptionSheetRef.current?.dismiss();
    }, [editedDescription, onDescriptionSave]);

    const handleDescriptionDone = useCallback(() => {
      descriptionSheetRef.current?.dismiss();
    }, []);

    const openInformationSheet = useCallback(() => {
      setEditedInformation(task?.information || "");
      setIsInformationEditing(false);
      informationSheetRef.current?.present();
    }, [task?.information]);

    const handleInformationChange = useCallback(
      (text: string) => {
        setEditedInformation(text);
        if (!isInformationEditing) {
          setIsInformationEditing(true);
        }
      },
      [isInformationEditing]
    );

    const handleInformationCancel = useCallback(() => {
      setEditedInformation(task?.information || "");
      setIsInformationEditing(false);
    }, [task?.information]);

    const handleInformationSave = useCallback(() => {
      onInformationSave?.(editedInformation);
      setIsInformationEditing(false);
      informationSheetRef.current?.dismiss();
    }, [editedInformation, onInformationSave]);

    const handleInformationDone = useCallback(() => {
      informationSheetRef.current?.dismiss();
    }, []);

    return (
      <>
        <BottomSheetModal
          ref={ref}
          index={1}
          snapPoints={snapPoints}
          onChange={handleSheetChanges}
          backdropComponent={renderBackdrop}
          backgroundStyle={{ backgroundColor: colors.gray[300] }}
          handleIndicatorStyle={{
            backgroundColor: colors.gray[500],
            width: 44,
            height: 4,
            borderRadius: 4,
          }}
        >
          <BottomSheetScrollView
            contentContainerStyle={{ paddingBottom: bottom }}
          >
            {task && (
              <TaskDetailsContent
                task={task}
                onClose={onClose}
                onMenuPress={onMenuPress}
                showAllComments={showAllComments}
                onViewAllComments={onViewAllComments}
                onCommentSubmit={onCommentSubmit}
                onShowFullDescription={openDescriptionSheet}
                onDateChange={onDateChange}
                onInformationChange={openInformationSheet}
                onTimePress={onTimePress}
                onTimeChange={onTimeChange}
                onNameChange={onNameChange}
                onDelete={onDelete}
                events={events}
              />
            )}
          </BottomSheetScrollView>
        </BottomSheetModal>

        {/* Description Bottom Sheet */}
        <TaskBottomPopupModal
          task={task}
          showIcon
          ref={descriptionSheetRef}
          placeholder="Add a description..."
          handleCancel={handleDescriptionCancel}
          handleDone={handleDescriptionDone}
          handleContentChange={handleDescriptionChange}
          isEditing={isDescriptionEditing}
          editedContent={editedDescription}
          handleSave={handleDescriptionSave}
          renderBackdrop={renderTaskPopupBackdrop}
        />

        <TaskBottomPopupModal
          task={task}
          ref={informationSheetRef}
          placeholder="Add names, notes, details...or anything you might need here"
          handleCancel={handleInformationCancel}
          handleDone={handleInformationDone}
          handleContentChange={handleInformationChange}
          isEditing={isInformationEditing}
          editedContent={editedInformation}
          handleSave={handleInformationSave}
          renderBackdrop={renderTaskPopupBackdrop}
        />
      </>
    );
  }
);

TaskDetailModal.displayName = "TaskDetailModal";

const styles = StyleSheet.create({
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray[800],
  },
  descriptionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[300],
  },
  headerButtonContainer: {
    width: 60,
    alignItems: "center",
  },
  descriptionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.gray[800],
    textAlign: "center",
  },
  cancelButton: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary[400],
  },
  doneButton: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary[400],
  },
  descriptionContent: {
    padding: 16,
    flexGrow: 1,
  },
  descriptionInputContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  descriptionIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  descriptionInputWrapper: {
    width: "100%",
    paddingRight: 32,
  },
  descriptionInput: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
    minHeight: 200,
    paddingTop: 0,
  },
});

export default TaskDetailModal;
