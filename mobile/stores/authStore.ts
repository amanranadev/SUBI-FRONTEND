import AsyncStorage from '@react-native-async-storage/async-storage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
interface AuthState {
  token: string | null | undefined
  isAuthenticated: boolean
}

interface AuthActions {
  setToken: (token: string | null | undefined) => void
  clearToken: () => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(persist(set => ({
  token: null,
  isAuthenticated: false,

  setToken: (token: string | null | undefined) => {
    set({
      token,
      isAuthenticated: !!token,
    })
  },

  clearToken: () => {
    set({
      token: null,
      isAuthenticated: false,
    })
  },
}), {
  name: 'auth-storage',
  storage: createJSONStorage(() => AsyncStorage),
}))
