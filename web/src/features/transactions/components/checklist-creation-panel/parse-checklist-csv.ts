type CsvChecklistTask = {
  category: string;
  task: string;
};

type ParseChecklistCsvResult =
  | {
      tasks: CsvChecklistTask[];
      warningCount: number;
      error: null;
    }
  | {
      tasks: [];
      warningCount: number;
      error: string;
    };

export function parseChecklistCsvRows(params: {
  rows: string[][];
  warningCount: number;
}): ParseChecklistCsvResult {
  const { rows, warningCount } = params;

  if (rows.length === 0) {
    return {
      tasks: [],
      warningCount,
      error: "CSV file is empty.",
    };
  }

  const firstRow = rows[0] ?? [];
  const isHeader =
    firstRow.length >= 2 &&
    firstRow[0]?.toLowerCase().includes("category") &&
    firstRow[1]?.toLowerCase().includes("task");
  const dataRows = isHeader ? rows.slice(1) : rows;

  const tasks = dataRows
    .filter((row) => row.length >= 2 && (row[0]?.trim() || row[1]?.trim()))
    .map((row) => ({
      category: (row[0] ?? "").trim(),
      task: (row[1] ?? "").trim(),
    }))
    .filter((task) => task.task.length > 0);

  if (tasks.length === 0) {
    return {
      tasks: [],
      warningCount,
      error: "No valid tasks found. Ensure your CSV has Category and Task Name columns.",
    };
  }

  return {
    tasks,
    warningCount,
    error: null,
  };
}
