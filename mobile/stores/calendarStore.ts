import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface CalendarState {
  isAppleCalendarConnected: boolean;
  isGoogleCalendarConnected: boolean;
  connectAppleCalendar: () => void;
  connectGoogleCalendar: () => void;
  disconnectAppleCalendar: () => void;
  disconnectGoogleCalendar: () => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set) => ({
      isAppleCalendarConnected: false,
      isGoogleCalendarConnected: false,
      connectAppleCalendar: () => set({ isAppleCalendarConnected: true }),
      connectGoogleCalendar: () => set({ isGoogleCalendarConnected: true }),
      disconnectAppleCalendar: () => set({ isAppleCalendarConnected: false }),
      disconnectGoogleCalendar: () => set({ isGoogleCalendarConnected: false }),
    }),
    {
      name: "calendar-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
