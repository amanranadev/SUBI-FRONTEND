import type { TransactionFormTask } from "@/features/transactions/types";
import {
  cascadeDependentTaskDates,
  recalculateTaskDate,
} from "./task-dependency-cascade";

describe("task dependency cascade", () => {
  it("recalculates downstream tasks from mutual acceptance without off-by-one drift", () => {
    const tasks: TransactionFormTask[] = [
      {
        id: "earnest",
        title: "Earnest Money Deposit",
        date: "04/24/2026",
        calculation: "5 business days after mutual acceptance",
        formName: "Form 21",
        isSelected: true,
      },
      {
        id: "notice",
        title: "Buyer Notice Deadline",
        date: "04/26/2026",
        calculation: "2 calendar days after Earnest Money Deposit",
        formName: "Form 21",
        isSelected: true,
      },
    ];

    const recalculated = tasks.map((task) =>
      recalculateTaskDate(task, "mutualAcceptanceDate", "2026-04-21"),
    );
    const cascaded = cascadeDependentTaskDates(recalculated, "earnest");

    const earnest = cascaded.find((task) => task.id === "earnest");
    const notice = cascaded.find((task) => task.id === "notice");

    expect(earnest?.date).toBe("2026-04-28");
    expect(notice?.date).toBe("2026-04-30");
  });
});
