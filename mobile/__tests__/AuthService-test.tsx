import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react-native'
import React from 'react'
import { useAuth, useLogin } from '../hooks/useAuth'
import { login } from '../services/authService'

jest.mock('../services/authService', () => ({
  login: jest.fn(),
  logout: jest.fn(),
}))

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}))

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

describe('Authentication Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('useLogin', () => {
    it('should handle successful login', async () => {
      const mockLoginResponse = {
        token: 'mock-token',
        user: {
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          lastName: 'User',
          nickname: 'testuser',
          picture: 'https://example.com/pic.jpg',
          subscription: 'FREE' as const,
          onboardingCompleted: false,
          startedOnboarding: false,
          teams: [],
        },
        message: 'Login successful',
      }

      ;(login as jest.Mock).mockResolvedValue(mockLoginResponse)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      }

      result.current.mutate(credentials)

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(login).toHaveBeenCalledWith(credentials)
      expect(result.current.data).toEqual(mockLoginResponse)
    })

    it('should handle login error', async () => {
      const mockError = {
        message: 'Invalid credentials',
        status: 401,
      }

      ;(login as jest.Mock).mockRejectedValue(mockError)

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      })

      const credentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      result.current.mutate(credentials)

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(mockError)
    })
  })

  describe('useAuth', () => {
    it('should return auth functions and state', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: createWrapper(),
      })

      expect(typeof result.current.login).toBe('function')
      expect(typeof result.current.logout).toBe('function')
      expect(typeof result.current.isLoginPending).toBe('boolean')
      expect(typeof result.current.isLoginSuccess).toBe('boolean')
      expect(typeof result.current.isLoginError).toBe('boolean')
      expect(result.current.loginError).toBeNull()
    })
  })
})
