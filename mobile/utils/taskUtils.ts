import { Task } from "@/types/task";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
} from "date-fns";

const normalizeDate = (date: string | Date): string => {
  if (typeof date === "string") {
    if (date.includes("T")) {
      // Extract just the date part and ensure it's treated as local time
      const dateOnly = date.split("T")[0];
      const localDate = new Date(dateOnly + "T00:00:00");
      return format(localDate, "yyyy-MM-dd");
    }
    // For date-only strings, ensure they're treated as local time
    const localDate = new Date(date + "T00:00:00");
    return format(localDate, "yyyy-MM-dd");
  } else {
    return format(date, "yyyy-MM-dd");
  }
};

// Format Date object to YYYY-MM-DD format for API
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Task filtering utilities
export const filterTasksByDate = (
  tasks: Task[],
  selectedDate: Date
): Task[] => {
  const selectedDateStr = normalizeDate(selectedDate);

  return tasks.filter((task) => {
    const taskDateStr = normalizeDate(task.dueDate || "");
    return taskDateStr === selectedDateStr;
  });
};

export const filterOverdueTasks = (tasks: Task[]): Task[] => {
  const todayStr = normalizeDate(new Date());

  return tasks.filter((task) => {
    const taskDateStr = normalizeDate(task.dueDate || "");
    return taskDateStr < todayStr && !task.completed;
  });
};

export const filterTodayTasks = (tasks: Task[], selectedDate: Date): Task[] => {
  const todayStr = normalizeDate(selectedDate);

  const taskReturn = tasks.filter((task) => {
    const taskDateStr = normalizeDate(task.dueDate || "");
    const isToday = taskDateStr === todayStr;
    const isNotCompleted = !task.completed;
    const shouldInclude = isToday && isNotCompleted;
    return shouldInclude;
  });

  return taskReturn;
};

export const filterCompletedTasks = (tasks: Task[]): Task[] => {
  return tasks.filter((task) => task.completed);
};

export const filterTasksByStatus = (
  tasks: Task[],
  status: Task["status"]
): Task[] => {
  return tasks.filter((task) => task.status === status);
};

export const filterTasksByTransaction = (
  tasks: Task[],
  transactionId: string
): Task[] => {
  return tasks.filter((task) => task.transactionId === transactionId);
};

// Task formatting utilities
export const formatTaskForUI = (task: Task) => {
  const now = new Date();
  let dueDate: Date;

  const dateStr = task.dueDate || "";
  if (dateStr.includes("T")) {
    // Extract just the date part and ensure it's treated as local time
    const dateOnly = dateStr.split("T")[0];
    dueDate = new Date(dateOnly + "T00:00:00");
  } else {
    // For date-only strings, ensure they're treated as local time
    dueDate = new Date(dateStr + "T00:00:00");
  }

  return {
    ...task,
    isOverdue: isBefore(dueDate, now) && !task.completed,
    daysUntilDue: differenceInCalendarDays(dueDate, now),
    formattedDueDate: format(dueDate, "MMM dd, yyyy"),
    formattedDueTime: format(dueDate, "HH:mm"),
  };
};

export const getTaskStatusColor = (status: Task["status"]): string => {
  switch (status) {
    case "COMPLETED":
      return "#10B981"; // green
    case "PAST_DUE":
      return "#EF4444"; // red
    case "COMING_UP":
      return "#F59E0B"; // orange
    case "ON_TRACK":
    default:
      return "#3B82F6"; // blue
  }
};

export const getTaskStatusText = (status: Task["status"]): string => {
  switch (status) {
    case "COMPLETED":
      return "Completed";
    case "PAST_DUE":
      return "Overdue";
    case "COMING_UP":
      return "Due Soon";
    case "ON_TRACK":
    default:
      return "On Track";
  }
};

export const isTaskDueToday = (dueDate: string): boolean => {
  let parsedDate: Date;
  if (dueDate.includes("T")) {
    const dateOnly = dueDate.split("T")[0];
    parsedDate = new Date(dateOnly + "T00:00:00");
  } else {
    parsedDate = new Date(dueDate + "T00:00:00");
  }
  return isSameDay(parsedDate, new Date());
};

export const isTaskDueThisWeek = (dueDate: string): boolean => {
  const now = new Date();
  const weekFromNow = addDays(now, 7);

  let parsedDate: Date;
  if (dueDate.includes("T")) {
    const dateOnly = dueDate.split("T")[0];
    parsedDate = new Date(dateOnly + "T00:00:00");
  } else {
    parsedDate = new Date(dueDate + "T00:00:00");
  }

  return isAfter(parsedDate, now) && isBefore(parsedDate, weekFromNow);
};

export const formatTaskDueDate = (
  dueDate: string,
  formatString: string = "MMM dd, yyyy"
): string => {
  let parsedDate: Date;
  if (dueDate.includes("T")) {
    const dateOnly = dueDate.split("T")[0];
    parsedDate = new Date(dateOnly + "T00:00:00");
  } else {
    parsedDate = new Date(dueDate + "T00:00:00");
  }
  return format(parsedDate, formatString);
};

// Generate events array from tasks for calendar display
export const generateEventsFromTasks = (tasks: Task[]): string[] => {
  if (!tasks || tasks.length === 0) return [];

  const incompleteTaskDates = tasks
    .filter((task: Task) => {
      const dueDate = task.dueDate;
      return !task.completed && dueDate;
    })
    .map((task: Task) => {
      const dateStr = task.dueDate;
      if (!dateStr) return null;

      // Handle timezone issues by parsing the date and ensuring it's treated as local time
      let date: Date;

      // If the date string includes time, extract just the date part
      if (dateStr.includes("T")) {
        const dateOnly = dateStr.split("T")[0];
        date = new Date(dateOnly + "T00:00:00");
      } else {
        // If it's just a date string, parse it directly
        date = new Date(dateStr + "T00:00:00");
      }

      return format(date, "yyyy-MM-dd");
    })
    .filter(Boolean) as string[];

  // Remove duplicates
  return [...new Set(incompleteTaskDates)];
};
