import Button from '@/components/Button/Button'
import '@testing-library/react-native'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'

describe('<Button />', () => {
  test('renders without crashing', () => {
    const { getByText } = render(
      <Button text="Test Button" onPress={() => {}} />
    )
    expect(getByText('Test Button')).toBeTruthy()
  })

  test('renders with icon', () => {
    const { getByText } = render(
      <Button text="Test Button" onPress={() => {}} icon={<div>Icon</div>} />
    )
    expect(getByText('Test Button')).toBeTruthy()
  })

  test('calls onPress when pressed', () => {
    const mockOnPress = jest.fn()
    const { getByText } = render(
      <Button text="Test Button" onPress={mockOnPress} />
    )

    const button = getByText('Test Button')
    fireEvent.press(button)

    expect(mockOnPress).toHaveBeenCalledTimes(1)
  })

  test('is disabled when disabled prop is true', () => {
    const { getByTestId } = render(
      <Button
        text="Test Button"
        onPress={() => {}}
        disabled={true}
        testID="test-button"
      />
    )

    const button = getByTestId('test-button')
    expect(button.props.accessibilityState?.disabled).toBe(true)
  })

  test('is enabled when disabled prop is false', () => {
    const { getByTestId } = render(
      <Button
        text="Test Button"
        onPress={() => {}}
        disabled={false}
        testID="test-button"
      />
    )

    const button = getByTestId('test-button')
    expect(button.props.accessibilityState?.disabled).toBe(false)
  })

  test('applies custom styles', () => {
    const customStyle = { backgroundColor: 'red' }
    const { getByTestId } = render(
      <Button
        text="Test Button"
        onPress={() => {}}
        style={customStyle}
        testID="test-button"
      />
    )

    const button = getByTestId('test-button')
    expect(button.props.style).toEqual(expect.objectContaining(customStyle))
  })

  test('applies custom text styles', () => {
    const customTextStyle = { color: 'blue' }
    const { getByText } = render(
      <Button
        text="Test Button"
        onPress={() => {}}
        textStyle={customTextStyle}
      />
    )

    const text = getByText('Test Button')
    expect(text.props.style).toContain(customTextStyle)
  })

  test('supports testID prop', () => {
    const { getByTestId } = render(
      <Button text="Test Button" onPress={() => {}} testID="test-button" />
    )

    expect(getByTestId('test-button')).toBeTruthy()
  })

  test('supports variant prop', () => {
    const { getByText } = render(
      <Button text="Test Button" onPress={() => {}} variant="black" />
    )

    expect(getByText('Test Button')).toBeTruthy()
  })
})
