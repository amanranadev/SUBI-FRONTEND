// jest.minimal.setup.ts
import '@testing-library/react-native'

jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
}))

// Mock react-native-gesture-handler
jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View
  return {
    Swipeable: View,
    DrawerLayout: View,
    State: {},
    ScrollView: View,
    Slider: View,
    Switch: View,
    TextInput: View,
    ToolbarAndroid: View,
    ViewPagerAndroid: View,
    DrawerLayoutAndroid: View,
    WebView: View,
    NativeViewGestureHandler: View,
    TapGestureHandler: View,
    FlingGestureHandler: View,
    ForceTouchGestureHandler: View,
    LongPressGestureHandler: View,
    PanGestureHandler: View,
    PinchGestureHandler: View,
    RotationGestureHandler: View,
    RawButton: View,
    BaseButton: View,
    RectButton: View,
    BorderlessButton: View,
    FlatList: View,
    gestureHandlerRootHOC: jest.fn((Component) => Component),
    Directions: {},
    GestureHandlerRootView: View,
  }
})

// Mock expo-audio
jest.mock('expo-audio', () => ({
  AudioModule: {
    setAudioModeAsync: jest.fn(),
    setIsAudioActiveAsync: jest.fn(),
  },
  AudioPlayer: jest.fn().mockImplementation(() => ({
    play: jest.fn(),
    pause: jest.fn(),
    stop: jest.fn(),
    release: jest.fn(),
  })),
  AudioRecorder: jest.fn().mockImplementation(() => ({
    record: jest.fn(),
    stop: jest.fn(),
    getStatus: jest.fn(),
    prepareToRecordAsync: jest.fn(),
  })),
  RecordingPresets: {
    HIGH_QUALITY: {
      ios: {
        audioQuality: 127,
        extension: '.m4a',
        outputFormat: 'aac',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      android: {
        extension: '.m4a',
        outputFormat: 2,
        audioEncoder: 3,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
    },
  },
}))

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
)

jest.mock('@react-navigation/native', () => ({
  useFocusEffect: jest.fn(),
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}))

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
  },
  useFocusEffect: jest.fn(),
}))

// Create shared mock instances
const mockGoogleSignIn = {
  signIn: jest.fn(),
  configure: jest.fn(),
}

const mockLoginWithGoogle = jest.fn()
const mockSetUserFromGoogleLogin = jest.fn()
const mockLoginWithGoogleHook = jest.fn()

// Mock Google Sign-In
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: mockGoogleSignIn,
}))

// Mock auth service
jest.mock('@/services/authService', () => ({
  loginWithGoogle: mockLoginWithGoogle,
  storeToken: jest.fn(),
}))

// Mock user store
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    setUserFromGoogleLogin: mockSetUserFromGoogleLogin,
  }),
}))

// Mock auth store
jest.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    token: null,
  }),
}))

// Mock useAuth hook - but allow individual hooks to be imported for testing
jest.mock('@/hooks/useAuth', () => {
  const actualModule = jest.requireActual('@/hooks/useAuth')
  return {
    ...actualModule,
    useAuth: () => ({
      login: jest.fn(),
      logout: jest.fn(),
      loginWithGoogle: mockLoginWithGoogleHook,
      isLoginPending: false,
      isGoogleLoginPending: false,
      isLoginSuccess: false,
      isLoginError: false,
      isGoogleLoginError: false,
      loginError: null,
      googleLoginError: null,
    }),
  }
})

// Mock components
jest.mock('@/assets/icons/GoogleIcon', () => 'GoogleIcon')
jest.mock('@/components/Wave/hello-wave', () => 'HelloWave')
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}))

// Export mock instances for use in tests
export { mockGoogleSignIn, mockLoginWithGoogle, mockLoginWithGoogleHook, mockSetUserFromGoogleLogin }
