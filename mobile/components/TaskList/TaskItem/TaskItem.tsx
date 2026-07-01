import Check from "@/assets/icons/Check";
import { colors } from "@/constants/colors";
import { Task } from "@/types";
import { format, parseISO } from "date-fns";
import React from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
interface TaskItemProps {
  onIconPress: () => void;
  task: Task;
  address: string;
  isOverdue?: boolean;
  onTaskPress: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskUndo: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  address,
  isOverdue = false,
  onTaskComplete,
  onTaskPress,
  onTaskUndo,
}) => {
  const { id, name, dueDate, completed } = task;
  const formattedDueDate = format(parseISO(dueDate || ""), "MMM dd");

  // Local state for completion animation
  const [isCompleting, setIsCompleting] = React.useState(false);
  const [showCompleted, setShowCompleted] = React.useState(completed);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  // Update local completed state when task completed prop changes
  React.useEffect(() => {
    setShowCompleted(completed);
  }, [completed]);

  const handleToggleComplete = () => {
    if (!completed && !isCompleting) {
      setIsCompleting(true);
      setShowCompleted(true);
      onTaskComplete(id);
      Toast.show({
        type: "taskSuccess",
        text1: "Completed!🎉",
        text2: "Undo",
        position: "bottom",
        props: {
          id,
          undoAction: () => {
            setIsCompleting(false);
            setShowCompleted(false);
            onTaskUndo(id);
            Toast.hide();
          },
        },
      });

      Animated.timing(fadeAnim, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }).start();

      setTimeout(() => {
        setIsCompleting(false);
        fadeAnim.setValue(1);
      }, 300);
    }
  };

  return (
    <Animated.View style={{ opacity: fadeAnim }}>
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => onTaskPress(id)}
        activeOpacity={0.7}
      >
        <View style={styles.taskContent}>
          <TouchableWithoutFeedback onPress={handleToggleComplete}>
            <View
              style={[
                styles.taskIcon,
                isOverdue && styles.overdueTask,
                showCompleted && styles.completedIcon,
              ]}
            >
              {showCompleted && <Check />}
            </View>
          </TouchableWithoutFeedback>

          <View style={styles.taskTextContainer}>
            {address && (
              <Text
                style={[
                  styles.addressText,
                  showCompleted && styles.completedTask,
                ]}
              >
                {address}
              </Text>
            )}
            <Text
              style={[
                styles.taskNameText,
                showCompleted && styles.completedTask,
              ]}
            >
              {name}
            </Text>
            <View style={styles.dateContainer}>
              <Text
                style={[
                  styles.dueDateText,
                  isOverdue && styles.overdueTask,
                  showCompleted && styles.completedTask,
                  { textDecorationLine: "none" },
                ]}
              >
                {formattedDueDate}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};
export default TaskItem;

const styles = StyleSheet.create({
  taskItem: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary[300],
    borderRadius: 12,
    padding: 12,
    width: "100%",

    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 4,
  },
  taskContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
  },
  taskIcon: {
    borderWidth: 2.5,
    borderRadius: 100,
    width: 24,
    borderColor: colors.gray[300],
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  taskTextContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
  },
  addressText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    color: colors.gray[600],
    letterSpacing: 0.06,
  },
  taskNameText: {
    fontFamily: "Inter",
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
    color: colors.gray[800],
    letterSpacing: 0.08,
    marginTop: 4,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    width: "100%",
    marginTop: 4,
  },
  dueDateText: {
    fontFamily: "Inter",
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
    letterSpacing: 0.06,
  },
  completedTask: {
    color: colors.gray[600],
    textDecorationLine: "line-through",
  },
  overdueTask: {
    color: colors.primary[400],
    borderColor: colors.primary[400],
  },
  completedIcon: {
    backgroundColor: colors.gray[600],
    borderColor: colors.gray[600],
  },
});
