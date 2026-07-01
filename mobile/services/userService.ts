import { User } from "../types/auth";
import apiClient from "./api";

export interface UpdateUserPayload {
  name?: string;
  lastName?: string; // sent as last_name
  nickname?: string;
  onboardingCompleted?: boolean;
}

export interface UserNotificationPreference {
  id: string;
  notification_type: string;
  title: string;
  description: string;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
  push_enabled: boolean;
  frequency: string;
  frequency_display?: string;
  frequency_description?: string;
  enabled_methods?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UpdateUserNotificationPreferencePayload {
  user_notification_preference: {
    email_enabled?: boolean;
    sms_enabled?: boolean;
    in_app_enabled?: boolean;
    push_enabled?: boolean;
    frequency?: string;
  };
}

export const userService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get("/auth/profile");
    return response.data?.user ?? response.data;
  },

  listUsers: async (): Promise<User[]> => {
    const response = await apiClient.get("/users");
    return Array.isArray(response.data)
      ? response.data
      : Array.isArray(response.data?.users)
      ? response.data.users
      : [];
  },

  getUserById: async (userId: string): Promise<User> => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data?.user ?? response.data;
  },

  updateUser: async (
    userId: string,
    payload: UpdateUserPayload
  ): Promise<User> => {
    const body = {
      user: {
        name: payload.name,
        last_name: payload.lastName,
        nickname: payload.nickname,
        onboarding_completed: payload.onboardingCompleted,
      },
    };
    const response = await apiClient.put(`/users/${userId}`, body);
    return response.data?.user ?? response.data;
  },

  // PATCH /users/:id/onboarding  body: { onboardingCompleted, startedOnboarding }
  updateOnboarding: async (
    userId: string,
    params: { onboardingCompleted: boolean; startedOnboarding: boolean }
  ): Promise<User> => {
    const response = await apiClient.patch(
      `/users/${userId}/onboarding`,
      params
    );
    return response.data?.user ?? response.data;
  },

  // GET /users/:id/ical_url
  getIcalUrl: async (userId: string): Promise<any> => {
    const response = await apiClient.get(`/users/${userId}/ical_url`);
    return response.data;
  },

  // POST /users/:id/regenerate_ical_token
  regenerateIcalToken: async (userId: string): Promise<any> => {
    const response = await apiClient.post(
      `/users/${userId}/regenerate_ical_token`
    );
    return response.data;
  },

  // DELETE /users/:id
  deleteUser: async (userId: string): Promise<void> => {
    await apiClient.delete(`/users/${userId}`);
  },

  // GET /user_notification_preferences → { preferences: [...] }
  getNotificationPreferences: async (): Promise<
    UserNotificationPreference[]
  > => {
    const response = await apiClient.get("/user_notification_preferences");
    const data = response.data;
    if (Array.isArray(data?.preferences)) return data.preferences;
    if (Array.isArray(data)) return data as UserNotificationPreference[];
    return [];
  },

  // PUT /user_notification_preferences/:preference_id
  updateNotificationPreference: async (
    preferenceId: string,
    payload: UpdateUserNotificationPreferencePayload
  ): Promise<UserNotificationPreference> => {
    const response = await apiClient.put(
      `/user_notification_preferences/${preferenceId}`,
      payload
    );
    return response.data?.preference ?? response.data;
  },
};
