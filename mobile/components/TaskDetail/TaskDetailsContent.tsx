import AddressIcon from "@/assets/icons/AddressIcon";
import ClockIcon from "@/assets/icons/ClockIcon";
import DateIcon from "@/assets/icons/DateIcon";
import DescriptionIcon from "@/assets/icons/DescriptionIcon";
import { TaskCommentsList } from "@/components/TaskComments";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import BottomSheetModal from "@gorhom/bottom-sheet/lib/typescript/components/bottomSheetModal/BottomSheetModal";
import { format, parseISO } from "date-fns";
import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CalendarModal from "../CalendarModal";
import { TimePickerPopover } from "../TimePickerModal";

interface TaskForModal {
  id: string;
  taskId: string;
  title: string;
  description: string;
  address: string;
  date: string;
  time: string;
  location: string;
  isOverdue?: boolean;
  information?: string;
  isCalendarEvent?: boolean;
}

interface TaskDetailBottomSheetProps {
  task: TaskForModal;
  showAllComments: boolean;
  onClose: () => void;
  onMenuPress: () => void;
  onViewAllComments: () => void;
  onCommentSubmit?: (comment: string) => void;
  onShowFullDescription?: () => void;
  onDateChange: (date: Date) => void;
  onInformationChange: () => void;
  onTimePress?: () => void;
  onTimeChange?: (date: Date) => void;
  onNameChange?: (name: string) => void;
  onDelete?: () => void;
  events?: string[];
}

const MAX_CHARS = 120;

const TaskDetailBottomSheet: React.FC<TaskDetailBottomSheetProps> = ({
  task,
  onClose,
  onMenuPress,
  onViewAllComments,
  showAllComments,
  onShowFullDescription,
  onDateChange,
  onInformationChange,
  onTimeChange,
  onTimePress,
  onNameChange,
  onDelete,
  events,
}) => {
  const [localTitle, setLocalTitle] = useState(task.title);
  const [showTimePicker, setShowTimePicker] = React.useState(false);
  const calendarModalRef = useRef<BottomSheetModal>(null);

  useEffect(() => {
    setLocalTitle(task.title);
  }, [task.id]);

  const handleTitleChange = (text: string) => {
    setLocalTitle(text);
    onNameChange?.(text);
  };

  const handleTimePress = () => {
    setShowTimePicker(true);
    onTimePress?.();
  };

  const handleTimeSelect = (date: Date) => {
    onTimeChange?.(date);
  };

  const handleDateSelect = (date: Date) => {
    onDateChange?.(date);
    calendarModalRef.current?.dismiss();
  };

  const handleCalendarClose = () => {
    calendarModalRef.current?.dismiss();
  };

  // Approximate characters that fit in 3 lines (around 40 chars per line)
  const MAX_CHARS = 120;
  const isDescriptionTruncated =
    task.description && task.description.length > MAX_CHARS;

  return (
    <View style={styles.content}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          accessibilityLabel="close-button"
        >
          <Ionicons name="close" size={24} color={colors.gray[600]} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          {onDelete && task.isCalendarEvent && (
            <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={18} color="#B00020" />
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={onMenuPress}>
            <Text style={styles.menuDots}>•••</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.taskCard}>
        <View style={styles.taskInfo}>
          <View style={styles.taskTitleContainer}>
            <View style={styles.taskIconContainer}>
              <View
                style={[styles.taskIcon, task.isOverdue && styles.overdueIcon]}
              />
            </View>
            <TextInput
              style={styles.taskTitle}
              value={localTitle}
              editable={true}
              onChangeText={handleTitleChange}
              multiline
              accessibilityLabel="task-title-input"
            />
          </View>
          <Pressable
            onPress={onShowFullDescription}
            accessibilityLabel="show-full-description-button"
          >
            <View style={styles.descriptionContainer}>
              <DescriptionIcon />
              <View style={styles.descriptionTextContainer}>
                <Text
                  style={styles.description}
                  accessibilityLabel="description-text"
                >
                  {isDescriptionTruncated
                    ? `${task.description.substring(0, MAX_CHARS).trim()}... `
                    : task.description}
                  {isDescriptionTruncated && (
                    <Text
                      style={styles.moreButton}
                      onPress={onShowFullDescription}
                    >
                      more
                    </Text>
                  )}
                </Text>
              </View>
            </View>
          </Pressable>
        </View>
        <View style={styles.divider} />
        <View style={styles.sectionContainer}>
          <AddressIcon />
          <Text style={styles.addressText}>{task.address}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.sectionContainer}>
          <DateIcon />
          <TouchableOpacity
            style={styles.dateTimePill}
            onPress={() => calendarModalRef.current?.present()}
            accessibilityLabel="date-picker-button"
          >
            <Text style={styles.dateText}>
              {format(parseISO(task.date), "MMM dd, yyyy")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.dateTimePill}
            onPress={handleTimePress}
            accessibilityLabel="time-picker-button"
          >
            <Text style={styles.timeText}>{task.time}</Text>
          </TouchableOpacity>

          <CalendarModal
            ref={calendarModalRef}
            selectedDate={parseISO(task.date)}
            onDateSelect={handleDateSelect}
            events={events ?? []}
            onClose={handleCalendarClose}
          />

          <TimePickerPopover
            isVisible={showTimePicker}
            onClose={() => setShowTimePicker(false)}
            selectedTime={
              task.time
                ? parseISO(`${task.date.split("T")[0]}T${task.time}`)
                : new Date()
            }
            onTimeSelect={handleTimeSelect}
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.sectionContainer}>
          <ClockIcon />
          <Text style={styles.dateText}>{task.location}</Text>
        </View>
      </View>

      {/* Notes Section - Only show for regular tasks, not calendar events */}
      {!task.isCalendarEvent && (
        <Pressable
          onPress={onInformationChange}
          accessibilityLabel="information-change-button"
        >
          <View style={styles.notesCard} accessibilityLabel="notes-section">
            <TextInput
              style={styles.notesInput}
              value={task.information}
              placeholder="Add names, notes, details...or anything you might need here"
              placeholderTextColor={colors.gray[600]}
              editable={false}
              multiline
            />
          </View>
        </Pressable>
      )}

      {!task.isCalendarEvent && (
        <View
          style={styles.commentsSection}
          accessibilityLabel="comments-section"
        >
          <TaskCommentsList
            taskId={task.id}
            maxItems={showAllComments ? undefined : 3}
            showViewAll={true}
            onViewAllPress={onViewAllComments}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: colors.gray[300],
    paddingHorizontal: 12,
    gap: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[500],
    borderRadius: 100,
  },
  deleteButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FBE9E7",
    borderRadius: 100,
  },
  menuDots: {
    color: colors.gray[600],
    textAlign: "center",
    fontFamily: "Inter",
    fontSize: 16,
    fontStyle: "normal",
    fontWeight: "500",
    letterSpacing: 0.06,
  },
  taskInfo: {
    gap: 12,
  },
  taskCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 12,
  },
  taskTitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  taskIconContainer: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  taskIcon: {
    width: 20,
    height: 20,
    borderRadius: 100,
    borderWidth: 1.5,
    borderColor: colors.gray[600],
  },
  overdueIcon: {
    borderColor: colors.primary[400],
  },
  taskTitle: {
    fontSize: 20,
    fontWeight: "500",
    color: colors.gray[800],
    letterSpacing: 0.01,
    paddingVertical: 0,
    marginRight: 32,
    flex: 1,
  },
  descriptionContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  descriptionTextContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
  },
  moreButton: {
    fontSize: 16,
    color: colors.primary[400],
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray[500],
  },
  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  addressText: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
  },
  dateTimePill: {
    backgroundColor: colors.primary[300],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  dateText: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
  },
  timeText: {
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
  },
  notesCard: {
    pointerEvents: "none",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    minHeight: 160,
  },
  notesInput: {
    pointerEvents: "none",
    fontSize: 16,
    color: colors.gray[800],
    lineHeight: 24,
    fontFamily: "Inter",
    fontWeight: "400",
    flex: 1,
    textAlignVertical: "top",
  },
  commentsSection: {
    gap: 12,
  },
});

export default TaskDetailBottomSheet;
