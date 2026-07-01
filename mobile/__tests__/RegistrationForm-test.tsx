import RegistrationForm from '@/screens/Registration/Form'
import { act, fireEvent, render } from '@testing-library/react-native'
import React from 'react'

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestCameraPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  launchImageLibraryAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  launchCameraAsync: jest.fn().mockResolvedValue({ canceled: true, assets: [] }),
  MediaTypeOptions: { Images: 'Images' },
}))

describe('<RegistrationForm />', () => {
  // Step 1 tests
  describe('Step 1 - Email and Password', () => {
    test('renders step 1 without crashing', () => {
      const { getByText } = render(<RegistrationForm />)
      expect(getByText("Let's start with your email and password.")).toBeTruthy()
    })

    test('renders Create Account title', () => {
      const { getByText } = render(<RegistrationForm />)
      expect(getByText('Create Account')).toBeTruthy()
    })

    test('has email input field', () => {
      const { getByPlaceholderText } = render(<RegistrationForm />)
      const emailInput = getByPlaceholderText('name@email.com')
      expect(emailInput).toBeTruthy()
    })

    test('has password input field', () => {
      const { getAllByPlaceholderText } = render(<RegistrationForm />)
      const passwordInputs = getAllByPlaceholderText('••••••••')
      expect(passwordInputs.length).toBeGreaterThanOrEqual(1)
    })

    test('has confirm password input field', () => {
      const { getAllByPlaceholderText } = render(<RegistrationForm />)
      const passwordInputs = getAllByPlaceholderText('••••••••')
      expect(passwordInputs.length).toBe(2) // password and confirm password
    })

    test('has Next button on step 1', () => {
      const { getByText } = render(<RegistrationForm />)
      expect(getByText('Next')).toBeTruthy()
    })

    test('has Back button on step 1', () => {
      const { getByText } = render(<RegistrationForm />)
      expect(getByText('Back')).toBeTruthy()
    })

    test('allows typing in email field', async () => {
      const { getByPlaceholderText } = render(<RegistrationForm />)
      const emailInput = getByPlaceholderText('name@email.com')

      await act(async () => {
        fireEvent.changeText(emailInput, 'test@example.com')
      })
      expect(emailInput.props.value).toBe('test@example.com')
    })

    test('allows typing in password field', async () => {
      const { getAllByPlaceholderText } = render(<RegistrationForm />)
      const passwordInputs = getAllByPlaceholderText('••••••••')
      const passwordInput = passwordInputs[0]

      await act(async () => {
        fireEvent.changeText(passwordInput, 'password123')
      })
      expect(passwordInput.props.value).toBe('password123')
    })

    test('allows typing in confirm password field', async () => {
      const { getAllByPlaceholderText } = render(<RegistrationForm />)
      const passwordInputs = getAllByPlaceholderText('••••••••')
      const confirmPasswordInput = passwordInputs[1]

      await act(async () => {
        fireEvent.changeText(confirmPasswordInput, 'password123')
      })
      expect(confirmPasswordInput.props.value).toBe('password123')
    })
  })

  // Navigation tests
  describe('Step Navigation', () => {
    test('pressing Next button attempts to validate step 1', async () => {
      const { getByText } = render(<RegistrationForm />)
      const nextButton = getByText('Next')

      await act(async () => {
        fireEvent.press(nextButton)
      })
      // Should stay on step 1 without valid input (validation fails)
      expect(getByText('Create Account')).toBeTruthy()
    })
  })
})
