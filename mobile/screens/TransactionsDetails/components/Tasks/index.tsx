import CalendarModal from "@/components/CalendarModal";
import { CreateTaskModal } from "@/components/CreateTaskModal";
import { TaskDetailModal } from "@/components/TaskDetail";
import TaskList from "@/components/TaskList/TaskList";
import WeekCalendar from "@/components/WeekCalendar";
import { colors } from "@/constants/colors";
import { useTaskDetailContext } from "@/contexts/TaskDetailContext";
import { useCalendar } from "@/hooks/useCalendar";
import { useGoogleCalendar } from "@/hooks/useGoogleCalendar";
import { useTaskManagement } from "@/hooks/useTasks";
import { useCalendarStore } from "@/stores/calendarStore";
import { Task } from "@/types";
import {
  filterOverdueTasks,
  filterTasksByDate,
  formatDateForAPI,
  generateEventsFromTasks,
} from "@/utils/taskUtils";
import { Ionicons } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { format } from "date-fns";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView
} from "react-native-safe-area-context";

type TaskDetailModalTask = {
  id: string;
  taskId: string;
  title: string;
  description: string;
  address: string;
  date: string;
  time: string;
  location: string;
  information: string;
  isOverdue?: boolean;
};

interface TasksProps {
  transactionId: string;
}

const Tasks: React.FC<TasksProps> = ({ transactionId }) => {
  const [showAllComments, setShowAllComments] = useState(false);
  const calendarModalRef = useRef<BottomSheetModal>(null);
  const taskDetailModalRef = useRef<BottomSheetModal>(null);
  const createTaskModalRef = useRef<BottomSheetModal>(null);
  const createTaskDatePickerRef = useRef<BottomSheetModal>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [createTaskSelectedDate, setCreateTaskSelectedDate] = useState<Date>(
    new Date()
  );
  const [selectedTask, setSelectedTask] = useState<TaskDetailModalTask | null>(
    null
  );

  const { transactionTasks, isLoading, completeTask, updateTask, refetchTransactionTasks } =
    useTaskManagement(transactionId);
  const { setTaskDetailOpen } = useTaskDetailContext();
  const { isAppleCalendarConnected, isGoogleCalendarConnected } = useCalendarStore();
  const { fetchMonthEvents } = useCalendar();
  const { fetchMonthEvents: fetchGoogleMonthEvents } = useGoogleCalendar();

  const handleCalendarEventCreated = useCallback(() => {
    if (isAppleCalendarConnected) {
      fetchMonthEvents();
    }
    if (isGoogleCalendarConnected) {
      fetchGoogleMonthEvents();
    }
  }, [isAppleCalendarConnected, fetchMonthEvents, isGoogleCalendarConnected, fetchGoogleMonthEvents]);

  const handlePresentModalPress = useCallback(() => {
    calendarModalRef.current?.present();
  }, []);

  const handleCloseCalendarModal = useCallback(() => {
    calendarModalRef.current?.dismiss();
  }, []);

  const tasks = useMemo(() => {
    if (!transactionTasks) return [];
    return transactionTasks;
  }, [transactionTasks]);

  const events = useMemo(() => {
    return generateEventsFromTasks(tasks);
  }, [tasks]);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    return filterTasksByDate(tasks, selectedDate);
  }, [tasks, selectedDate]);

  const overdueTasks = useMemo(() => {
    return filterOverdueTasks(tasks);
  }, [tasks]);

  const { incompleteTasks, completedTasks } = useMemo(() => {
    const incomplete = [
      ...overdueTasks,
      ...selectedDateTasks.filter(
        (task: Task) =>
          !task.completed &&
          !overdueTasks.some((overdue) => overdue.id === task.id)
      ),
    ];
    const completed = tasks.filter((task: Task) => task.completed);

    return { incompleteTasks: incomplete, completedTasks: completed };
  }, [selectedDateTasks, overdueTasks, tasks]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCreateTaskSelectedDate(date);
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      completeTask(taskId);
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const handleTaskUndo = async (taskId: string) => {
    try {
      updateTask({ taskId, updates: { completed: false }, transactionId });
    } catch (error) {
      console.error("Failed to undo task:", error);
    }
  };

  const handleTaskPress = (taskId: string) => {
    const allTasks = [...incompleteTasks, ...completedTasks];
    const task = allTasks.find((t) => t.id === taskId);
    if (task) {
      let formattedTime = "";
      const dateStr = task.dueDate || "";
      if (dateStr) {
        let date: Date;
        if (dateStr.includes("T")) {
          const dateOnly = dateStr.split("T")[0];
          date = new Date(dateOnly + "T00:00:00");
        } else {
          date = new Date(dateStr + "T00:00:00");
        }
        formattedTime = format(date, "HH:mm");
      }

      const taskForModal: TaskDetailModalTask = {
        id: task.id,
        taskId: task.id,
        title: task.name,
        description: task.description || "",
        address: task.address || "Property Address",
        date: task.dueDate || "",
        time: formattedTime,
        location: "Property Location",
        isOverdue: task.status === "PAST_DUE",
        information: task.information || "",
      };
      setSelectedTask(taskForModal);
      setTaskDetailOpen(true, task.id);
      taskDetailModalRef.current?.present();
    }
  };

  const handleCloseTaskDetail = () => {
    taskDetailModalRef.current?.dismiss();
    setTaskDetailOpen(false);
    setSelectedTask(null);
    setShowAllComments(false); // Reset showAllComments when modal closes
  };

  const handleMenuPress = () => { };

  const handleViewAllComments = () => { 
    setShowAllComments(prev => !prev);
  };

  const handleCommentSubmit = (comment: string) => { };

  const handleCreateTaskSuccess = () => {
    createTaskModalRef.current?.dismiss();
    // Explicitly refetch transaction tasks to ensure new task appears
    refetchTransactionTasks();
  };

  const handleCloseCreateTaskModal = () => {
    setCreateTaskSelectedDate(new Date());
    createTaskModalRef.current?.dismiss();
  };

  const handleOpenCreateTaskDatePicker = () => {
    createTaskModalRef.current?.dismiss();
    setTimeout(() => {
      createTaskDatePickerRef.current?.present();
    }, 100);
  };

  const handleCreateTaskDateSelect = (date: Date) => {
    setCreateTaskSelectedDate(date);
    setSelectedDate(date);
    createTaskDatePickerRef.current?.dismiss();
    setTimeout(() => {
      createTaskModalRef.current?.present();
    }, 100);
  };

  const handleEditTaskDateSelect = (date: Date) => {
    if (selectedTask) {
      try {
        updateTask({
          taskId: selectedTask.id,
          updates: { dueDate: formatDateForAPI(date) },
          transactionId,
        });
      } catch (error) {
        console.error("Failed to update task date:", error);
      }
      setSelectedTask({
        ...selectedTask,
        date: formatDateForAPI(date),
      });
    }
  };

  const handleInformationSave = (information: string) => {
    if (selectedTask) {
      try {
        updateTask({
          taskId: selectedTask.id,
          updates: { information },
          transactionId,
        });
      } catch (error) {
        console.error("Failed to update task information:", error);
      }
      setSelectedTask({
        ...selectedTask,
        information,
      });
    }
  };

  const handleDescriptionSave = (description: string) => {
    console.log("Description to save:", description);
    if (selectedTask) {
      try {
        updateTask({
          taskId: selectedTask.id,
          updates: { description },
          transactionId,
        });
      } catch (error) {
        console.error("Failed to update task description:", error);
      }
      setSelectedTask({
        ...selectedTask,
        description,
      });
    }
  };

  const handleEditTaskTimeSelect = (time: Date) => {
    if (selectedTask) {
      const dateStr = selectedTask.date;
      let date: Date;
      if (dateStr.includes("T")) {
        const dateOnly = dateStr.split("T")[0];
        date = new Date(dateOnly + "T00:00:00");
      } else {
        date = new Date(dateStr + "T00:00:00");
      }

      date.setHours(time.getHours());
      date.setMinutes(time.getMinutes());

      try {
        updateTask({
          taskId: selectedTask.id,
          updates: { dueDate: format(date, "yyyy-MM-dd'T'HH:mm:ss") },
          transactionId,
        });
      } catch (error) {
        console.error("Failed to update task time:", error);
      }

      setSelectedTask((prev: any) =>
        prev
          ? {
            ...prev,
            time: format(date, "HH:mm"),
          }
          : null
      );
    }
  };

  const handleNameChange = (name: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    const taskId = selectedTask?.id;

    timerRef.current = setTimeout(async () => {
      if (taskId) {
        console.log(name)
        try {
          updateTask({
            taskId: taskId,
            updates: { name: name },
            transactionId,
          });
          setSelectedTask((prev: any) =>
            prev ? { ...prev, title: name } : null
          );
        } catch (error) {
          console.error("Failed to update task name:", error);
        }
      }
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <SafeAreaView
        edges={["left", "right", "bottom"]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading tasks...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.weekCalendarContainer}>
          <WeekCalendar
            handleToday={handlePresentModalPress}
            selectedDate={selectedDate || undefined}
            onDateSelect={handleDateSelect}
            events={events}
            showEventDots={true}
            showTodayButton={true}
          />
        </View>

        <View style={styles.taskListContainer}>
          <View style={styles.taskListHeader}>
            <Text style={styles.taskListHeaderTitle}>Tasks</Text>
            <TouchableOpacity
              style={styles.addTaskButton}
              onPress={() => createTaskModalRef.current?.present()}
            >
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <TaskList
            inCompleteTasks={incompleteTasks}
            completedTasks={completedTasks}
            onTaskComplete={handleTaskComplete}
            onTaskUndo={handleTaskUndo}
            onTaskPress={handleTaskPress}
            topSectionTitle="Active Tasks"
            bottomSectionTitle="Completed Tasks"
          />
        </View>

        <CalendarModal
          ref={calendarModalRef}
          selectedDate={selectedDate || new Date()}
          onDateSelect={handleDateSelect}
          events={events}
          onClose={handleCloseCalendarModal}
        />

        <TaskDetailModal
          ref={taskDetailModalRef}
          task={selectedTask}
          showAllComments={showAllComments}
          onClose={handleCloseTaskDetail}
          onMenuPress={handleMenuPress}
          onViewAllComments={handleViewAllComments}
          onCommentSubmit={handleCommentSubmit}
          onDateChange={handleEditTaskDateSelect}
          onInformationSave={handleInformationSave}
          onDescriptionSave={handleDescriptionSave}
          onTimeChange={handleEditTaskTimeSelect}
          onNameChange={handleNameChange}
          events={events}
        />

        <CreateTaskModal
          ref={createTaskModalRef}
          transactionId={transactionId}
          onSuccess={handleCreateTaskSuccess}
          onClose={handleCloseCreateTaskModal}
          onDatePickerOpen={handleOpenCreateTaskDatePicker}
          selectedDate={createTaskSelectedDate}
          onCalendarEventCreated={handleCalendarEventCreated}
        />

        <CalendarModal
          ref={createTaskDatePickerRef}
          selectedDate={createTaskSelectedDate}
          onDateSelect={handleCreateTaskDateSelect}
          events={events}
          onClose={() => createTaskDatePickerRef.current?.dismiss()}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[200],
  },
  scrollContent: {
    paddingVertical: 12,
    minHeight: "100%"
  },
  weekCalendarContainer: {
    gap: 16,
  },
  taskListContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  taskListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  taskListHeaderTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.gray[800],
  },
  addTaskButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary[400],
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  noTasksForDateContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    marginTop: 16,
  },
  noTasksForDateTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
    color: colors.gray[800],
    letterSpacing: 0.08,
    marginBottom: 8,
    textAlign: "center",
  },
  noTasksForDateMessage: {
    fontFamily: "Inter",
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
    color: colors.gray[600],
    letterSpacing: 0.07,
    textAlign: "center",
    maxWidth: 280,
  },
});

export default Tasks;
