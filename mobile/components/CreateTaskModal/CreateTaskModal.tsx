import Button from "@/components/Button/Button";
import FormTextInput from "@/components/FormTextInput/FormTextInput";
import { colors } from "@/constants/colors";
import { useCalendar } from "@/hooks/useCalendar";
import { useCreateTask } from "@/hooks/useTasks";
import { addGoogleCalendarEvent } from "@/services/googleCalendarService";
import { useCalendarStore } from "@/stores/calendarStore";
import { TaskFormData } from "@/types/task";
import { Ionicons } from "@expo/vector-icons";
import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import React, { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface CreateTaskModalProps {
  transactionId: string;
  onSuccess?: () => void;
  onClose?: () => void;
  onDatePickerOpen?: () => void;
  selectedDate?: Date;
  onCalendarEventCreated?: () => void;
}

type TaskFormInputs = {
  name: string;
  description: string;
  information: string;
  dueDate: Date;
  type: "TASK" | "FORM";
};

type SaveDestination = "app" | "apple_calendar" | "google_calendar";

const CreateTaskModal = forwardRef<BottomSheetModal, CreateTaskModalProps>(
  (
    { transactionId, onSuccess, onClose, onDatePickerOpen, selectedDate, onCalendarEventCreated },
    ref
  ) => {
    const snapPoints = ["80%"];
    const { bottom } = useSafeAreaInsets();
    const { mutate: createTask, isPending } = useCreateTask();
    const { isAppleCalendarConnected, isGoogleCalendarConnected } = useCalendarStore();
    const { createCalendarEvent, isLoading: isCalendarLoading } = useCalendar();
    const [saveDestination, setSaveDestination] = useState<SaveDestination>("app");
    const [isCreatingCalendarEvent, setIsCreatingCalendarEvent] = useState(false);
    const [selectedDateState, setSelectedDateState] = useState<Date | undefined>(selectedDate);
    const isOpeningCalendarRef = useRef(false);
    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
      setValue,
      watch,
    } = useForm<TaskFormInputs>({
      defaultValues: {
        name: "",
        description: "",
        information: "",
        dueDate: selectedDate || new Date(),
        type: "TASK",
      },
      mode: "onChange",
    });

    const watchedDueDate = watch("dueDate");
    const watchedType = watch("type");

    // Update form when selectedDate prop changes (from parent)
    useEffect(() => {
      if (selectedDate) {
        setValue("dueDate", selectedDate, { shouldValidate: true });
        setSelectedDateState(selectedDate);
      }
    }, [selectedDate, setValue]);

    const resetForm = useCallback(() => {
      reset();
      setValue("dueDate", new Date());
      setValue("type", "TASK");
      setSaveDestination("app");
      setSelectedDateState(undefined);
    }, [reset, setValue]);

    const handleSheetChanges = useCallback(
      (index: number) => {
        if (index === -1) {
          // Don't reset if we're opening the calendar modal
          if (!isOpeningCalendarRef.current) {
            resetForm();
          }
          isOpeningCalendarRef.current = false;
          onClose?.();
        }
      },
      [onClose, resetForm]
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

    const onSubmit: SubmitHandler<TaskFormInputs> = async (data) => {
      // Validate due date
      if (!data.dueDate || !(data.dueDate instanceof Date)) {
        return;
      }

      if (saveDestination === "apple_calendar" || saveDestination === "google_calendar") {
        setIsCreatingCalendarEvent(true);
        try {
          let eventId: string | null = null;

          if (saveDestination === "apple_calendar") {
            eventId = await createCalendarEvent({
              title: data.name,
              date: data.dueDate,
              description: data.description || "",
            });
          } else if (saveDestination === "google_calendar") {
            const startDate = new Date(data.dueDate);
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);

            eventId = await addGoogleCalendarEvent({
              title: data.name,
              startDate,
              endDate,
              notes: data.description || "",
              location: data.information || "",
            });
          }

          if (eventId) {
            reset();
            setValue("dueDate", new Date());
            setValue("type", "TASK");
            setSaveDestination("app");
            onCalendarEventCreated?.();
            onSuccess?.();
            onClose?.();
          } else {
            Alert.alert(
              "Error",
              saveDestination === "google_calendar"
                ? "Failed to create calendar event. The task may sync to Google Calendar shortly."
                : "Failed to create calendar event."
            );
          }
        } catch (error: any) {
          Alert.alert(
            "Error",
            error?.response?.data?.message ||
            "Failed to create calendar event. Please try again."
          );
        } finally {
          setIsCreatingCalendarEvent(false);
        }
      } else {
        const taskFormData: TaskFormData = {
          name: data.name,
          description: data.description || "",
          information: data.information || "",
          dueDate: data.dueDate,
          type: data.type,
          transactionId,
        };

        createTask(taskFormData, {
          onSuccess: () => {
            reset();
            setValue("dueDate", new Date());
            setValue("type", "TASK");
            setSaveDestination("app");
            onSuccess?.();
            onClose?.();
          },
          onError: (error) => {
            // Silent fail - error handled by mutation
          },
        });
      }
    };

    const formatDateForDisplay = (date: Date): string => {
      return format(date, "MMM dd, yyyy");
    };

    const handleDatePress = useCallback(() => {
      isOpeningCalendarRef.current = true;
      setSelectedDateState(undefined);
      onDatePickerOpen?.();
    }, [onDatePickerOpen]);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
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
          contentContainerStyle={{
            flex: 1,
            paddingBottom: bottom,
            paddingHorizontal: 16,
          }}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Task</Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  onClose?.();
                }}
                style={styles.closeButton}
                accessibilityLabel="close-modal"
              >
                <Ionicons name="close" size={24} color={colors.gray[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              {/* Task Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Task Name *</Text>
                <FormTextInput
                  name="name"
                  control={control}
                  rules={{
                    required: "Task name is required",
                    minLength: {
                      value: 1,
                      message: "Task name cannot be empty",
                    },
                    maxLength: {
                      value: 50,
                      message: "Task name cannot be more than 50 characters",
                    },
                  }}
                  placeholder="Enter task name"
                  placeholderTextColor={colors.gray[500]}
                  style={[styles.input, errors.name && styles.inputError]}
                  accessibilityLabel="task-name-input"
                />
                {errors.name && (
                  <Text style={styles.errorText}>
                    {errors.name.message as string}
                  </Text>
                )}
              </View>

              {/* Description */}
              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <FormTextInput
                  name="description"
                  control={control}
                  placeholder="Enter task description"
                  rules={{
                    maxLength: {
                      value: 250,
                      message: "Description cannot be more than 250 characters",
                    },
                  }}
                  placeholderTextColor={colors.gray[500]}
                  style={[styles.textAreaInput, errors.description && styles.inputError]}
                  multiline
                  accessibilityLabel="task-description-input"
                />
                {errors.description && (
                  <Text style={styles.errorText}>
                    {errors.description.message as string}
                  </Text>
                )}
              </View>

              {/* Information - Hide when saving to calendar */}
              {saveDestination === "app" && (
                <View style={styles.field}>
                  <Text style={styles.label}>Additional Information</Text>
                  <FormTextInput
                    name="information"
                    control={control}
                    placeholder="Enter any additional information"
                    rules={{
                      maxLength: {
                        value: 250,
                        message: "Additional information cannot be more than 250 characters",
                      },
                    }}
                    placeholderTextColor={colors.gray[500]}
                    style={[styles.textAreaInput, errors.information && styles.inputError]}
                    multiline
                    accessibilityLabel="task-information-input"
                  />
                  {errors.information && (
                    <Text style={styles.errorText}>
                      {errors.information.message as string}
                    </Text>
                  )}
                </View>
              )}

              {/* Due Date */}
              <View style={styles.field}>
                <Text style={styles.label}>Due Date *</Text>
                <TouchableOpacity
                  style={[
                    styles.input,
                    styles.dateInput,
                    errors.dueDate && styles.inputError,
                  ]}
                  onPress={handleDatePress}
                  accessibilityLabel="due-date-input"
                >
                  <Text
                    style={[
                      styles.dateText,
                      !watchedDueDate && styles.placeholderText,
                    ]}
                    accessibilityLabel="due-date-text"
                  >
                    {selectedDateState
                      ? formatDateForDisplay(selectedDateState)
                      : watchedDueDate
                        ? formatDateForDisplay(watchedDueDate)
                        : "Select due date"}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={colors.gray[600]}
                  />
                </TouchableOpacity>
                {errors.dueDate && (
                  <Text style={styles.errorText}>
                    {errors.dueDate.message as string}
                  </Text>
                )}
              </View>

              {/* Task Type */}
              <View style={styles.field}>
                <Text style={styles.label}>Task Type</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      watchedType === "TASK" && styles.typeButtonActive,
                    ]}
                    onPress={() => setValue("type", "TASK")}
                    accessibilityLabel="task-type-button"
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        watchedType === "TASK" && styles.typeButtonTextActive,
                      ]}
                    >
                      Task
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      watchedType === "FORM" && styles.typeButtonActive,
                    ]}
                    onPress={() => setValue("type", "FORM")}
                    accessibilityLabel="form-type-button"
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        watchedType === "FORM" && styles.typeButtonTextActive,
                      ]}
                    >
                      Form
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.field} accessibilityLabel="save-to-section">
                <Text style={styles.label}>Save To</Text>
                <View style={styles.typeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      saveDestination === "app" && styles.typeButtonActive,
                    ]}
                    onPress={() => setSaveDestination("app")}
                    accessibilityLabel="app-save-button"
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        saveDestination === "app" &&
                        styles.typeButtonTextActive,
                      ]}
                    >
                      App
                    </Text>
                  </TouchableOpacity>
                  {isAppleCalendarConnected && (
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        saveDestination === "apple_calendar" &&
                        styles.typeButtonActive,
                      ]}
                      onPress={() => setSaveDestination("apple_calendar")}
                      accessibilityLabel="apple-calendar-save-button"
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          saveDestination === "apple_calendar" &&
                          styles.typeButtonTextActive,
                        ]}
                      >
                        Apple Calendar
                      </Text>
                    </TouchableOpacity>
                  )}
                  {isGoogleCalendarConnected && (
                    <TouchableOpacity
                      style={[
                        styles.typeButton,
                        saveDestination === "google_calendar" &&
                        styles.typeButtonActive,
                      ]}
                      onPress={() => setSaveDestination("google_calendar")}
                      accessibilityLabel="google-calendar-save-button"
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          saveDestination === "google_calendar" &&
                          styles.typeButtonTextActive,
                        ]}
                      >
                        Google Calendar
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              {/* Submit Button */}
              <Button
                text={
                  isPending || isCalendarLoading || isCreatingCalendarEvent
                    ? "Creating..."
                    : "Create Task"
                }
                onPress={handleSubmit(onSubmit)}
                disabled={
                  isPending || isCalendarLoading || isCreatingCalendarEvent
                }
                variant="black"
                icon={
                  isPending || isCalendarLoading ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : undefined
                }
                style={styles.submitButton}
                accessibilityLabel="create-task-button"
              />
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

CreateTaskModal.displayName = "CreateTaskModal";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[300],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.gray[800],
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[500],
    borderRadius: 18,
  },
  form: {
    gap: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[800],
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.gray[300],
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.primary[400],
  },
  textAreaInput: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    paddingTop: 16,
    paddingBottom: 16,
    fontSize: 16,
    color: colors.gray[800],
    borderWidth: 1,
    borderColor: colors.gray[300],
    height: 100,
  },
  dateInput: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 16,
    color: colors.gray[800],
  },
  placeholderText: {
    color: colors.gray[500],
  },
  errorText: {
    fontSize: 14,
    color: colors.primary[400],
    marginTop: 4,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
  },
  typeButtonActive: {
    backgroundColor: colors.primary[400],
    borderColor: colors.primary[400],
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.gray[800],
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  submitButton: {
    marginTop: 8,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.gray[800],
  },
});

export default CreateTaskModal;
