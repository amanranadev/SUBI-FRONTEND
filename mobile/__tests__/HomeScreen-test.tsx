import HomeScreen from '@/app/(authenticated)/home'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, render } from '@testing-library/react-native'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import voiceWebSocketService from '@/services/voiceWebSocketService'
import { emailService } from '@/services/emailService'
import { MessageComposedData } from '@/types'

// Mock bottom sheet
jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    BottomSheetModalProvider: ({ children }: { children: React.ReactNode }) => children,
    BottomSheetModal: React.forwardRef(({ children }: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        present: jest.fn(),
        dismiss: jest.fn(),
        close: jest.fn(),
      }))
      return React.createElement(View, null, children)
    }),
    BottomSheetView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
    BottomSheetBackdrop: () => null,
    BottomSheetScrollView: ({ children }: { children: React.ReactNode }) =>
      React.createElement(View, null, children),
  }
})

// Mock user store
jest.mock('@/stores/userStore', () => ({
  useUserStore: () => ({
    user: {
      id: '1',
      email: 'guilherme@example.com',
      name: 'Guilherme',
      firstName: 'Guilherme',
      lastName: 'Danzer',
      nickname: 'guilherme',
      picture: '',
      subscription: 'FREE',
      onboardingCompleted: false,
      startedOnboarding: false,
      teams: [],
    },
  }),
}))

// Mock calendar store
jest.mock('@/stores/calendarStore', () => ({
  useCalendarStore: () => ({
    isAppleCalendarConnected: false,
    isGoogleCalendarConnected: false,
  }),
}))

// Mock TaskDetailContext
jest.mock('@/contexts/TaskDetailContext', () => ({
  useTaskDetailContext: () => ({
    taskDetailOpen: false,
    setTaskDetailOpen: jest.fn(),
    selectedTask: null,
    setSelectedTask: jest.fn(),
  }),
  TaskDetailProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock voice WebSocket service
const mockOnMessageComposed = jest.fn();
let messageComposedCallback: ((data: MessageComposedData) => void) | null = null;

jest.mock('@/services/voiceWebSocketService', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    disconnect: jest.fn(),
    startRecording: jest.fn(),
    stopRecording: jest.fn(),
    sendTextMessage: jest.fn(),
    setOnConnectedCallback: jest.fn(),
    setOnDisconnectedCallback: jest.fn(),
    setOnMessageCallback: jest.fn(),
    setOnAudioCallback: jest.fn(),
    setOnRecordingCallback: jest.fn(),
    setOnSpeakingCallback: jest.fn(),
    setOnProcessingCallback: jest.fn(),
    setOnResponseReadyCallback: jest.fn(),
    setOnSessionIdCallback: jest.fn(),
    isConnected: jest.fn().mockReturnValue(false),
    onMessageComposed: jest.fn((callback) => {
      messageComposedCallback = callback;
      return () => {
        messageComposedCallback = null;
      };
    }),
    offMessageComposed: jest.fn(),
    onTaskCreated: jest.fn().mockReturnValue(() => {}),
    offTaskCreated: jest.fn(),
    onTaskUpdated: jest.fn().mockReturnValue(() => {}),
    offTaskUpdated: jest.fn(),
    onTaskDeleted: jest.fn().mockReturnValue(() => {}),
    offTaskDeleted: jest.fn(),
  },
}))

// Mock useTasks hook
jest.mock('@/hooks/useTasks', () => ({
  useTasks: () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  }),
  useCreateTask: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useUpdateTask: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useDeleteTask: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
  useTaskManagement: () => ({
    tasks: [],
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    createTask: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
    completeTask: jest.fn(),
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
  }),
}))

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    logout: jest.fn(),
  }),
}))

// Mock calendar service
jest.mock('@/services/calendarService', () => ({
  getCalendarEvents: jest.fn().mockResolvedValue([]),
  createCalendarEvent: jest.fn(),
  updateCalendarEvent: jest.fn(),
  deleteCalendarEvent: jest.fn(),
}))

// Mock email service
const mockSendEmail = jest.fn();
jest.mock('@/services/emailService', () => ({
  emailService: {
    sendEmail: (...args: any[]) => mockSendEmail(...args),
  },
}))

// Mock Google calendar service
jest.mock('@/services/googleCalendarService', () => ({
  deleteGoogleCalendarEvent: jest.fn(),
}))

// Mock useCalendar hook
jest.mock('@/hooks/useCalendar', () => ({
  useCalendar: () => ({
    events: [],
    calendarEvents: [],
    isLoading: false,
    refetch: jest.fn(),
    fetchMonthEvents: jest.fn(),
    updateCalendarEvent: jest.fn(),
    deleteCalendarEvent: jest.fn(),
  }),
}))

// Mock TaskList component
jest.mock('@/components/TaskList/TaskList', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'task-list' }),
  }
})

// Mock TodaysTasksCard component
jest.mock('@/components/TodaysTasksCard/TodaysTasksCard', () => {
  const React = require('react')
  const { View, Text } = require('react-native')
  return {
    __esModule: true,
    default: ({ encouragementMessage }: any) =>
      React.createElement(
        View,
        { testID: 'todays-tasks-card' },
        React.createElement(Text, null, encouragementMessage || 'Keep going!')
      ),
  }
})

// Mock CalendarModal
jest.mock('@/components/CalendarModal', () => {
  const React = require('react')
  const { View } = require('react-native')
  const CalendarModal = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
    }))
    return React.createElement(View, { testID: 'calendar-modal' })
  })
  return {
    __esModule: true,
    default: CalendarModal,
  }
})

// Mock TaskDetailModal
jest.mock('@/components/TaskDetail', () => {
  const React = require('react')
  const { View } = require('react-native')
  const TaskDetailModal = React.forwardRef((props: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({
      present: jest.fn(),
      dismiss: jest.fn(),
    }))
    return React.createElement(View, { testID: 'task-detail-modal' })
  })
  return {
    __esModule: true,
    TaskDetailModal,
    default: TaskDetailModal,
  }
})

// Mock WeekCalendar
jest.mock('@/components/WeekCalendar', () => {
  const React = require('react')
  const { View } = require('react-native')
  return {
    __esModule: true,
    default: () => React.createElement(View, { testID: 'week-calendar' }),
  }
})

// Mock EmailDraftModal
const mockEmailDraftModalPresent = jest.fn();
const mockEmailDraftModalDismiss = jest.fn();
let emailDraftModalProps: any = null;
jest.mock('@/components/EmailDraftModal/EmailDraftModal', () => {
  const React = require('react')
  const { View } = require('react-native')
  const EmailDraftModal = React.forwardRef((props: any, ref: any) => {
    emailDraftModalProps = props;
    React.useImperativeHandle(ref, () => ({
      present: mockEmailDraftModalPresent,
      dismiss: mockEmailDraftModalDismiss,
    }))
    return React.createElement(View, { testID: 'email-draft-modal' })
  })
  return {
    __esModule: true,
    EmailDraftModal,
  }
})

// Mock EmailReviewModal
const mockEmailReviewModalPresent = jest.fn();
const mockEmailReviewModalDismiss = jest.fn();
let emailReviewModalProps: any = null;
jest.mock('@/components/EmailReviewModal/EmailReviewModal', () => {
  const React = require('react')
  const { View } = require('react-native')
  const EmailReviewModal = React.forwardRef((props: any, ref: any) => {
    emailReviewModalProps = props;
    React.useImperativeHandle(ref, () => ({
      present: mockEmailReviewModalPresent,
      dismiss: mockEmailReviewModalDismiss,
    }))
    return React.createElement(View, { testID: 'email-review-modal' })
  })
  return {
    __esModule: true,
    EmailReviewModal,
  }
})

// Mock EmailSentModal
const mockEmailSentModalPresent = jest.fn();
const mockEmailSentModalDismiss = jest.fn();
let emailSentModalProps: any = null;
jest.mock('@/components/EmailSentModal/EmailSentModal', () => {
  const React = require('react')
  const { View } = require('react-native')
  const EmailSentModal = React.forwardRef((props: any, ref: any) => {
    emailSentModalProps = props;
    React.useImperativeHandle(ref, () => ({
      present: mockEmailSentModalPresent,
      dismiss: mockEmailSentModalDismiss,
    }))
    return React.createElement(View, { testID: 'email-sent-modal' })
  })
  return {
    __esModule: true,
    EmailSentModal,
  }
})

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    dispatch: jest.fn(),
  }),
  useFocusEffect: jest.fn((callback) => callback()),
  DrawerActions: {
    toggleDrawer: jest.fn(),
  },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 0, height: 0 },
        insets: { top: 0, left: 0, right: 0, bottom: 0 },
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </SafeAreaProvider>
  )
}

describe('<HomeScreen />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    messageComposedCallback = null;
    emailReviewModalProps = null;
    emailDraftModalProps = null;
    emailSentModalProps = null;
    mockEmailReviewModalPresent.mockClear();
    mockEmailReviewModalDismiss.mockClear();
    mockEmailDraftModalPresent.mockClear();
    mockEmailDraftModalDismiss.mockClear();
    mockEmailSentModalPresent.mockClear();
    mockEmailSentModalDismiss.mockClear();
    mockSendEmail.mockClear();
  })

  test('renders without crashing', () => {
    expect(() =>
      render(<HomeScreen />, { wrapper: createWrapper() })
    ).not.toThrow()
  })

  test('renders week calendar', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() })
    expect(getByTestId('week-calendar')).toBeTruthy()
  })

  test('renders todays tasks card', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() })
    expect(getByTestId('todays-tasks-card')).toBeTruthy()
  })

  test('renders task list', () => {
    const { getByTestId } = render(<HomeScreen />, { wrapper: createWrapper() })
    expect(getByTestId('task-list')).toBeTruthy()
  })

  describe('Component Structure Tests', () => {
    test('renders all main components', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      })

      expect(getByTestId('week-calendar')).toBeTruthy()
      expect(getByTestId('todays-tasks-card')).toBeTruthy()
      expect(getByTestId('task-list')).toBeTruthy()
    })

    test('renders modal components', () => {
      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      })

      expect(getByTestId('calendar-modal')).toBeTruthy()
      expect(getByTestId('task-detail-modal')).toBeTruthy()
    })
  })

  describe('Renders without errors', () => {
    test('component mounts successfully', () => {
      const { toJSON } = render(<HomeScreen />, { wrapper: createWrapper() })
      expect(toJSON()).toBeTruthy()
    })

    test('multiple renders work correctly', () => {
      const { unmount } = render(<HomeScreen />, { wrapper: createWrapper() })
      unmount()

      const { getByTestId } = render(<HomeScreen />, {
        wrapper: createWrapper(),
      })
      expect(getByTestId('week-calendar')).toBeTruthy()
    })
  })

  describe('Email Integration', () => {
    test('subscribes to onMessageComposed on mount', () => {
      render(<HomeScreen />, { wrapper: createWrapper() });

      expect(voiceWebSocketService.onMessageComposed).toHaveBeenCalled();
      expect(messageComposedCallback).not.toBeNull();
    });

    test('unsubscribes from onMessageComposed on unmount', () => {
      const { unmount } = render(<HomeScreen />, { wrapper: createWrapper() });

      const unsubscribe = (voiceWebSocketService.onMessageComposed as jest.Mock).mock.results[0].value;
      expect(typeof unsubscribe).toBe('function');

      unmount();

      // After unmount, callback should be cleared
      expect(messageComposedCallback).toBeNull();
    });

    test('ignores non-email messages (SMS)', () => {
      render(<HomeScreen />, { wrapper: createWrapper() });

      const smsMessage: MessageComposedData = {
        message_id: "msg-sms-1",
        contact: {
          id: "contact-1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
        },
        message_type: "sms",
        subject: "",
        body: "SMS message",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(smsMessage);
        }
      });

      expect(mockEmailReviewModalPresent).not.toHaveBeenCalled();
    });

    test('ignores non-email messages (call)', () => {
      render(<HomeScreen />, { wrapper: createWrapper() });

      const callMessage: MessageComposedData = {
        message_id: "msg-call-1",
        contact: {
          id: "contact-1",
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
        },
        message_type: "call",
        subject: "",
        body: "",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(callMessage);
        }
      });

      expect(mockEmailReviewModalPresent).not.toHaveBeenCalled();
    });

    test('handles email message: constructs MessageComposedResponse, sets emailReviewData, presents EmailReviewModal', () => {
      render(<HomeScreen />, { wrapper: createWrapper() });

      const emailMessage: MessageComposedData = {
        message_id: "msg-email-1",
        contact: {
          id: "contact-1",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: null,
        },
        message_type: "email",
        subject: "Meeting Tomorrow",
        body: "Let's meet at 2 PM",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(emailMessage);
        }
      });

      expect(mockEmailReviewModalPresent).toHaveBeenCalled();
    });

    test('handleEmailReviewSend dismisses EmailReviewModal and presents EmailDraftModal', () => {
      render(<HomeScreen />, { wrapper: createWrapper() });

      // First, trigger email message to set up state
      const emailMessage: MessageComposedData = {
        message_id: "msg-email-1",
        contact: {
          id: "contact-1",
          name: "Jane Smith",
          email: "jane@example.com",
        },
        message_type: "email",
        subject: "Test",
        body: "Test body",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(emailMessage);
        }
      });

      expect(mockEmailReviewModalPresent).toHaveBeenCalled();
      expect(emailReviewModalProps).not.toBeNull();
      expect(emailReviewModalProps.onSend).toBeDefined();

      // Call the onSend handler
      act(() => {
        emailReviewModalProps.onSend();
      });

      expect(mockEmailReviewModalDismiss).toHaveBeenCalled();
      expect(mockEmailDraftModalPresent).toHaveBeenCalled();
    });

    test('handleEmailMakeChanges dismisses EmailReviewModal and clears emailReviewData', () => {
      render(<HomeScreen />, { wrapper: createWrapper() });

      // Trigger email message
      const emailMessage: MessageComposedData = {
        message_id: "msg-email-1",
        contact: {
          id: "contact-1",
          name: "John Doe",
          email: "john@example.com",
        },
        message_type: "email",
        subject: "Test",
        body: "Test body",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(emailMessage);
        }
      });

      expect(mockEmailReviewModalPresent).toHaveBeenCalled();
      expect(emailReviewModalProps).not.toBeNull();
      expect(emailReviewModalProps.onMakeChanges).toBeDefined();

      // Call the onMakeChanges handler
      act(() => {
        emailReviewModalProps.onMakeChanges();
      });

      expect(mockEmailReviewModalDismiss).toHaveBeenCalled();
    });

    test('handleEmailDraftSend does nothing if message_id is missing', async () => {
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
      
      render(<HomeScreen />, { wrapper: createWrapper() });

      // Set up emailReviewData without message_id
      const emailMessage: MessageComposedData = {
        message_id: "", // Empty message_id
        contact: {
          id: "contact-1",
          name: "John Doe",
          email: "john@example.com",
        },
        message_type: "email",
        subject: "Test",
        body: "Test body",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(emailMessage);
        }
      });

      // Trigger the send flow
      act(() => {
        if (emailReviewModalProps?.onSend) {
          emailReviewModalProps.onSend();
        }
      });

      // Try to send from draft modal
      act(() => {
        if (emailDraftModalProps?.onSend) {
          emailDraftModalProps.onSend();
        }
      });

      // Should not call emailService
      expect(mockSendEmail).not.toHaveBeenCalled();
      
      mockConsoleError.mockRestore();
    });

    test('handleEmailDraftSend (success path): calls emailService.sendEmail, presents EmailSentModal, dismisses EmailDraftModal, clears emailReviewData', async () => {
      const mockResponse = {
        draft: {
          id: "draft-123",
          recipient_name: "Jane Smith",
          recipient_email: "jane@example.com",
          recipient_phone: null,
          message_type: "email" as const,
          subject: "Meeting Tomorrow",
          body: "Let's meet at 2 PM",
          status: "sent" as const,
          recipient_type: "buyer" as const,
          contact_id: "contact-1",
          transaction_id: null,
          created_at: "2025-01-15T10:00:00Z",
          expires_at: "2025-01-16T10:00:00Z",
        },
        message: "Email sent successfully",
      };

      mockSendEmail.mockResolvedValue(mockResponse);

      render(<HomeScreen />, { wrapper: createWrapper() });

      // Trigger email message
      const emailMessage: MessageComposedData = {
        message_id: "msg-email-123",
        contact: {
          id: "contact-1",
          name: "Jane Smith",
          email: "jane@example.com",
        },
        message_type: "email",
        subject: "Meeting Tomorrow",
        body: "Let's meet at 2 PM",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(emailMessage);
        }
      });

      expect(mockEmailReviewModalPresent).toHaveBeenCalled();

      // Navigate to draft modal
      act(() => {
        if (emailReviewModalProps?.onSend) {
          emailReviewModalProps.onSend();
        }
      });

      expect(mockEmailDraftModalPresent).toHaveBeenCalled();

      // Send email from draft modal
      await act(async () => {
        if (emailDraftModalProps?.onSend) {
          await emailDraftModalProps.onSend();
        }
      });

      expect(mockSendEmail).toHaveBeenCalledWith("msg-email-123");
      expect(mockEmailSentModalPresent).toHaveBeenCalled();
      expect(mockEmailDraftModalDismiss).toHaveBeenCalled();
    });

    test('handleEmailDraftSend handles API error without crashing', async () => {
      const mockError = new Error("API Error");
      mockSendEmail.mockRejectedValue(mockError);
      const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

      render(<HomeScreen />, { wrapper: createWrapper() });

      const emailMessage: MessageComposedData = {
        message_id: "msg-error",
        contact: {
          id: "contact-1",
          name: "John Doe",
          email: "john@example.com",
        },
        message_type: "email",
        subject: "Test",
        body: "Test body",
        requires_confirmation: true,
      };

      act(() => {
        if (messageComposedCallback) {
          messageComposedCallback(emailMessage);
        }
      });

      expect(mockEmailReviewModalPresent).toHaveBeenCalled();

      // Navigate to draft modal
      act(() => {
        if (emailReviewModalProps?.onSend) {
          emailReviewModalProps.onSend();
        }
      });

      // Try to send email - should handle error gracefully
      await act(async () => {
        if (emailDraftModalProps?.onSend) {
          await emailDraftModalProps.onSend();
        }
      });

      expect(mockSendEmail).toHaveBeenCalledWith("msg-error");
      expect(mockEmailSentModalPresent).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalled();

      mockConsoleError.mockRestore();
    });

    test('handleCloseEmailSentModal dismisses EmailSentModal', () => {
      render(<HomeScreen />, { wrapper: createWrapper() });

      expect(emailSentModalProps).not.toBeNull();
      expect(emailSentModalProps.onClose).toBeDefined();

      // Call the onClose handler
      act(() => {
        emailSentModalProps.onClose();
      });

      expect(mockEmailSentModalDismiss).toHaveBeenCalled();
    });
  })
})
