import AccountScreen from "@/screens/Settings/AccountScreen";
import { changePassword } from "@/services/authService";
import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import React from "react";
import { Alert, Keyboard } from "react-native";

jest.mock("@/stores/userStore", () => ({
  useUserStore: jest.fn().mockReturnValue({
    user: {
      id: "123",
    },
    updateUser: jest.fn(),
  }),
}));

jest.mock("@/hooks/useUser", () => ({
  __esModule: true,
  default: () => ({
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    isLoadingMe: false,
    isUpdating: false,
    isDeleting: false,
  }),
}));

jest.mock("@/stores/authStore", () => ({
  useAuthStore: jest.fn((selector) => {
    if (selector) {
      return selector({ clearToken: jest.fn() });
    }
    return { clearToken: jest.fn() };
  }),
}));

jest.mock("@/services/authService", () => ({
  __esModule: true,
  changePassword: jest.fn(),
}));

const mockChangePassword = changePassword as jest.MockedFunction<
  typeof changePassword
>;
const mockAlert = jest.spyOn(Alert, "alert").mockImplementation(jest.fn());
const mockKeyboardDismiss = jest
  .spyOn(Keyboard, "dismiss")
  .mockImplementation(jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
  mockChangePassword.mockReset();
  mockAlert.mockClear();
  mockKeyboardDismiss.mockClear();
});

test("shows error when current password is empty", async () => {
  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(getByLabelText("new-password-input"), "NewPassword1");
  fireEvent.changeText(
    getByLabelText("confirm-password-input"),
    "NewPassword1"
  );

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  expect(mockAlert).toHaveBeenCalledWith("Error", "Password is required");
  expect(mockChangePassword).not.toHaveBeenCalled();
});

test("shows error when new password is empty", async () => {
  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    "CurrentPassword1"
  );

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  expect(mockAlert).toHaveBeenCalledWith("Error", "Password is required");
  expect(mockChangePassword).not.toHaveBeenCalled();
});

test("shows error when new password is less than 8 characters", async () => {
  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    "CurrentPassword1"
  );
  fireEvent.changeText(getByLabelText("new-password-input"), "Short1");
  fireEvent.changeText(getByLabelText("confirm-password-input"), "Short1");

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  expect(mockAlert).toHaveBeenCalledWith(
    "Error",
    "Password must be at least 8 characters"
  );
  expect(mockChangePassword).not.toHaveBeenCalled();
});

test("shows error when new password does not match confirm password", async () => {
  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    "CurrentPassword1"
  );
  fireEvent.changeText(getByLabelText("new-password-input"), "NewPassword1");
  fireEvent.changeText(
    getByLabelText("confirm-password-input"),
    "DifferentPassword1"
  );

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  expect(mockAlert).toHaveBeenCalledWith("Error", "Passwords don't match");
  expect(mockChangePassword).not.toHaveBeenCalled();
});

test("shows error when new password is the same as current password", async () => {
  const { getByLabelText } = render(<AccountScreen />);

  const samePassword = "CurrentPassword1";
  fireEvent.changeText(getByLabelText("current-password-input"), samePassword);
  fireEvent.changeText(getByLabelText("new-password-input"), samePassword);
  fireEvent.changeText(getByLabelText("confirm-password-input"), samePassword);

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  expect(mockAlert).toHaveBeenCalledWith(
    "Error",
    "New password must be different from current password"
  );
  expect(mockChangePassword).not.toHaveBeenCalled();
});

test("calls changePassword when all fields are valid", async () => {
  mockChangePassword.mockResolvedValue(undefined);

  const { getByLabelText } = render(<AccountScreen />);

  const currentPassword = "CurrentPassword1";
  const newPassword = "NewPassword1";

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    currentPassword
  );
  fireEvent.changeText(getByLabelText("new-password-input"), newPassword);
  fireEvent.changeText(getByLabelText("confirm-password-input"), newPassword);

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  await waitFor(() => {
    expect(mockChangePassword).toHaveBeenCalledWith({
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
  });

  expect(mockChangePassword).toHaveBeenCalledTimes(1);
});

test("shows success message when password is updated", async () => {
  mockChangePassword.mockResolvedValue(undefined);

  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    "CurrentPassword1"
  );
  fireEvent.changeText(getByLabelText("new-password-input"), "NewPassword1");
  fireEvent.changeText(
    getByLabelText("confirm-password-input"),
    "NewPassword1"
  );

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  await waitFor(() => {
    expect(mockChangePassword).toHaveBeenCalled();
  });

  await waitFor(() => {
    expect(mockAlert).toHaveBeenCalledWith(
      "Success",
      "Your password has been updated."
    );
  });

  expect(mockKeyboardDismiss).toHaveBeenCalledTimes(1);
});

test("clears input fields when password is updated", async () => {
  mockChangePassword.mockResolvedValue(undefined);

  const { getByLabelText } = render(<AccountScreen />);

  const currentPasswordInput = getByLabelText("current-password-input");
  const newPasswordInput = getByLabelText("new-password-input");
  const confirmPasswordInput = getByLabelText("confirm-password-input");

  fireEvent.changeText(currentPasswordInput, "CurrentPassword1");
  fireEvent.changeText(newPasswordInput, "NewPassword1");
  fireEvent.changeText(confirmPasswordInput, "NewPassword1");

  expect(currentPasswordInput.props.value).toBe("CurrentPassword1");
  expect(newPasswordInput.props.value).toBe("NewPassword1");
  expect(confirmPasswordInput.props.value).toBe("NewPassword1");

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  await waitFor(() => {
    expect(mockChangePassword).toHaveBeenCalled();
  });

  await waitFor(() => {
    expect(currentPasswordInput.props.value).toBe("");
    expect(newPasswordInput.props.value).toBe("");
    expect(confirmPasswordInput.props.value).toBe("");
  });
});

test("shows error when current password is incorrect", async () => {
  const errorResponse = {
    response: {
      status: 422,
      data: {
        message: "Current password is incorrect",
      },
    },
  };
  mockChangePassword.mockRejectedValue(errorResponse);

  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    "WrongPassword1"
  );
  fireEvent.changeText(getByLabelText("new-password-input"), "NewPassword1");
  fireEvent.changeText(
    getByLabelText("confirm-password-input"),
    "NewPassword1"
  );

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  await waitFor(() => {
    expect(mockChangePassword).toHaveBeenCalled();
  });

  await waitFor(() => {
    expect(mockAlert).toHaveBeenCalledWith(
      "Error",
      "Current password is incorrect"
    );
  });

  expect(getByLabelText("current-password-input").props.value).toBe(
    "WrongPassword1"
  );
  expect(getByLabelText("new-password-input").props.value).toBe("NewPassword1");
  expect(getByLabelText("confirm-password-input").props.value).toBe(
    "NewPassword1"
  );
});

test("shows 'Current password is incorrect' on 422 status with server error field", async () => {
  const errorResponse = {
    response: {
      status: 422,
      data: {
        error: "Current password is incorrect",
      },
    },
  };
  mockChangePassword.mockRejectedValue(errorResponse);

  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    "WrongPassword1"
  );
  fireEvent.changeText(getByLabelText("new-password-input"), "NewPassword1");
  fireEvent.changeText(
    getByLabelText("confirm-password-input"),
    "NewPassword1"
  );

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  await waitFor(() => {
    expect(mockChangePassword).toHaveBeenCalled();
  });

  await waitFor(() => {
    expect(mockAlert).toHaveBeenCalledWith(
      "Error",
      "Current password is incorrect"
    );
  });

  expect(mockChangePassword).toHaveBeenCalledTimes(1);
});

test("shows server error message when provided", async () => {
  const serverErrorMessage =
    "Password change is temporarily unavailable. Please try again later.";
  const errorResponse = {
    response: {
      status: 500,
      data: {
        message: serverErrorMessage,
      },
    },
  };
  mockChangePassword.mockRejectedValue(errorResponse);

  const { getByLabelText } = render(<AccountScreen />);

  fireEvent.changeText(
    getByLabelText("current-password-input"),
    "CurrentPassword1"
  );
  fireEvent.changeText(getByLabelText("new-password-input"), "NewPassword1");
  fireEvent.changeText(
    getByLabelText("confirm-password-input"),
    "NewPassword1"
  );

  await act(async () => {
    fireEvent.press(getByLabelText("update-password-button"));
  });

  await waitFor(() => {
    expect(mockChangePassword).toHaveBeenCalled();
  });

  await waitFor(() => {
    expect(mockAlert).toHaveBeenCalledWith("Error", serverErrorMessage);
  });

  expect(mockChangePassword).toHaveBeenCalledTimes(1);

  expect(getByLabelText("current-password-input").props.value).toBe(
    "CurrentPassword1"
  );
  expect(getByLabelText("new-password-input").props.value).toBe("NewPassword1");
  expect(getByLabelText("confirm-password-input").props.value).toBe(
    "NewPassword1"
  );
});
