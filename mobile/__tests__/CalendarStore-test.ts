import { useCalendarStore } from "@/stores/calendarStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook } from "@testing-library/react-native";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock AsyncStorage implementation
const mockAsyncStorage: any = {
  storage: {} as Record<string, string>,
  getItem: jest.fn((key: string) => {
    return Promise.resolve(mockAsyncStorage.storage[key] || null);
  }),
  setItem: jest.fn((key: string, value: string) => {
    mockAsyncStorage.storage[key] = value;
    return Promise.resolve();
  }),
  removeItem: jest.fn((key: string) => {
    delete mockAsyncStorage.storage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(() => {
    mockAsyncStorage.storage = {};
    return Promise.resolve();
  }),
};

(AsyncStorage.getItem as jest.Mock).mockImplementation(mockAsyncStorage.getItem);
(AsyncStorage.setItem as jest.Mock).mockImplementation(mockAsyncStorage.setItem);
(AsyncStorage.removeItem as jest.Mock).mockImplementation(mockAsyncStorage.removeItem);
(AsyncStorage.clear as jest.Mock).mockImplementation(mockAsyncStorage.clear);

test("initial state is disconnected from both calendars", () => {
  const { result } = renderHook(() => useCalendarStore());
  const { isAppleCalendarConnected, isGoogleCalendarConnected } = result.current;
  expect(isAppleCalendarConnected).toBe(false);
  expect(isGoogleCalendarConnected).toBe(false);
})

test("connectAppleCalendar sets the isAppleCalendarConnected to true", () => {
  const { result } = renderHook(() => useCalendarStore());
  const { connectAppleCalendar } = result.current;
  act(() => {
    connectAppleCalendar();
  });
  expect(result.current.isAppleCalendarConnected).toBe(true);
})

test("connectGoogleCalendar sets the isGoogleCalendarConnected to true", () => {
  const { result } = renderHook(() => useCalendarStore());
  const { connectGoogleCalendar } = result.current;
  act(() => {
    connectGoogleCalendar();
  });
  expect(result.current.isGoogleCalendarConnected).toBe(true);
})

test("disconnectAppleCalendar sets the isAppleCalendarConnected to false", () => {
  const { result } = renderHook(() => useCalendarStore());
  const { disconnectAppleCalendar } = result.current;
  act(() => {
    disconnectAppleCalendar();
  });
  expect(result.current.isAppleCalendarConnected).toBe(false);
})


test("disconnectGoogleCalendar sets the isGoogleCalendarConnected to false", () => {
  const { result } = renderHook(() => useCalendarStore());
  const { disconnectGoogleCalendar } = result.current;
  act(() => {
    disconnectGoogleCalendar();
  });
  expect(result.current.isGoogleCalendarConnected).toBe(false);
})

test("connecting Apple calendar does not affect Google calendar state", () => {
  const { result } = renderHook(() => useCalendarStore());
  const { connectAppleCalendar } = result.current;
  act(() => {
    connectAppleCalendar();
  });
  expect(result.current.isAppleCalendarConnected).toBe(true);
  expect(result.current.isGoogleCalendarConnected).toBe(false);
})