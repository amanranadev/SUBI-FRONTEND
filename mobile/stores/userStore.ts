import { User } from '@/types/auth'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { SignInSuccessResponse } from '@react-native-google-signin/google-signin'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface UserState {
  user: User | null
}

interface UserActions {
  setUser: (user: User | null) => void
  clearUser: () => void
  updateUser: (updates: Partial<User>) => void
  setUserFromGoogleLogin: (googleResponse: SignInSuccessResponse) => void
}

type UserStore = UserState & UserActions

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user: User | null) => {
        set({ user })
      },

      clearUser: () => {
        set({ user: null })
      },

      updateUser: (updates: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({
            user: { ...currentUser, ...updates },
          })
        }
      },

      setUserFromGoogleLogin: (googleResponse: SignInSuccessResponse) :void => {
        const googleUser = googleResponse.data.user
        
        
        const user: User = {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name || googleUser.email, 
          firstName: googleUser.givenName || '', 
          lastName: googleUser.familyName || '', 
          nickname: googleUser.givenName || googleUser.email.split('@')[0], 
          picture: googleUser.photo || '', 
          subscription: 'FREE', 
          onboardingCompleted: false, 
          startedOnboarding: false,
          teams: [], 
        }
        
        set({ user })
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        user: state.user,
      }),
    }
  )
)
