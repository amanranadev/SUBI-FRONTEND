import CustomDrawerContent from "@/components/CustomDrawerContent/CustomDrawerContent";
import { useChats, useDeleteChat } from "@/hooks/useChats";
import { UserChat } from "@/types/chat";
import { DrawerContentComponentProps } from "@react-navigation/drawer";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { ActivityIndicator, Alert } from "react-native";

const mockDeleteChat = jest.fn();
let mockChatsData: { user_chats: UserChat[] } | undefined = undefined;
let mockIsLoading = false;

jest.mock("@/hooks/useChats", () => ({
  useChats: jest.fn(),
  useDeleteChat: jest.fn(),
}));

const mockUseChats = useChats as jest.MockedFunction<typeof useChats>;
const mockUseDeleteChat = useDeleteChat as jest.MockedFunction<
  typeof useDeleteChat
>;

jest.mock("@react-navigation/drawer", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    DrawerContentScrollView: ({ children }: { children: React.ReactNode }) => {
      return React.createElement(
        View,
        { testID: "drawer-scroll-view" },
        children
      );
    },
    DrawerItemList: () => {
      return React.createElement(View, { testID: "drawer-item-list" });
    },
  };
});

jest.mock("@expo/vector-icons", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    Ionicons: ({ name }: { name: string }) => {
      return React.createElement(View, { testID: `icon-${name}` });
    },
  };
});

jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn((date: Date) => {
    return "2 hours ago";
  }),
}));

const mockAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());

const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(jest.fn());

const createMockChat = (
  id: string,
  title: string,
  updatedAt?: string
): UserChat => ({
  id,
  title,
  status: "active",
  messages: [],
  message_count: 0,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: updatedAt || "2024-01-01T12:00:00Z",
  user_id: "user-123",
});

const createMockDrawerProps = (): DrawerContentComponentProps => ({
  state: {
    index: 0,
    key: "drawer-state-key",
    routeNames: ["home"],
    routes: [{ name: "home", key: "home", params: undefined }],
    history: [],
    type: "drawer" as const,
    stale: false,
    preloadedRouteKeys: {},
  } as any,
  navigation: {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(() => true),
    canGoBack: jest.fn(() => false),
    getId: jest.fn(),
    getParent: jest.fn(),
    getState: jest.fn(),
    setParams: jest.fn(),
    setOptions: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    openDrawer: jest.fn(),
    closeDrawer: jest.fn(),
    toggleDrawer: jest.fn(),
  } as any,
  descriptors: {
    home: {
      options: {},
      navigation: {} as any,
      render: jest.fn(),
    },
  } as any,
});

beforeEach(() => {
  jest.clearAllMocks();
  mockDeleteChat.mockClear();
  mockAlert.mockClear();
  mockConsoleLog.mockClear();
  mockIsLoading = false;
  mockChatsData = undefined;

  mockUseDeleteChat.mockReturnValue({
    mutate: mockDeleteChat,
    isPending: false,
    isError: false,
    isSuccess: false,
    error: null,
    data: undefined,
    reset: jest.fn(),
  } as any);
});

describe("ChatHistory", () => {
  test("shows loading indicator while chats are loading", () => {
    mockIsLoading = true;
    mockUseChats.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { UNSAFE_getAllByType } = render(
      <CustomDrawerContent {...mockProps} />
    );

    const activityIndicators = UNSAFE_getAllByType(ActivityIndicator);
    expect(activityIndicators.length).toBeGreaterThan(0);
  });

  test("shows empty state when no chats exist", () => {
    mockIsLoading = false;
    mockChatsData = { user_chats: [] };
    mockUseChats.mockReturnValue({
      data: mockChatsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { getByText, UNSAFE_queryByType } = render(
      <CustomDrawerContent {...mockProps} />
    );

    expect(getByText("No chat history")).toBeDefined();
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  test("renders chat list when chats exist", () => {
    const mockChats = [
      createMockChat("chat-1", "First Chat"),
      createMockChat("chat-2", "Second Chat"),
    ];
    mockChatsData = { user_chats: mockChats };
    mockIsLoading = false;

    mockUseChats.mockReturnValue({
      data: mockChatsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { getByText, queryByText, UNSAFE_queryByType } = render(
      <CustomDrawerContent {...mockProps} />
    );

    expect(getByText("First Chat")).toBeDefined();
    expect(getByText("Second Chat")).toBeDefined();
    expect(queryByText("No chat history")).toBeNull();
    expect(UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  test("calls onPress when a chat item is pressed", async () => {
    const mockChats = [createMockChat("chat-1", "Test Chat")];
    mockChatsData = { user_chats: mockChats };

    mockUseChats.mockReturnValue({
      data: mockChatsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { getByText } = render(<CustomDrawerContent {...mockProps} />);

    const chatTitle = getByText("Test Chat");
    const chatItem = chatTitle.parent?.parent;

    expect(chatItem).toBeDefined();

    await act(async () => {
      fireEvent.press(chatItem!);
    });

    await waitFor(() => {
      expect(mockConsoleLog).toHaveBeenCalledWith("Chat pressed:", "chat-1");
    });
  });

  test("calls onDelete when delete button is pressed", async () => {
    const mockChats = [createMockChat("chat-1", "Test Chat")];
    mockChatsData = { user_chats: mockChats };

    mockUseChats.mockReturnValue({
      data: mockChatsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { getByTestId } = render(<CustomDrawerContent {...mockProps} />);

    const deleteButton = getByTestId("icon-trash-outline").parent;

    expect(deleteButton).toBeDefined();

    await act(async () => {
      fireEvent.press(deleteButton!);
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  test("shows delete confirmation alert", async () => {
    const mockChats = [createMockChat("chat-1", "Test Chat")];
    mockChatsData = { user_chats: mockChats };

    mockUseChats.mockReturnValue({
      data: mockChatsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { getByTestId } = render(<CustomDrawerContent {...mockProps} />);

    const deleteButton = getByTestId("icon-trash-outline").parent;

    expect(deleteButton).toBeDefined();

    await act(async () => {
      fireEvent.press(deleteButton!);
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith(
        "Delete Chat",
        'Are you sure you want to delete "Test Chat"?',
        expect.arrayContaining([
          expect.objectContaining({ text: "Cancel", style: "cancel" }),
          expect.objectContaining({ text: "Delete", style: "destructive" }),
        ])
      );
    });
  });

  test("calls deleteChat with correct id when confirmed", async () => {
    const mockChats = [createMockChat("chat-1", "Test Chat")];
    mockChatsData = { user_chats: mockChats };

    mockUseChats.mockReturnValue({
      data: mockChatsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { getByTestId } = render(<CustomDrawerContent {...mockProps} />);

    const deleteButton = getByTestId("icon-trash-outline").parent;

    expect(deleteButton).toBeDefined();

    await act(async () => {
      fireEvent.press(deleteButton!);
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });

    const alertCall = mockAlert.mock.calls[0];
    const alertButtons = alertCall[2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    const deleteButtonAction = alertButtons.find(
      (btn) => btn.text === "Delete"
    );

    expect(deleteButtonAction).toBeDefined();
    expect(deleteButtonAction?.onPress).toBeDefined();

    await act(async () => {
      deleteButtonAction!.onPress!();
    });

    await waitFor(() => {
      expect(mockDeleteChat).toHaveBeenCalledWith("chat-1");
    });
  });

  test("does not call deleteChat when cancel is pressed", async () => {
    const mockChats = [createMockChat("chat-1", "Test Chat")];
    mockChatsData = { user_chats: mockChats };

    mockUseChats.mockReturnValue({
      data: mockChatsData,
      isLoading: false,
      isError: false,
      error: null,
      refetch: jest.fn(),
    } as any);

    const mockProps = createMockDrawerProps();
    const { getByTestId } = render(<CustomDrawerContent {...mockProps} />);

    const deleteButton = getByTestId("icon-trash-outline").parent;

    expect(deleteButton).toBeDefined();

    await act(async () => {
      fireEvent.press(deleteButton!);
    });

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });

    const alertCall = mockAlert.mock.calls[0];
    const alertButtons = alertCall[2] as Array<{
      text: string;
      onPress?: () => void;
    }>;
    const cancelButton = alertButtons.find((btn) => btn.text === "Cancel");

    if (cancelButton?.onPress) {
      await act(async () => {
        cancelButton.onPress!();
      });
    }

    await waitFor(() => {
      expect(mockDeleteChat).not.toHaveBeenCalled();
    });
  });
});
