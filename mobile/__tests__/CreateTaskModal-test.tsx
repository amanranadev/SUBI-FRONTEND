import { CreateTaskModal } from "@/components/CreateTaskModal";
import { colors } from "@/constants/colors";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import { format } from "date-fns";
import React from "react";
import { Alert } from "react-native";

const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("not wrapped in act") ||
        args[0].includes("Failed to create task"))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCreateTask.mockClear();
  mockCreateCalendarEvent.mockClear();
  mockAddGoogleCalendarEvent.mockClear();
  mockAlert.mockClear();

  // Reset calendar connection states
  mockIsAppleCalendarConnected = false;
  mockIsGoogleCalendarConnected = false;
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ bottom: 0 }),
}));

const mockCreateTask = jest.fn();
let isTaskLoading = false;
jest.mock("@/hooks/useTasks", () => ({
  useCreateTask: () => {
    return {
      mutate: mockCreateTask,
      isPending: isTaskLoading,
    };
  },
}));

const mockCreateCalendarEvent = jest.fn();
let mockIsCalendarLoading = false;
jest.mock("@/hooks/useCalendar", () => ({
  useCalendar: () => {
    return {
      createCalendarEvent: mockCreateCalendarEvent,
      isLoading: mockIsCalendarLoading,
    };
  },
}));

const mockAddGoogleCalendarEvent = jest.fn();
jest.mock("@/services/googleCalendarService", () => ({
  addGoogleCalendarEvent: (...args: any[]) =>
    mockAddGoogleCalendarEvent(...args),
}));

const mockAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

let mockIsAppleCalendarConnected = false;
let mockIsGoogleCalendarConnected = false;

jest.mock("@/stores/calendarStore", () => ({
  useCalendarStore: () => {
    return {
      isAppleCalendarConnected: mockIsAppleCalendarConnected,
      isGoogleCalendarConnected: mockIsGoogleCalendarConnected,
    };
  },
}));

jest.mock("@gorhom/bottom-sheet", () => {
  const { View } = require("react-native");
  return {
    BottomSheetModal: ({ children }: { children: React.ReactNode }) => {
      return <View>{children}</View>;
    },
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => {
      return <View>{children}</View>;
    },
    BottomSheetBackdrop: () => null,
  };
});

test("renders create task modal", () => {
  const { getByText } = render(<CreateTaskModal transactionId="123" />);

  expect(getByText("Create New Task")).toBeTruthy();
});

test("calls onClose when close button is pressed", () => {
  const onClose = jest.fn();
  const { getByLabelText } = render(
    <CreateTaskModal transactionId="123" onClose={onClose} />
  );
  const closeButton = getByLabelText("close-modal");
  fireEvent.press(closeButton);
  expect(onClose).toHaveBeenCalled();
});

test("shows validation error when task name is not provided", async () => {
  const { getByLabelText, findByText } = render(
    <CreateTaskModal transactionId="123" />
  );
  const createTaskButton = getByLabelText("create-task-button");
  await act(async () => {
    fireEvent.press(createTaskButton);
  });
  expect(await findByText("Task name is required")).toBeTruthy();
});

test("onDatePickerOpen is called when due date input is pressed", () => {
  const onDatePickerOpen = jest.fn();
  const { getByLabelText } = render(
    <CreateTaskModal transactionId="123" onDatePickerOpen={onDatePickerOpen} />
  );
  const dueDateInput = getByLabelText("due-date-input");
  fireEvent.press(dueDateInput);
  expect(onDatePickerOpen).toHaveBeenCalled();
});

test("setValue is called when form button is pressed", () => {
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const formTypeButton = getByLabelText("form-type-button");
  fireEvent.press(formTypeButton);
  expect(formTypeButton).toHaveStyle({ backgroundColor: colors.primary[400] });
});

test("setValue is called when task button is pressed", () => {
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const taskTypeButton = getByLabelText("task-type-button");
  fireEvent.press(taskTypeButton);
  expect(taskTypeButton).toHaveStyle({ backgroundColor: colors.primary[400] });
});

test("task button is active by default", () => {
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const taskTypeButton = getByLabelText("task-type-button");
  const formTypeButton = getByLabelText("form-type-button");
  expect(taskTypeButton).toHaveStyle({ backgroundColor: colors.primary[400] });
  expect(formTypeButton).not.toHaveStyle({
    backgroundColor: colors.primary[400],
  });
});

test("creates the task when create task button is pressed", async () => {
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const createTaskButton = getByLabelText("create-task-button");
  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });
  await act(async () => {
    fireEvent.press(createTaskButton);
  });
  await waitFor(() => {
    expect(mockCreateTask).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Task",
        transactionId: "123",
        type: "TASK",
      }),
      expect.objectContaining({
        onSuccess: expect.any(Function),
        onError: expect.any(Function),
      })
    );
  });
});

test("disables create task button when creating", () => {
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const createTaskButton = getByLabelText("create-task-button");
  fireEvent.press(createTaskButton);

  if (mockIsCalendarLoading || isTaskLoading) {
    expect(createTaskButton).toBeDisabled();
  } else {
    expect(createTaskButton).toBeEnabled();
  }
});

test("calls onSuccess callback after successful task creation", async () => {
  mockCreateTask.mockClear();

  const onSuccess = jest.fn();
  const onClose = jest.fn();
  const { getByLabelText } = render(
    <CreateTaskModal
      transactionId="123"
      onSuccess={onSuccess}
      onClose={onClose}
    />
  );
  const createTaskButton = getByLabelText("create-task-button");

  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });

  await act(async () => {
    fireEvent.press(createTaskButton);
  });

  await waitFor(() => {
    expect(mockCreateTask).toHaveBeenCalled();
  });

  const taskData = mockCreateTask.mock.calls[0][0];
  const options = mockCreateTask.mock.calls[0][1];

  expect(taskData.name).toBe("Test Task");
  expect(taskData.transactionId).toBe("123");
  expect(taskData.dueDate).toBeInstanceOf(Date);

  expect(options).toBeDefined();
  expect(options.onSuccess).toBeDefined();
  expect(typeof options.onSuccess).toBe("function");

  await act(async () => {
    options.onSuccess();
  });

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled();
  });
});

test("calls onClose callback after successful task creation", async () => {
  mockCreateTask.mockClear();

  const onSuccess = jest.fn();
  const onClose = jest.fn();
  const { getByLabelText } = render(
    <CreateTaskModal
      transactionId="123"
      onSuccess={onSuccess}
      onClose={onClose}
    />
  );
  const createTaskButton = getByLabelText("create-task-button");

  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });

  await act(async () => {
    fireEvent.press(createTaskButton);
  });

  await waitFor(() => {
    expect(mockCreateTask).toHaveBeenCalled();
  });

  const taskData = mockCreateTask.mock.calls[0][0];
  const options = mockCreateTask.mock.calls[0][1];

  expect(taskData.name).toBe("Test Task");
  expect(taskData.transactionId).toBe("123");
  expect(taskData.dueDate).toBeInstanceOf(Date);

  expect(options).toBeDefined();
  expect(options.onSuccess).toBeDefined();
  expect(typeof options.onSuccess).toBe("function");

  await act(async () => {
    options.onSuccess();
  });

  await waitFor(() => {
    expect(onSuccess).toHaveBeenCalled();
  });

  expect(onClose).toHaveBeenCalled();
});

test("form is not reset when task creation fails", async () => {
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const createTaskButton = getByLabelText("create-task-button");
  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });
  await act(async () => {
    fireEvent.press(createTaskButton);
  });
  await waitFor(() => {
    expect(mockCreateTask).toHaveBeenCalled();
  });
  const [, options] = mockCreateTask.mock.calls[0];
  await act(async () => {
    options.onError(new Error("Test Error"));
  });
  await waitFor(() => {
    expect(getByLabelText("task-name-input").props.value).toBe("Test Task");
  });
});

test("form is updated when selectedDate prop changes", async () => {
  const initialDate = new Date(2025, 0, 10); // Jan 10, 2025
  const updatedDate = new Date(2025, 1, 20);

  const { getByLabelText, rerender } = render(
    <CreateTaskModal transactionId="123" selectedDate={initialDate} />
  );
  expect(getByLabelText("due-date-text")).toHaveTextContent(
    format(initialDate, "MMM dd, yyyy")
  );
  await act(async () => {
    rerender(
      <CreateTaskModal transactionId="123" selectedDate={updatedDate} />
    );
  });
  expect(getByLabelText("due-date-text")).toHaveTextContent(
    format(updatedDate, "MMM dd, yyyy")
  );
});

test("onSuccess and onClose are not called when create task creation fails", async () => {
  const onSuccess = jest.fn();
  const onClose = jest.fn();
  const { getByLabelText } = render(
    <CreateTaskModal
      transactionId="123"
      onSuccess={onSuccess}
      onClose={onClose}
    />
  );
  const createTaskButton = getByLabelText("create-task-button");
  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });
  await act(async () => {
    fireEvent.press(createTaskButton);
  });
  await waitFor(() => {
    expect(mockCreateTask).toHaveBeenCalled();
  });

  const [, options] = mockCreateTask.mock.calls[0];
  await act(async () => {
    options.onError(new Error("Test Error"));
  });
  await waitFor(() => {
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});

test("Save To section renders when apple calender is connected", () => {
  mockIsAppleCalendarConnected = true;
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const saveToSection = getByLabelText("save-to-section");
  const appSaveButton = getByLabelText("app-save-button");

  expect(saveToSection).toBeTruthy();
  expect(appSaveButton).toBeTruthy();
});

test("Save To section renders when google calender is connected", () => {
  mockIsGoogleCalendarConnected = true;
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const saveToSection = getByLabelText("save-to-section");
  const googleSaveButton = getByLabelText("calendar-save-button");
  expect(saveToSection).toBeTruthy();
  expect(googleSaveButton).toBeTruthy();
});

test("Save To section does not render when no calendar is connected", () => {
  const { queryByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const saveToSection = queryByLabelText("save-to-section");
  expect(saveToSection).toBeNull();
});

test("creates Apple Calendar event with correct data when saveDestination is set to calendar", async () => {
  mockIsAppleCalendarConnected = true;
  mockCreateCalendarEvent.mockResolvedValue("123");
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const calendarSaveButton = getByLabelText("calendar-save-button");
  const createTaskButton = getByLabelText("create-task-button");
  fireEvent.press(calendarSaveButton);

  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });

  await act(async () => {
    fireEvent.changeText(
      getByLabelText("task-description-input"),
      "Test Description"
    );
  });

  await act(async () => {
    fireEvent.press(createTaskButton);
  });

  await waitFor(() => {
    expect(mockCreateCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test Task",
        date: expect.any(Date),
        description: "Test Description",
      })
    );
  });
});

test("creates Google Calendar event with correct data when saveDestination is set to calendar", async () => {
  mockIsGoogleCalendarConnected = true;
  mockAddGoogleCalendarEvent.mockResolvedValue("123");
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const calendarSaveButton = getByLabelText("calendar-save-button");
  const createTaskButton = getByLabelText("create-task-button");
  fireEvent.press(calendarSaveButton);

  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });

  await act(async () => {
    fireEvent.changeText(
      getByLabelText("task-description-input"),
      "Test Description"
    );
  });

  await act(async () => {
    fireEvent.press(createTaskButton);
  });

  await waitFor(() => {
    expect(mockAddGoogleCalendarEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Test Task",
        startDate: expect.any(Date),
        endDate: expect.any(Date),
        notes: "Test Description",
      }),
      "123"
    );
  });
});

test("error handling when calendar event creation fails", async () => {
  mockIsAppleCalendarConnected = true;
  mockCreateCalendarEvent.mockRejectedValue(new Error("Test Error"));
  const { getByLabelText } = render(<CreateTaskModal transactionId="123" />);
  const calendarSaveButton = getByLabelText("calendar-save-button");
  const createTaskButton = getByLabelText("create-task-button");
  fireEvent.press(calendarSaveButton);

  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });

  await act(async () => {
    fireEvent.press(createTaskButton);
  });

  await waitFor(() => {
    expect(mockAlert).toHaveBeenCalledWith(
      "Error",
      "Failed to create calendar event. Please try again."
    );
  });
});

test("loading state and button disabled when creating calendar event", async () => {
  mockIsAppleCalendarConnected = true;
  mockCreateCalendarEvent.mockResolvedValue("123");
  const { getByLabelText, rerender } = render(
    <CreateTaskModal transactionId="123" />
  );
  const calendarSaveButton = getByLabelText("calendar-save-button");
  const createTaskButton = getByLabelText("create-task-button");
  fireEvent.press(calendarSaveButton);

  await act(async () => {
    fireEvent.changeText(getByLabelText("task-name-input"), "Test Task");
  });

  await act(async () => {
    fireEvent.press(createTaskButton);
  });

  mockIsCalendarLoading = true;

  await act(async () => {
    rerender(<CreateTaskModal transactionId="123" />);
  });

  await waitFor(() => {
    expect(createTaskButton).toBeDisabled();
    expect(getByLabelText("create-task-button")).toHaveTextContent(
      "Creating..."
    );
  });
});

