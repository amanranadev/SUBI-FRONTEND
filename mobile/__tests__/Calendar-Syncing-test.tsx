import CalendarSyncingSettings from "@/app/(authenticated)/(settings)/calendar-syncing";
import apiClient from "@/services/api";
import { getToken } from "@/services/authService";
import { calendarService } from "@/services/calendarService";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Suppress console.error for act() warnings
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("not wrapped in act") ||
        args[0].includes("Error connecting Apple Calendar") ||
        args[0].includes("act(...)"))
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Store mock functions for access in tests
const mockAlertFn = jest.fn();
let mockPlatformOS = "ios";

// Mock react-native - must be inline to avoid hoisting issues
jest.mock("react-native", () => ({
  Platform: {
    get OS() {
      return mockPlatformOS;
    },
  },
  StyleSheet: {
    create: (styles: any) => styles,
  },
  Alert: {
    get alert() {
      return mockAlertFn;
    },
  },
  View: "View",
  Text: "Text",
  TouchableOpacity: "TouchableOpacity",
}));

// Mock expo-router
const mockRouterPush = jest.fn();
jest.mock("expo-router", () => ({
  router: {
    push: (...args: any[]) => mockRouterPush(...args),
  },
  useFocusEffect: jest.fn(),
}));

// Mock expo-linking
const mockCanOpenURL = jest.fn();
const mockOpenURL = jest.fn();
const mockGetInitialURL = jest.fn();
const mockAddEventListener = jest.fn();

jest.mock("expo-linking", () => ({
  canOpenURL: (...args: any[]) => mockCanOpenURL(...args),
  openURL: (...args: any[]) => mockOpenURL(...args),
  getInitialURL: (...args: any[]) => mockGetInitialURL(...args),
  addEventListener: (...args: any[]) => mockAddEventListener(...args),
  parse: (url: string) => {
    try {
      const urlObj = new URL(url);
      const params: Record<string, string> = {};
      urlObj.searchParams.forEach((value, key) => {
        params[key] = value;
      });
      return { queryParams: params };
    } catch {
      return { queryParams: {} };
    }
  },
}));

// Mock apiClient
jest.mock("@/services/api", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    delete: jest.fn(),
  },
}));

// Mock calendarService
jest.mock("@/services/calendarService", () => ({
  calendarService: {
    requestPermissions: jest.fn(),
  },
}));

// Mock authService
jest.mock("@/services/authService", () => ({
  getToken: jest.fn(),
  storeToken: jest.fn(),
}));

// Mock calendarStore
let mockIsAppleCalendarConnected = false;
let mockIsGoogleCalendarConnected = false;
const mockConnectAppleCalendar = jest.fn();
const mockDisconnectAppleCalendar = jest.fn();
const mockConnectGoogleCalendar = jest.fn();
const mockDisconnectGoogleCalendar = jest.fn();

jest.mock("@/stores/calendarStore", () => ({
  useCalendarStore: () => ({
    get isAppleCalendarConnected() {
      return mockIsAppleCalendarConnected;
    },
    get isGoogleCalendarConnected() {
      return mockIsGoogleCalendarConnected;
    },
    connectAppleCalendar: mockConnectAppleCalendar,
    disconnectAppleCalendar: mockDisconnectAppleCalendar,
    connectGoogleCalendar: mockConnectGoogleCalendar,
    disconnectGoogleCalendar: mockDisconnectGoogleCalendar,
  }),
}));

// Mock Header
jest.mock("@/components/Header/Header", () => {
  const { View, Text } = require("react-native");
  return ({ title }: { title: string }) => (
    <View testID="header">
      <Text>{title}</Text>
    </View>
  );
});

// Mock SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  useSafeAreaInsets: jest.fn().mockReturnValue({ bottom: 0 }),
}));

describe("CalendarSyncingSettings", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockIsAppleCalendarConnected = false;
    mockIsGoogleCalendarConnected = false;
    mockAlertFn.mockClear();
    mockPlatformOS = "ios";
    mockCanOpenURL.mockResolvedValue(true);
    mockGetInitialURL.mockResolvedValue(null);
    mockAddEventListener.mockReturnValue({ remove: jest.fn() });
    (apiClient.get as jest.Mock).mockImplementation(() =>
      Promise.resolve({ data: { accounts: [] } })
    );
  });

  describe("Google Calendar Status", () => {
    test("shows 'Not connected' when disconnected", async () => {
      mockIsGoogleCalendarConnected = false;
      const { getAllByText } = render(<CalendarSyncingSettings />);

      await waitFor(() => {
        const notConnectedTexts = getAllByText("Not connected");
        expect(notConnectedTexts.length).toBeGreaterThan(0);
      });
    });

    test("shows 'Connected' when connected", () => {
      mockIsGoogleCalendarConnected = true;
      const { getAllByText } = render(<CalendarSyncingSettings />);
      const connectedTexts = getAllByText("Connected");
      expect(connectedTexts.length).toBeGreaterThan(0);
    });
  });

  describe("Apple Calendar Visibility", () => {
    test("shows Apple Calendar section on iOS", () => {
      mockPlatformOS = "ios";
      const { getByText } = render(<CalendarSyncingSettings />);
      expect(getByText("Apple Calendar")).toBeTruthy();
    });

    test("hides Apple Calendar section on Android", () => {
      mockPlatformOS = "android";
      const { queryByText } = render(<CalendarSyncingSettings />);
      expect(queryByText("Apple Calendar")).toBeNull();
    });
  });

  describe("Apple Calendar Connection State", () => {
    test("shows 'Connected' and Disconnect button when connected", () => {
      mockIsAppleCalendarConnected = true;
      const { getAllByText } = render(<CalendarSyncingSettings />);
      const connectedTexts = getAllByText("Connected");
      const disconnectButtons = getAllByText("Disconnect");
      expect(connectedTexts.length).toBeGreaterThan(0);
      expect(disconnectButtons.length).toBeGreaterThan(0);
    });

    test("shows 'Not connected' and Connect button when disconnected", () => {
      mockIsAppleCalendarConnected = false;
      const { getAllByText } = render(<CalendarSyncingSettings />);
      const notConnectedTexts = getAllByText("Not connected");
      const connectButtons = getAllByText("Connect");
      expect(notConnectedTexts.length).toBeGreaterThan(0);
      expect(connectButtons.length).toBeGreaterThan(0);
    });
  });

  describe("Apple Calendar Connect", () => {
    test("requests permissions and connects on success", async () => {
      (calendarService.requestPermissions as jest.Mock).mockResolvedValue(true);

      const { getAllByText } = render(<CalendarSyncingSettings />);
      const connectButtons = getAllByText("Connect");
      const appleConnectButton = connectButtons[1];

      await act(async () => {
        fireEvent.press(appleConnectButton);
      });

      await waitFor(() => {
        expect(calendarService.requestPermissions).toHaveBeenCalled();
        expect(mockConnectAppleCalendar).toHaveBeenCalled();
        expect(mockAlertFn).toHaveBeenCalledWith(
          "Connected",
          "Apple Calendar has been connected successfully."
        );
      });
    });

    test("shows error alert when permission denied", async () => {
      (calendarService.requestPermissions as jest.Mock).mockResolvedValue(
        false
      );

      const { getAllByText } = render(<CalendarSyncingSettings />);
      const connectButtons = getAllByText("Connect");
      const appleConnectButton = connectButtons[1];

      await act(async () => {
        fireEvent.press(appleConnectButton);
      });

      await waitFor(() => {
        expect(mockAlertFn).toHaveBeenCalledWith(
          "Permission Denied",
          "Please enable calendar access in your device settings to connect Apple Calendar."
        );
        expect(mockConnectAppleCalendar).not.toHaveBeenCalled();
      });
    });

    test("Apple Calendar not visible on Android", () => {
      mockPlatformOS = "android";
      const { queryByText } = render(<CalendarSyncingSettings />);
      expect(queryByText("Apple Calendar")).toBeNull();
    });
  });

  describe("Apple Calendar Disconnect", () => {
    test("shows confirmation and disconnects on confirm", async () => {
      mockIsAppleCalendarConnected = true;
      mockIsGoogleCalendarConnected = false;

      let alertCallCount = 0;
      mockAlertFn.mockImplementation(
        (
          title: string,
          message: string,
          buttons?: Array<{ text: string; onPress?: () => void }>
        ) => {
          alertCallCount++;
          if (alertCallCount === 1 && buttons && buttons[1]) {
            buttons[1].onPress?.();
          }
        }
      );

      const { getAllByText } = render(<CalendarSyncingSettings />);
      const disconnectButtons = getAllByText("Disconnect");
      const appleDisconnectButton = disconnectButtons[0];

      await act(async () => {
        fireEvent.press(appleDisconnectButton);
      });

      await waitFor(() => {
        expect(mockAlertFn).toHaveBeenCalledWith(
          "Disconnect Apple Calendar",
          "Are you sure you want to disconnect Apple Calendar?",
          expect.any(Array)
        );
        expect(mockDisconnectAppleCalendar).toHaveBeenCalled();
      });
    });
  });

  describe("Google Calendar Connect", () => {
    test("opens OAuth URL when token exists", async () => {
      (getToken as jest.Mock).mockReturnValue("test-token");

      const { getAllByText } = render(<CalendarSyncingSettings />);
      const connectButtons = getAllByText("Connect");
      const googleConnectButton = connectButtons[0];

      await act(async () => {
        fireEvent.press(googleConnectButton);
      });

      await waitFor(() => {
        expect(mockCanOpenURL).toHaveBeenCalled();
        expect(mockOpenURL).toHaveBeenCalled();
        expect(mockOpenURL.mock.calls[0][0]).toContain(
          "/api/auth/google_oauth2"
        );
        expect(mockAlertFn).toHaveBeenCalledWith(
          "Complete OAuth Flow",
          expect.any(String),
          expect.any(Array)
        );
      });
    });

    test("shows alert when token is missing", async () => {
      (getToken as jest.Mock).mockReturnValue(null);

      const { getAllByText } = render(<CalendarSyncingSettings />);
      const connectButtons = getAllByText("Connect");
      const googleConnectButton = connectButtons[0];

      await act(async () => {
        fireEvent.press(googleConnectButton);
      });

      await waitFor(() => {
        expect(mockAlertFn).toHaveBeenCalledWith(
          "Authentication Required",
          "Please sign in to connect Google Calendar."
        );
        expect(mockOpenURL).not.toHaveBeenCalled();
      });
    });
  });

  describe("Google Calendar Disconnect", () => {
    test("shows confirmation and disconnects on confirm", async () => {
      mockIsGoogleCalendarConnected = true;
      mockIsAppleCalendarConnected = false;

      (apiClient.get as jest.Mock).mockImplementation(() =>
        Promise.resolve({
          data: { accounts: [{ id: "account-1" }] },
        })
      );
      (apiClient.delete as jest.Mock).mockResolvedValue({});

      let alertCallCount = 0;
      mockAlertFn.mockImplementation(
        (
          title: string,
          message: string,
          buttons?: Array<{ text: string; onPress?: () => void }>
        ) => {
          alertCallCount++;
          if (alertCallCount === 1 && buttons && buttons[1]) {
            buttons[1].onPress?.();
          }
        }
      );

      const { getAllByText } = render(<CalendarSyncingSettings />);
      const disconnectButtons = getAllByText("Disconnect");
      const googleDisconnectButton = disconnectButtons[0];

      await act(async () => {
        fireEvent.press(googleDisconnectButton);
      });

      await waitFor(() => {
        expect(mockAlertFn).toHaveBeenCalledWith(
          "Disconnect Google Calendar",
          "Are you sure you want to disconnect Google Calendar?",
          expect.any(Array)
        );
        expect(mockDisconnectGoogleCalendar).toHaveBeenCalled();
      });
    });
  });
});
