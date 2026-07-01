import FormTextInput from '@/components/FormTextInput/FormTextInput'
// import '@testing-library/react-native'
import { fireEvent, render } from '@testing-library/react-native'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Text, TouchableOpacity, View } from 'react-native'

jest.mock('react-hook-form', () => ({
  useForm: jest.fn(),
  useController: jest.fn(),
}))

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

const mockUseForm = useForm as jest.MockedFunction<typeof useForm>
const mockUseController = require('react-hook-form')
  .useController as jest.MockedFunction<any>

describe('<FormTextInput />', () => {
  const mockField = {
    ref: jest.fn(),
    value: '',
    onChange: jest.fn(),
    onBlur: jest.fn(),
  }

  const mockFieldState = {
    invalid: false,
    isTouched: false,
    isDirty: false,
  }

  const mockFormState = {
    touchedFields: {},
    dirtyFields: {},
  }

  const mockControl = {}

  beforeEach(() => {
    mockUseController.mockReturnValue({
      field: mockField,
      fieldState: mockFieldState,
      formState: mockFormState,
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('renders without crashing', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
      />
    )
    expect(getByTestId('test-input')).toBeTruthy()
  })

  test('renders with correct props', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        placeholder="Enter text"
        keyboardType="email-address"
      />
    )

    const input = getByTestId('test-input')
    expect(input.props.placeholder).toBe('Enter text')
    expect(input.props.keyboardType).toBe('email-address')
  })

  test('renders with icon when icon prop is provided', () => {
    const TestIcon = () => <View testID="test-icon">Icon</View>

    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        icon={<TestIcon />}
      />
    )

    expect(getByTestId('test-input')).toBeTruthy()
    expect(getByTestId('test-icon')).toBeTruthy()
  })

  test('renders without icon container when no icon prop', () => {
    const { queryByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
      />
    )

    expect(queryByTestId('test-input-icon-button')).toBeNull()
  })

  test('calls field.onChange when text changes', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
      />
    )

    const input = getByTestId('test-input')
    fireEvent.changeText(input, 'new text')

    expect(mockField.onChange).toHaveBeenCalledWith('new text')
  })

  test('calls field.onBlur when input loses focus', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
      />
    )

    const input = getByTestId('test-input')
    fireEvent(input, 'blur')

    expect(mockField.onBlur).toHaveBeenCalledTimes(1)
  })

  test('displays field value correctly', () => {
    const testValue = 'test value'
    mockUseController.mockReturnValue({
      field: { ...mockField, value: testValue },
      fieldState: mockFieldState,
      formState: mockFormState,
    })

    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
      />
    )

    const input = getByTestId('test-input')
    expect(input.props.value).toBe(testValue)
  })

  test('applies correct styles for input without icon', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
      />
    )

    const input = getByTestId('test-input')
    // Style is an array, so flatten and check individual properties
    const flatStyle = Array.isArray(input.props.style)
      ? Object.assign({}, ...input.props.style.filter(Boolean))
      : input.props.style
    expect(flatStyle).toMatchObject({
      borderWidth: 1,
      borderRadius: 6,
      padding: 16,
      fontSize: 16,
    })
  })

  test('applies correct styles for input with icon', () => {
    const TestIcon = () => <View>Icon</View>

    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        icon={<TestIcon />}
      />
    )

    const input = getByTestId('test-input')
    const styles = Array.isArray(input.props.style)
      ? input.props.style
      : [input.props.style]

    expect(styles).toContainEqual(
      expect.objectContaining({
        flex: 1,
        padding: 16,
        fontSize: 16,
        backgroundColor: 'transparent',
        borderWidth: 0,
      })
    )
  })

  test('handles secureTextEntry prop correctly', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        secureTextEntry={true}
      />
    )

    const input = getByTestId('test-input')
    expect(input.props.secureTextEntry).toBe(true)
  })

  test('handles autoCapitalize prop correctly', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        autoCapitalize="none"
      />
    )

    const input = getByTestId('test-input')
    expect(input.props.autoCapitalize).toBe('none')
  })

  test('handles autoCorrect prop correctly', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        autoCorrect={false}
      />
    )

    const input = getByTestId('test-input')
    expect(input.props.autoCorrect).toBe(false)
  })

  test('handles placeholder and placeholderTextColor props', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        placeholder="Enter your email"
        placeholderTextColor="#999"
      />
    )

    const input = getByTestId('test-input')
    expect(input.props.placeholder).toBe('Enter your email')
    expect(input.props.placeholderTextColor).toBe('#999')
  })

  test('renders icon with TouchableOpacity when provided', () => {
    const mockOnPress = jest.fn()
    const TestIcon = (props: any) => (
      <TouchableOpacity
        testID="touchable-icon"
        onPress={mockOnPress}
        {...props}>
        <Text>Icon</Text>
      </TouchableOpacity>
    )

    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        icon={<TestIcon />}
      />
    )

    expect(getByTestId('touchable-icon')).toBeTruthy()
  })

  test('passes all TextInput props correctly', () => {
    const { getByTestId } = render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        multiline={true}
        numberOfLines={3}
        maxLength={100}
        editable={false}
      />
    )

    const input = getByTestId('test-input')
    expect(input.props.multiline).toBe(true)
    expect(input.props.numberOfLines).toBe(3)
    expect(input.props.maxLength).toBe(100)
    expect(input.props.editable).toBe(false)
  })

  test('handles form validation rules', () => {
    const mockRules = { required: 'This field is required' }

    render(
      <FormTextInput
        name="testField"
        // @ts-expect-error mockControl is a test double, not a real Control object
        control={mockControl}
        testID="test-input"
        rules={mockRules}
      />
    )

    expect(mockUseController).toHaveBeenCalledWith({
      name: 'testField',
      control: mockControl,
      rules: mockRules,
    })
  })
})
