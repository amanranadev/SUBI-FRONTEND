import TaskDetailBottomSheet from "@/components/TaskDetail/TaskDetailsContent";
import { fireEvent, render } from "@testing-library/react-native";
import { format } from "date-fns";
import React from "react";

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn().mockReturnValue({ bottom: 0 }),
}));

jest.mock("@/contexts/TaskDetailContext", () => {
  return {
    useTaskDetailContext: jest.fn().mockReturnValue({
      setTaskDetailOpen: jest.fn(),
    }),
  };
});

jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");
  const BottomSheetModal = React.forwardRef(
    ({ children }: { children: React.ReactNode }, ref: any) => {
      React.useEffect(() => {
        if (ref) {
          if (typeof ref === "function") {
            ref({
              present: jest.fn(),
              dismiss: jest.fn(),
              close: jest.fn(),
            });
          } else if (ref && typeof ref === "object" && "current" in ref) {
            ref.current = {
              present: jest.fn(),
              dismiss: jest.fn(),
              close: jest.fn(),
            };
          }
        }
      }, [ref]);
      // Use ref prop correctly - React.createElement handles refs specially
      return React.createElement(View, { ref: ref }, children);
    }
  );
  BottomSheetModal.displayName = "BottomSheetModal";
  return {
    BottomSheetModal,
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(View, null, children);
    },
    BottomSheetView: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(View, null, children);
    },
    BottomSheetBackdrop: () => null,
  };
});

jest.mock("@/components/CalendarModal", () => {
  const React = require("react");
  const { View } = require("react-native");
  const CalendarModal = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
      close: jest.fn(),
    }));
    return (
      <View testID="calendar-modal" ref={ref} onPress={props.onDateSelect} />
    );
  });
  CalendarModal.displayName = "CalendarModal";
  return {
    __esModule: true,
    default: CalendarModal,
  };
});

jest.mock("@/components/Calendar", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ selectedDate, onDateSelect }: any) => {
      return React.createElement(
        View,
        { testID: "calendar-component" },
        React.createElement(Text, null, "Calendar")
      );
    },
  };
});

jest.mock("@react-native-picker/picker", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Picker = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(View, null, children);
  };
  Picker.Item = ({ children }: { children: React.ReactNode }) => {
    return React.createElement(View, null, children);
  };
  return { Picker };
});

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  const { View } = require("react-native");
  const DateTimePicker = (props: any) =>
    React.createElement(View, { testID: "datetime-picker" });
  DateTimePicker.displayName = "DateTimePicker";
  return {
    __esModule: true,
    default: DateTimePicker,
  };
});

jest.mock("@/components/TimePickerModal", () => {
  const React = require("react");
  const { View } = require("react-native");
  const TimePickerPopover = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
      close: jest.fn(),
    }));
    if (!props.isVisible) return null;
    return (
      <View
        testID="time-picker-popover"
        ref={ref}
        onPress={() => props.onTimeSelect(new Date("2025-01-01T12:00:00"))}
      />
    );
  });
  TimePickerPopover.displayName = "TimePickerPopover";
  return {
    __esModule: true,
    default: TimePickerPopover,
    TimePickerPopover,
    TimePickerView: (props: any) =>
      React.createElement(View, { testID: "time-picker-view" }),
  };
});

jest.mock("@/hooks/useComments", () => {
  return {
    useComments: jest.fn(() => ({
      data: [],
      isLoading: false,
    })),
  };
});

jest.mock("@/assets/icons/AddressIcon", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: "address-icon" }),
  };
});

jest.mock("@/assets/icons/ClockIcon", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: "clock-icon" }),
  };
});

jest.mock("@/assets/icons/DateIcon", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: "date-icon" }),
  };
});

jest.mock("@/assets/icons/DescriptionIcon", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: "description-icon" }),
  };
});

jest.mock("@/assets/icons/ChevronBack", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: "chevron-back" }),
  };
});

jest.mock("@/assets/icons/ChevronDown", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: "chevron-down" }),
  };
});

jest.mock("@/assets/icons/ChevronFront", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: "chevron-front" }),
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Ionicons: ({ name, size, color }: any) =>
      React.createElement(View, { testID: `ionicons-${name}` }),
  };
});

jest.mock("react-native-svg", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Svg: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    Path: () => null,
    Circle: () => null,
    Rect: () => null,
    G: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  };
});

jest.mock("@tanstack/react-query", () => {
  const actual = jest.requireActual("@tanstack/react-query");
  return {
    ...actual,
    useQuery: jest.fn(() => ({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    })),
  };
});

jest.mock("@/components/TaskComments", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    TaskCommentsList: ({
      taskId,
      maxItems,
      showViewAll,
      onViewAllPress,
    }: any) => {
      return React.createElement(View, { testID: "task-comments-list" });
    },
  };
});

const task1 = {
  id: "1",
  taskId: "123",
  title: "Test Task",
  description: "Test Description",
  address: "Test Address",
  date: "2025-01-01",
  time: "12:00",
  location: "Test Location",
  information: "Test Information",
  isOverdue: false,
  isCalendarEvent: false,
};

const task2 = {
  id: "2",
  taskId: "123",
  title: "Test Task 2",
  description: "Test Description 2",
  address: "Test Address 2",
  date: "2025-01-01",
  time: "12:00",
  location: "Test Location 2",
  information: "Test Information 2",
  isOverdue: false,
  isCalendarEvent: false,
};

const onClose = jest.fn();
const onMenuPress = jest.fn();
const onViewAllComments = jest.fn();
const onCommentSubmit = jest.fn();
const onShowFullDescription = jest.fn();
const onDateChange = jest.fn();
const onInformationChange = jest.fn();
const onTimePress = jest.fn();
const onTimeChange = jest.fn();
const onNameChange = jest.fn();

test("renders task title input", () => {
  // Verify the component is imported correctly
  expect(TaskDetailBottomSheet).toBeDefined();
  expect(typeof TaskDetailBottomSheet).toBe("function");

  // Try to render with error boundary to catch the issue
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );

  expect(getByLabelText("task-title-input").props.value).toBe(task1.title);
});

test("changes the task title when the user types", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const input = getByLabelText("task-title-input");
  fireEvent.changeText(input, "New Task Title");
  expect(input.props.value).toBe("New Task Title");
});

test("shows the full description when the user presses the show full description button", () => {
  const { getByLabelText, getByText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const button = getByLabelText("show-full-description-button");
  fireEvent.press(button);
  expect(getByText("Test Description")).toBeTruthy();
  expect(onShowFullDescription).toHaveBeenCalled();
});

test("updates the localTitle when task.id changes", () => {
  const { getByLabelText, rerender } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  expect(getByLabelText("task-title-input").props.value).toBe(task1.title);
  rerender(
    <TaskDetailBottomSheet
      task={task2}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  expect(getByLabelText("task-title-input").props.value).toBe(task2.title);
});

test("calls onNameChange when the user types", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const input = getByLabelText("task-title-input");
  fireEvent.changeText(input, "New Task Title");
  expect(onNameChange).toHaveBeenCalledWith("New Task Title");
});

test("calls onClose when the user presses the close button", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const button = getByLabelText("close-button");
  fireEvent.press(button);
  expect(onClose).toHaveBeenCalled();
});

test("calls onDateChange when the user selects a date", () => {
  const { getByTestId } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const calendarModal = getByTestId("calendar-modal");
  fireEvent.press(calendarModal);
  expect(onDateChange).toHaveBeenCalled();
});

test("calls onTimeChange when the user selects a time", () => {
  const { getByTestId, getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );

  const timePickerButton = getByLabelText("time-picker-button");
  fireEvent.press(timePickerButton);

  const timePickerPopover = getByTestId("time-picker-popover");
  fireEvent.press(timePickerPopover);
  expect(onTimeChange).toHaveBeenCalledWith(expect.any(Date));
});

test("calls onShowFullDescription when the user presses the show full description button", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const button = getByLabelText("show-full-description-button");
  fireEvent.press(button);
  expect(onShowFullDescription).toHaveBeenCalled();
});

test("calls onInformationChange when the user presses the notes section", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const notesSection = getByLabelText("information-change-button");
  fireEvent.press(notesSection);
  expect(onInformationChange).toHaveBeenCalled();
});

test("shows time picker when the user presses the time picker button", () => {
  const { getByLabelText, getByTestId } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const timePickerButton = getByLabelText("time-picker-button");
  fireEvent.press(timePickerButton);
  expect(getByTestId("time-picker-popover")).toBeTruthy();
});

// test("closes time picker when the closed",() => {
//   const { getByLabelText, getByTestId } = render(
//     <TaskDetailBottomSheet
//       task={task1}
//       onClose={onClose}
//       onMenuPress={onMenuPress}
//       onViewAllComments={onViewAllComments}
//       onCommentSubmit={onCommentSubmit}
//       onShowFullDescription={onShowFullDescription}
//       onDateChange={onDateChange}
//       onInformationChange={onInformationChange}
//       onTimePress={onTimePress}
//       onTimeChange={onTimeChange}
//       onNameChange={onNameChange}
//     />
//   );
//   const timePickerButton = getByLabelText("time-picker-button");
//   fireEvent.press(timePickerButton);
//   expect(getByTestId("time-picker-popover")).toBeTruthy();
//   const closeButton = getByLabelText("close-button");
//   fireEvent.press(closeButton);
//   expect(getByTestId("time-picker-popover")).toBeNull();
// })

test("hides the notes section for calendar events", () => {
  const { queryByLabelText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, isCalendarEvent: true }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const notesSection = queryByLabelText("notes-section");
  expect(notesSection).not.toBeTruthy();
});

test("hides the comments section for calendar events", () => {
  const { queryByLabelText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, isCalendarEvent: true }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const commentsSection = queryByLabelText("comments-section");
  expect(commentsSection).not.toBeTruthy();
});

test("shows the comments section for regular tasks", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, isCalendarEvent: false }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const commentsSection = getByLabelText("comments-section");
  expect(commentsSection).toBeTruthy();
});

test("shows the notes section for regular tasks", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, isCalendarEvent: false }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const notesSection = getByLabelText("notes-section");
  expect(notesSection).toBeTruthy();
});

test("displays the full description when it is less than 120 characters", () => {
  const shortDescription = "Test Description";
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, description: shortDescription }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const descriptionText = getByLabelText("description-text");
  expect(descriptionText.children[0]).toBe(shortDescription);
  expect(descriptionText.children).not.toContain("...");
  expect(descriptionText.children).not.toContain("more");
});

test("truncates the description when it exceeds the 120 characters and displays the more button", () => {
  const longDescription = "a".repeat(121);
  const { getByLabelText, getByText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, description: longDescription }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const descriptionText = getByLabelText("description-text");
  expect(descriptionText.children[0]).toBe(
    `${longDescription.substring(0, 120).trim()}... `
  );
  expect(getByText("more")).toBeTruthy();
});

test("truncates the description exactly at 120 characters", () => {
  const longDescription = "a".repeat(120);
  const { getByLabelText, getByText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, description: longDescription }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const descriptionText = getByLabelText("description-text");
  expect(descriptionText.children[0]).toBe(longDescription);
  expect(descriptionText.children).not.toContain("...");
  expect(descriptionText.children).not.toContain("more");
});

test("does not display the more button when the description is less than 120 characters", () => {
  const shortDescription = "a".repeat(120);
  const { getByLabelText, getByText } = render(
    <TaskDetailBottomSheet
      task={{ ...task1, description: shortDescription }}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const descriptionText = getByLabelText("description-text");
  expect(descriptionText.children[0]).toBe(shortDescription);
  expect(descriptionText.children).not.toContain("...");
  expect(descriptionText.children).not.toContain("more");
});

test("displays the formatted date correctly", () => {
  const { getByLabelText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );
  const dateButton = getByLabelText("date-picker-button");
  expect(dateButton).toHaveTextContent(
    format(new Date(task1.date), "MMM dd, yyyy")
  );
});

test("displays task address, location, and time", () => {
  const { getByText } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onCommentSubmit={onCommentSubmit}
      onShowFullDescription={onShowFullDescription}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      onTimePress={onTimePress}
      onTimeChange={onTimeChange}
      onNameChange={onNameChange}
    />
  );

  // Check address is displayed
  expect(getByText(task1.address)).toBeDefined();

  // Check location is displayed
  expect(getByText(task1.location)).toBeDefined();

  // Check time is displayed
  expect(getByText(task1.time)).toBeDefined();
});

test("handles missing optional callbacks gracefully", () => {
  // Render without optional callbacks
  const { getByLabelText, getByTestId } = render(
    <TaskDetailBottomSheet
      task={task1}
      onClose={onClose}
      onMenuPress={onMenuPress}
      onViewAllComments={onViewAllComments}
      onDateChange={onDateChange}
      onInformationChange={onInformationChange}
      // Optional callbacks are not provided
    />
  );

  // Component should render without errors
  expect(getByLabelText("task-title-input")).toBeDefined();

  // Test that optional callbacks can be called without errors
  const input = getByLabelText("task-title-input");
  fireEvent.changeText(input, "New Title");
  // Should not throw error even though onNameChange is not provided

  // Test time picker button press without onTimePress callback
  const timePickerButton = getByLabelText("time-picker-button");
  fireEvent.press(timePickerButton);
  // Should not throw error even though onTimePress is not provided

  // Test time picker interaction without onTimeChange callback
  const timePickerPopover = getByTestId("time-picker-popover");
  fireEvent.press(timePickerPopover);
  // Should not throw error even though onTimeChange is not provided

  // Test show full description button without onShowFullDescription callback
  const showFullDescriptionButton = getByLabelText(
    "show-full-description-button"
  );
  fireEvent.press(showFullDescriptionButton);
  // Should not throw error even though onShowFullDescription is not provided
});
