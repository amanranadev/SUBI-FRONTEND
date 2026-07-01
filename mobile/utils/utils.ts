import { format, parseISO } from "date-fns";

const getGreeting = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  } else if (hour >= 12 && hour < 18) {
    return "Good afternoon";
  } else {
    return "Good evening";
  }
};

const messageHistory: Record<string, string[]> = {};

const getEncouragementMessage = (
  completedCount: number,
  totalCount: number,
  lastMessage: string = "",
  historyLimit: number = 2
): { message: string; lastMessage: string } => {
  const completionPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  let key: string;
  let messages: string[] = [];

  if (totalCount === 0) {
    key = "no-tasks";
    messages = [
      "No tasks yet! 📝",
      "Ready to add some tasks? ✨",
      "Let's create your first task! 🎯",
      "Time to get organized! 📋",
      "Start by adding a task! 🚀",
    ];
  } else if (completedCount === 0) {
    key = "start";
    messages = [
      "Let's get started! 🚀",
      "You've got this! 💪",
      "Time to tackle today's tasks! ⭐",
      "Ready to make progress? 🎯",
      "Let's begin! 🌟",
    ];
  } else if (completionPercentage < 50) {
    key = "early";
    messages = [
      "Great start! Keep going! 🔥",
      "You're on the right track! ✨",
      "Making progress! 💫",
      "Keep the momentum! 🚀",
      "Nice work so far! ⭐",
    ];
  } else if (completionPercentage < 100) {
    key = "mid";
    messages = [
      "Almost there! 🎯",
      "You're crushing it! 💪",
      "So close to the finish line! 🏁",
      "Amazing progress! 🌟",
      "Keep it up! 🔥",
    ];
  } else {
    key = "done";
    messages = [
      "Perfect! All done! 🎉",
      "Outstanding work! 🌟",
      "You're unstoppable! 💪",
      "Mission accomplished! 🏆",
      "Fantastic job! ⭐",
    ];
  }

  if (!messageHistory[key]) {
    messageHistory[key] = [];
  }

  const recent = messageHistory[key];
  const availableMessages = messages.filter(
    (m) => m !== lastMessage && !recent.includes(m)
  );

  const messagesToChooseFrom =
    availableMessages.length > 0 ? availableMessages : messages;

  const selectedMessage =
    messagesToChooseFrom[
      Math.floor(Math.random() * messagesToChooseFrom.length)
    ];

  messageHistory[key].push(selectedMessage);
  if (messageHistory[key].length > historyLimit) {
    messageHistory[key].shift();
  }

  return {
    message: selectedMessage,
    lastMessage: selectedMessage,
  };
};

export { getEncouragementMessage, getGreeting };

// Date utilities using date-fns
export const normalizeDate = (date: string | Date): string => {
  if (typeof date === "string") {
    if (date.includes("T")) {
      return date.split("T")[0];
    }
    const dateObj = parseISO(date);
    return format(dateObj, "yyyy-MM-dd");
  } else {
    return format(date, "yyyy-MM-dd");
  }
};

export const getDaysUntilDue = (dueDate: string): number => {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export interface FormatDaysOptions {
  suffix?: string; // Default: "days"
  short?: boolean; // Default: false. If true, uses "d" instead of "days"
  context?: "countdown" | "standard"; // Default: 'standard'. 'countdown' handles "to close" logic
}

export const formatDaysText = (
  days: number,
  options: FormatDaysOptions = {}
): string => {
  const { short = false, context = "standard" } = options;
  const absDays = Math.abs(days);
  const isNegative = days < 0;

  // Handle singular/plural for "day" vs "days"
  const unit = short ? "d" : absDays === 1 ? "day" : "days";

  // Handle "to close" context specifically
  if (context === "countdown") {
    if (isNegative) {
      return `${absDays} ${unit} ago`;
    }
    return `${absDays} ${unit} left`;
  }

  // Standard context: just appending "ago" if negative
  if (isNegative) {
    return `${absDays} ${unit} ago`;
  }

  return `${absDays} ${unit}`;
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
  "#E57373", // Red
  "#64B5F6", // Blue
  "#81C784", // Green
  "#FFB74D", // Orange
  "#BA68C8", // Purple
  "#4DB6AC", // Teal
  "#F06292", // Pink
  "#7986CB", // Indigo
  "#A1887F", // Brown
  "#90A4AE", // Blue Grey
  "#AED581", // Light Green
  "#FFD54F", // Amber
];

export const getColorFromInitials = (initials: string): string => {
  const hash = initials
    .toUpperCase()
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export function formatCapitalSnakeCaseToLowerCase(
  value: string | null | undefined
): string {
  if (!value || typeof value !== "string") {
    return "";
  }
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
