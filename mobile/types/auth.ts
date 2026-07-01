import type { ApiError } from "@subi/types";

export type { ApiError };

export interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  nickname: string;
  picture: string;
  subscription: "FREE" | "PREMIUM_MONTHLY" | "PREMIUM_YEARLY";
  onboardingCompleted: boolean;
  startedOnboarding: boolean;
  teams: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ErrorResponse {
  message: string;
  status?: number;
  code?: string;
}
export interface LoginResponse extends ErrorResponse {
  token: string;
  user: User;
  message: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}


export interface UseAuthReturn {
  login: (credentials: LoginRequest) => void;
  logout: () => void;
  isLoginPending: boolean;
  isLoginSuccess: boolean;
  isLoginError: boolean;
  loginError: Error | null;
}
