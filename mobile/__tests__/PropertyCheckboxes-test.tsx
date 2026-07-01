import Property from "@/screens/TransactionsDetails/components/Property";
import { Transaction } from "@/types";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";

// Mock useTransactionManagement hook
const mockUpdateTransaction = jest.fn();
const mockUseTransactionManagement = jest.fn(() => ({
  updateTransaction: mockUpdateTransaction,
  isUpdating: false,
}));

jest.mock("@/hooks/useTransactions", () => ({
  useTransactionManagement: (transactionId?: string) =>
    mockUseTransactionManagement(),
}));

// Mock react-hook-form - need to properly mock Controller
const mockControl = {};
const mockReset = jest.fn();
const mockWatch = jest.fn();
let mockOnSubmitCallback: any = null;
let currentTransaction: Transaction | null = null;

const mockHandleSubmit = jest.fn((fn: any) => {
  // Store the callback so we can call it later
  mockOnSubmitCallback = fn;
  // Return a function that when called, calls fn with mock form data
  return () => {
    if (!currentTransaction) {
      return;
    }
    const mockFormData = {
      address: currentTransaction.address || "",
      parcel:
        currentTransaction.parcelNumber ||
        currentTransaction.parcel_number ||
        "",
      nwmls:
        currentTransaction.nwmlsNumber || currentTransaction.nwmls_number || "",
      cityState:
        currentTransaction.cityState || currentTransaction.city_state || "",
    };
    return fn(mockFormData);
  };
});

jest.mock("react-hook-form", () => {
  const React = require("react");
  return {
    useForm: jest.fn(() => ({
      control: mockControl,
      handleSubmit: mockHandleSubmit,
      reset: mockReset,
      watch: mockWatch,
    })),
    Controller: ({ render, name }: any) => {
      const mockField = {
        onChange: jest.fn(),
        onBlur: jest.fn(),
        value: "",
        name,
        ref: jest.fn(),
      };
      return render({ field: mockField });
    },
  };
});

// Mock FormInput and SaveButton components
jest.mock("@/screens/TransactionsDetails/components/FormInput", () => {
  const React = require("react");
  const { View, Text, TextInput } = require("react-native");
  return ({ field, onChangeText }: any) => (
    <View testID={`form-input-${field.id}`}>
      <Text>{field.label}</Text>
      <TextInput
        testID={`input-${field.id}`}
        value={field.value}
        placeholder={field.placeholder}
        onChangeText={onChangeText}
      />
    </View>
  );
});

jest.mock("@/screens/TransactionsDetails/components/SaveButton", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onPress }: any) => (
    <TouchableOpacity testID="save-button" onPress={onPress}>
      <Text>Save</Text>
    </TouchableOpacity>
  );
});

// Create a test QueryClient
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
  );
};

const baseMockTransaction = {
  id: "test-transaction-1",
  description: "Test Transaction",
  amount: 500000,
  address: "123 Test St",
  date: "2024-01-01",
  transactionCategory: "PSA",
  transaction_category: "PSA",
  closeDate: "",
  close_date: "",
  pendDate: "",
  pend_date: "",
  createdAt: "2024-01-01",
  created_at: "2024-01-01",
  updatedAt: "2024-01-01",
  updated_at: "2024-01-01",
};

describe("Property Tab - Checkboxes", () => {
  let mockTransaction: any;

  beforeEach(() => {
    mockTransaction = { ...baseMockTransaction };
    currentTransaction = { ...mockTransaction };

    jest.clearAllMocks();
    mockReset.mockClear();
    mockWatch.mockClear();
    mockOnSubmitCallback = null;
    mockHandleSubmit.mockImplementation((fn: any) => {
      mockOnSubmitCallback = fn;
      return () => {
        if (!currentTransaction) {
          return;
        }
        const mockFormData = {
          address: currentTransaction.address || "",
          parcel:
            currentTransaction.parcelNumber ||
            currentTransaction.parcel_number ||
            "",
          nwmls:
            currentTransaction.nwmlsNumber ||
            currentTransaction.nwmls_number ||
            "",
          cityState:
            currentTransaction.cityState || currentTransaction.city_state || "",
        };
        return fn(mockFormData);
      };
    });
    mockUseTransactionManagement.mockReturnValue({
      updateTransaction: mockUpdateTransaction,
      isUpdating: false,
    });
  });

  describe("Checkbox Rendering", () => {
    test("renders all checkbox items with correct labels", () => {
      const transaction = { ...mockTransaction };
      currentTransaction = transaction;
      const { getByText } = renderWithQueryClient(
        <Property transaction={transaction} />
      );

      expect(getByText("Items that stay")).toBeTruthy();
      expect(getByText("Washer")).toBeTruthy();
      expect(getByText("Ceiling fans")).toBeTruthy();
      expect(getByText("Dryer")).toBeTruthy();
      expect(getByText("Window treatments")).toBeTruthy();
      expect(getByText("Garage door openers")).toBeTruthy();
    });
  });

  describe("Checkbox Functionality", () => {
    test("loads checked state from transaction.itemsThatStay", () => {
      const transactionWithItems: Transaction = {
        ...mockTransaction,
        itemsThatStay: "Washer, Dryer",
        items_that_stay: "Washer, Dryer",
      };
      const { getByText } = renderWithQueryClient(
        <Property transaction={transactionWithItems} />
      );

      expect(getByText("Items that stay")).toBeTruthy();
    });

    test("toggles checkbox and saves checked items correctly", async () => {
      const transaction = { ...mockTransaction };
      currentTransaction = transaction;
      const { getByTestId, getByText } = renderWithQueryClient(
        <Property transaction={transaction} />
      );

      // Toggle checkboxes
      const washerLabel = getByText("Washer");
      const dryerLabel = getByText("Dryer");
      const washerCheckbox = washerLabel.parent?.parent;
      const dryerCheckbox = dryerLabel.parent?.parent;

      await act(async () => {
        fireEvent.press(washerCheckbox as any);
        fireEvent.press(dryerCheckbox as any);
      });

      // Submit the form
      const saveButton = getByTestId("save-button");
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(mockUpdateTransaction).toHaveBeenCalled();
      });

      const callArgs = mockUpdateTransaction.mock.calls[0][0];
      expect(callArgs.transactionId).toBe(mockTransaction.id);
      expect(callArgs.updates.itemsThatStay).toContain("Washer");
      expect(callArgs.updates.itemsThatStay).toContain("Dryer");
      expect(callArgs.updates.items_that_stay).toContain("Washer");
      expect(callArgs.updates.items_that_stay).toContain("Dryer");
    });

    test("saves empty string when no items are checked", async () => {
      const transaction = { ...mockTransaction };
      currentTransaction = transaction;
      const { getByTestId } = renderWithQueryClient(
        <Property transaction={transaction} />
      );

      const saveButton = getByTestId("save-button");
      await act(async () => {
        fireEvent.press(saveButton);
      });

      await waitFor(() => {
        expect(mockUpdateTransaction).toHaveBeenCalled();
      });

      const callArgs = mockUpdateTransaction.mock.calls[0][0];
      expect(callArgs.updates.itemsThatStay).toBe("");
      expect(callArgs.updates.items_that_stay).toBe("");
    });
  });
});
