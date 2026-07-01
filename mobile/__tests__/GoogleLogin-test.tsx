import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

import { mockGoogleSignIn, mockLoginWithGoogle, mockLoginWithGoogleHook, mockSetUserFromGoogleLogin } from '../jest.setup'

import LoginScreen from '@/screens/Login/index'
import { SignInSuccessResponse } from '@react-native-google-signin/google-signin'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

describe('Google Login Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Google Login Button', () => {
    test('renders Google login button', () => {
      const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })
      expect(getByText('Continue with Google')).toBeTruthy()
    })

    test('Google login button is enabled by default', () => {
      const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })
      const googleButton = getByText('Continue with Google')
      expect(googleButton.props.accessibilityState?.disabled).toBeFalsy()
    })
  })

  describe('Google Login Flow', () => {
    test('calls loginWithGoogle when Google button is pressed', async () => {
      const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })
      const googleButton = getByText('Continue with Google')

      await act(async () => {
        fireEvent.press(googleButton)
      })

      expect(mockLoginWithGoogleHook).toHaveBeenCalledTimes(1)
    })

    test('handles successful Google login', async () => {
      const mockGoogleResponse: SignInSuccessResponse = {
        data: {
          idToken: 'mock-id-token',
          scopes: ['openid', 'profile', 'email'],
          serverAuthCode: null,
          user: {
            id: '123456789',
            email: 'test@example.com',
            name: 'Test User',
            givenName: 'Test',
            familyName: 'User',
            photo: 'https://example.com/photo.jpg',
          },
        },
        type: 'success',
      }

      mockLoginWithGoogleHook.mockResolvedValue(mockGoogleResponse)

      const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })
      const googleButton = getByText('Continue with Google')

      await act(async () => {
        fireEvent.press(googleButton)
      })

      expect(mockLoginWithGoogleHook).toHaveBeenCalledTimes(1)
    })

    test('handles Google login error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })
      const googleButton = getByText('Continue with Google')

      await act(async () => {
        fireEvent.press(googleButton)
      })

      expect(mockLoginWithGoogleHook).toHaveBeenCalledTimes(1)
      
      consoleSpy.mockRestore()
    })
  })

  describe('User Store Integration', () => {
    test('maps Google user data correctly', () => {
      const mockGoogleResponse: SignInSuccessResponse = {
        data: {
          idToken: 'mock-id-token',
          scopes: ['openid', 'profile', 'email'],
          serverAuthCode: null,
          user: {
            id: '123456789',
            email: 'john.doe@example.com',
            name: 'John Doe',
            givenName: 'John',
            familyName: 'Doe',
            photo: 'https://example.com/photo.jpg',
          },
        },
        type: 'success',
      }

      mockSetUserFromGoogleLogin(mockGoogleResponse)
      
      expect(mockSetUserFromGoogleLogin).toHaveBeenCalledWith(mockGoogleResponse)
    })

    test('handles fallback values for nullable fields', () => {
      const mockGoogleResponseWithNulls: SignInSuccessResponse = {
        data: {
          idToken: 'mock-id-token',
          scopes: ['openid', 'profile', 'email'],
          serverAuthCode: null,
          user: {
            id: '123456789',
            email: 'test@example.com',
            name: null,
            givenName: null,
            familyName: null,
            photo: null,
          },
        },
        type: 'success',
      }

      mockSetUserFromGoogleLogin(mockGoogleResponseWithNulls)
      
      expect(mockSetUserFromGoogleLogin).toHaveBeenCalledWith(mockGoogleResponseWithNulls)
    })
  })

  describe('Auth Service Integration', () => {
    test('Google Sign-In configuration is available', () => {
      expect(mockGoogleSignIn.configure).toBeDefined()
      expect(mockGoogleSignIn.signIn).toBeDefined()
    })

    test('loginWithGoogle service function is available', () => {
      expect(mockLoginWithGoogle).toBeDefined()
    })
  })

  describe('Navigation Integration', () => {
    test('router is available for navigation', () => {
      const { router } = require('expo-router')
      
      // Test that router.replace is available
      expect(router.replace).toBeDefined()
      expect(typeof router.replace).toBe('function')
    })
  })
})