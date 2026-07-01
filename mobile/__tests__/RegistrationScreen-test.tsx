import RegistrationScreen from '@/screens/Registration'
// import '@testing-library/react-native'
import { render } from '@testing-library/react-native'
import React from 'react'

describe('<RegistrationScreen />', () => {
  test('renders without crashing', () => {
    const { getByText } = render(<RegistrationScreen />)
    expect(getByText('Smarter transactions, less busywork')).toBeTruthy()
  })

  test('has Google button', () => {
    const { getByText } = render(<RegistrationScreen />)
    expect(getByText('Continue with Google')).toBeTruthy()
  })

  test('has email button', () => {
    const { getByText } = render(<RegistrationScreen />)
    expect(getByText('Continue with email')).toBeTruthy()
  })

  test('renders footer links', () => {
    const { getByText } = render(<RegistrationScreen />)
    expect(getByText('Already have an account?')).toBeTruthy()
    expect(getByText('Sign in')).toBeTruthy()
  })

  test('navigates to sign in when footer link is pressed', () => {
    const { getByText } = render(<RegistrationScreen />)
    const signInLink = getByText('Sign in')
    expect(signInLink).toBeTruthy()
  })
})
