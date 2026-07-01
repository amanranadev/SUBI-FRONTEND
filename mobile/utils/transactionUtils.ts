import { colors } from "@/constants/colors";
import { BuyersAndSellers, Transaction } from "@/types/transaction";
import { normalizeDate } from "@/utils/utils";
import { addDays, differenceInCalendarDays, isAfter, isBefore } from "date-fns";

export const getStatusIcon = (
  statusType: Transaction["statusType"]
): string => {
  switch (statusType) {
    case "overdue":
      return "⚠️";
    case "on-track":
      return "✅";
    case "due-soon":
      return "🕓";
    default:
      return "✅";
  }
};

export const getStatusText = (
  statusType: Transaction["statusType"],
  overdueCount?: number,
  dueSoonCount?: number
): string => {
  switch (statusType) {
    case "overdue":
      return `${overdueCount} overdue`;
    case "on-track":
      return "On track";
    case "due-soon":
      return `${dueSoonCount} due soon`;
    default:
      return "On track";
  }
};

export const getStatusColor = (
  statusType: Transaction["statusType"]
): string => {
  switch (statusType) {
    case "overdue":
      return colors.red[500];
    case "on-track":
      return colors.green[500];
    case "due-soon":
      return colors.orange[500];
    default:
      return colors.green[500];
  }
};

export const getBackgroundColor = (
  statusType: Transaction["statusType"]
): string => {
  switch (statusType) {
    case "overdue":
      return colors.yellow[500];
    default:
      return colors.white;
  }
};

export const formatTransactionForUI = (
  apiTransaction: Transaction
): Transaction => {
  let overdueCount = 0;
  let dueSoonCount = 0;
  const daysToClose = apiTransaction.closeDate
    ? calculateDaysToClose(apiTransaction.closeDate)
    : 0;

  if (
    apiTransaction.TransactionTasks &&
    Array.isArray(apiTransaction.TransactionTasks)
  ) {
    const now = new Date();
    const weekFromNow = addDays(now, 7);

    apiTransaction.TransactionTasks.forEach((task: any) => {
      const taskDueDate = new Date(task.dueDate);

      if (isBefore(taskDueDate, now) && !task.completed) {
        overdueCount++;
      } else if (
        isAfter(taskDueDate, now) &&
        isBefore(taskDueDate, weekFromNow) &&
        !task.completed
      ) {
        dueSoonCount++;
      }
    });
  }

  return {
    ...apiTransaction,
    overdueCount,
    dueSoonCount,
    daysToClose,
    buyersAndSellersParsed: parseBuyersAndSellers(
      apiTransaction.buyersAndSellers
    ),
  };
};

export const formatPrice = (amount: number): string => {
  return `$${amount.toLocaleString()}`;
};

export const calculateDaysToClose = (date: string): number => {
  const now = new Date();
  const nowDateStr = normalizeDate(now);
  const transactionDateStr = normalizeDate(date);
  return differenceInCalendarDays(transactionDateStr, nowDateStr);
};

export const parseBuyersAndSellers = (input: string | object | null | undefined): BuyersAndSellers => {
  // Handle null/undefined
  if (!input) {
    return { buyers: [], sellers: [] };
  }

  // If already an object (not a string), use it directly
  if (typeof input === "object" && !Array.isArray(input)) {
    return {
      buyers: (input as any).buyers || [],
      sellers: (input as any).sellers || [],
    };
  }

  // If string, parse it
  if (typeof input === "string") {
    // Handle empty string
    if (input.trim() === "") {
      return { buyers: [], sellers: [] };
    }

    try {
      const parsed = JSON.parse(input);
      
      // Handle null/undefined parsed value
      if (!parsed) {
        return { buyers: [], sellers: [] };
      }

      return {
        buyers: parsed.buyers || [],
        sellers: parsed.sellers || [],
      };
    } catch (error) {
      console.error("Error parsing buyersAndSellers JSON:", error);
      return {
        buyers: [],
        sellers: [],
      };
    }
  }

  // Fallback for any other type
  return { buyers: [], sellers: [] };
};
