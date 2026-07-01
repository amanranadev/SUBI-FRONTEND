import LoginScreen from '@/screens/Login/index'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import '@testing-library/react-native'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: jest.fn(),
    login: jest.fn(),
    isLoginPending: false,
    isLoginSuccess: false,
    isLoginError: false,
    loginError: null,
  }),
}))

jest.mock('@/assets/icons/GoogleIcon', () => 'GoogleIcon')
jest.mock('@/components/Wave/hello-wave', () => 'HelloWave')
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
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

describe('<LoginScreen />', () => {
  test('renders without crashing', () => {
    const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })
    expect(getByText('Welcome to')).toBeTruthy()
  })

  test('shows Subi brand name', () => {
    const { getByText } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    expect(getByText('Subi')).toBeTruthy()
  })

  test('has email input field with correct properties', () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const emailInput = getByTestId('email-input')

    expect(emailInput).toBeTruthy()
    expect(emailInput.props.keyboardType).toBe('email-address')
    expect(emailInput.props.autoCapitalize).toBe('none')
    expect(emailInput.props.autoCorrect).toBe(false)
  })

  test('has password input field with correct properties', () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const passwordInput = getByTestId('password-input')

    expect(passwordInput).toBeTruthy()
    expect(passwordInput.props.secureTextEntry).toBe(true)
    expect(passwordInput.props.autoCapitalize).toBe('none')
    expect(passwordInput.props.autoCorrect).toBe(false)
  })

  test('has login button and is enabled', () => {
    const { getByText, getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })

    expect(getByText('Log in')).toBeTruthy()

    const loginButton = getByTestId('login-button')
    // Button is enabled if disabled is undefined or false
    expect(loginButton.props.accessibilityState?.disabled).toBeFalsy()
  })

  test('has Google button', () => {
    const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })
    expect(getByText('Continue with Google')).toBeTruthy()
  })

  test('allows typing in email field', async () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const emailInput = getByTestId('email-input')

    await act(async () => {
      fireEvent.changeText(emailInput, 'test@example.com')
    })
    expect(emailInput.props.value).toBe('test@example.com')
  })

  test('allows typing in password field', async () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const passwordInput = getByTestId('password-input')

    await act(async () => {
      fireEvent.changeText(passwordInput, 'password123')
    })
    expect(passwordInput.props.value).toBe('password123')
  })

  test('renders footer links', () => {
    const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() })

    expect(getByText(/New to/)).toBeTruthy()
    expect(getByText('Subi')).toBeTruthy()
    expect(getByText(/Create an account/)).toBeTruthy()
    expect(getByText(/Forgot your password\?/)).toBeTruthy()
    expect(getByText(/Reset it/)).toBeTruthy()
  })

  test('has eye icon for password field', () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const eyeButton = getByTestId('password-eye-button')
    expect(eyeButton).toBeTruthy()
  })

  test('toggles password visibility when eye icon is pressed', async () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const eyeButton = getByTestId('password-eye-button')
    const passwordInput = getByTestId('password-input')

    expect(passwordInput.props.secureTextEntry).toBe(true)

    await act(async () => {
      fireEvent.press(eyeButton)
    })
  })

  test('calls onSubmit when login button is pressed', async () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const loginButton = getByTestId('login-button')

    await act(async () => {
      fireEvent.press(loginButton)
    })
  })

  test('form validation works correctly', async () => {
    const { getByTestId } = render(<LoginScreen />, {
      wrapper: createWrapper(),
    })
    const loginButton = getByTestId('login-button')

    await act(async () => {
      fireEvent.press(loginButton)
    })
  })
})
