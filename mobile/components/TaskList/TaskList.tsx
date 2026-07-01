import { colors } from "@/constants/colors";
import { Task } from "@/types/task";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import TaskItem from "./TaskItem/TaskItem";

interface TaskListProps {
  overdueTasks?: Task[];
  todayTasks?: Task[];
  inCompleteTasks?: Task[];
  onTaskPress?: (taskId: string) => void;
  completedTasks?: Task[];
  onTaskComplete?: (taskId: string) => void;
  onTaskUndo?: (taskId: string) => void;
  topSectionTitle?: string;
  bottomSectionTitle?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  overdueTasks = [],
  todayTasks = [],
  completedTasks = [],
  inCompleteTasks = [],
  onTaskComplete = () => { },
  onTaskUndo = () => { },
  onTaskPress = () => { },
  topSectionTitle = "Overdue",
  bottomSectionTitle = "Today",
}) => {
  // Check if there are any tasks at all
  const hasAnyTasks =
    overdueTasks.length > 0 ||
    todayTasks.length > 0 ||
    inCompleteTasks.length > 0;
    // SUBI_BUGBOARD - Uncomment to see completed tasks
    // completedTasks.length > 0

  // Show empty state if no tasks exist
  if (!hasAnyTasks) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconContainer}>
          <Ionicons
            name="checkmark-circle-outline"
            size={48}
            color={colors.gray[400]}
          />
        </View>
        <Text style={styles.emptyTitle}>No tasks yet</Text>
        <Text style={styles.emptyMessage}>
          This transaction doesn't have any tasks for the current date. Add some
          tasks to get started!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {overdueTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{topSectionTitle}</Text>
          </View>
          <View style={styles.taskList}>
            {overdueTasks.map((task) => {
              // All tasks in overdueTasks are already filtered by date comparison,
              // so we pass isOverdue={true} for orange styling regardless of task.status
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  address={task.address || "Property Address"}
                  isOverdue={true}
                  onTaskPress={onTaskPress}
                  onIconPress={() => { }}
                  onTaskComplete={onTaskComplete}
                  onTaskUndo={onTaskUndo}
                />
              );
            })}
          </View>
        </View>
      )}

      {/* Today Section */}
      {todayTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{bottomSectionTitle}</Text>
          </View>
          <View style={styles.taskList}>
            {todayTasks.map((task) => {
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  address={task.address || "Property Address"}
                  onTaskPress={onTaskPress}
                  onTaskComplete={onTaskComplete}
                  onTaskUndo={onTaskUndo}
                  onIconPress={() => { }}
                />
              );
            })}
          </View>
        </View>
      )}
      {inCompleteTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{topSectionTitle}</Text>
          </View>
          <View style={styles.taskList}>
            {inCompleteTasks.map((task) => {
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  address={task.address || "Property Address"}
                  onTaskPress={onTaskPress}
                  onTaskComplete={onTaskComplete}
                  onTaskUndo={onTaskUndo}
                  onIconPress={() => { }}
                />
              );
            })}
          </View>
        </View>
      )}
      {/* SUBI_BUGBOARD - Uncomment to see completed tasks */}
      {/* {completedTasks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{bottomSectionTitle}</Text>
          </View>
          <View style={styles.taskList}>
            {completedTasks.map((task) => {
              return (
                <TaskItem
                  key={task.id}
                  task={task}
                  address={task.address || "Property Address"}
                  onTaskPress={onTaskPress}
                  onTaskComplete={onTaskComplete}
                  onTaskUndo={onTaskUndo}
                  onIconPress={() => { }}
                />
              );
            })}
          </View>
        </View>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
  },
  section: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    width: "100%",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    width: "100%",
  },
  sectionTitle: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "500",
    lineHeight: 24,
    color: colors.gray[800],
    letterSpacing: 0.08,
  },
  taskList: {
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 12,
    width: "100%",
  },
  emptyContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    paddingHorizontal: 24,
    width: "100%",
  },
  emptyIconContainer: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "Inter",
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
    color: colors.gray[800],
    letterSpacing: 0.09,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyMessage: {
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

export default TaskList;
