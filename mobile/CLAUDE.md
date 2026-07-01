# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OkSubi is a React Native mobile application built with Expo. The app features task management, real-time voice chat with AI assistance via WebSocket, and team collaboration features. Uses file-based routing with expo-router.

## Development Commands

### Running the App
- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS device/simulator
- `npm run web` - Run in web browser

### Code Quality
- `npm run lint` - Run ESLint on the codebase
- `npm test` - Run Jest tests in watch mode

### Testing
- Run all tests: `npm test`
- Tests are located in `__tests__/` directory
- Test configuration: `jest.config.js` and `jest.setup.ts`

## Architecture

### Routing Structure
Uses Expo Router with file-based routing:
- `/app/_layout.tsx` - Root layout with QueryClientProvider and navigation stack
- `/app/(authenticated)/*` - Protected routes requiring authentication
- `/app/index.tsx` - Landing/login screen
- `/app/register.tsx` & `/app/registerForm.tsx` - Registration flows
- `/app/forgotPassword.tsx` - Password recovery

Authenticated routes are nested under `app/(authenticated)/` and include home, settings, transactions, and voice chat screens.

### State Management
- **Zustand stores** (in `/stores/`):
  - `authStore.ts` - JWT token and authentication state (persisted to AsyncStorage)
  - `userStore.ts` - Current user data and profile (persisted to AsyncStorage)
- **TanStack Query** - Server state, data fetching, and caching (configured in `services/queryClient.ts`)

### Custom Hooks
Located in `/hooks/`:
- `useAuth.ts` - Authentication operations (login, signup, logout)
- `useTasks.ts` - Task CRUD operations with React Query
- `useComments.ts` - Comment management for tasks
- `useTransactions.ts` - Financial transaction operations
- `useSubscriptions.ts` - Subscription management
- `useTeams.ts` - Team operations
- `useUser.ts` - User profile management
- `useVoiceCommands.ts` - Voice command processing integration
- `useWakeWordDetection.ts` - Wake word detection for voice features

### Services Layer
Located in `/services/`:
- `api.ts` - Axios instance with request/response interceptors for authentication and error handling
- `authService.ts` - Authentication API calls and token management
- `voiceWebSocketService.ts` - WebSocket connection for real-time voice chat with AI (subscribes to ActionCable channels)
- `taskService.ts`, `commentService.ts`, `transactionService.ts`, etc. - Domain-specific API calls
- `speechToTextService.ts` - Voice recognition integration
- `navigationService.ts` - Programmatic navigation helper
- `queryClient.ts` - TanStack Query configuration

### Environment Configuration
- `Config.ts` - Centralized configuration for API_URL, WEBSOCKET_URL, and environment variables
- `config/api.ts` - API URL configuration with platform-specific fallbacks (Android uses 10.0.2.2, iOS uses local IP)
- Environment variables are accessed via `process.env.EXPO_PUBLIC_*`
- Platform-specific defaults for local development (Android emulator vs iOS simulator)

### Component Organization
Components in `/components/` are organized by feature:
- Each component typically has its own directory with component file and styles
- `AuthGuard.tsx` - Route protection component that wraps authenticated screens
- Voice-related components: `VoiceModal/`, `VoiceWebSocketButton.tsx`, `VoiceListeningModal/`, `VoiceMessageModal/`
- Task management: `TaskList/`, `TaskDetail/`, `TaskComments/`, `CreateTaskModal/`
- UI components: `Button/`, `FormTextInput/`, `Calendar/`, `Header/`, `UserAvatar/`

### Screens
Presentation layer in `/screens/` organized by feature area:
- `Login/`, `Registration/`, `ForgotPassword/` - Authentication flows
- `Home/` - Main dashboard
- `SubiVoiceChat/` - Real-time AI voice chat interface
- `Transactions/`, `TransactionsDetails/` - Financial management
- `Settings/` - User settings and preferences

### WebSocket Architecture
The voice chat feature uses ActionCable WebSocket protocol:
- Connects to Rails backend WebSocket endpoint (`/cable`)
- Subscribes to channels for real-time bidirectional communication
- Handles multiple message types: session management, audio streaming, command execution, job status
- Manages audio recording and playback with expo-audio
- State callbacks for UI updates (speaking, recording, processing states)

## Important Implementation Details

### Authentication Flow
1. User logs in via `useAuth` hook → `authService.login()`
2. JWT token stored in `authStore` (persisted to AsyncStorage)
3. `api.ts` interceptor automatically adds `Authorization: Bearer <token>` to requests
4. 401 responses trigger automatic logout and redirect to login
5. `AuthGuard` component wraps protected routes to enforce authentication

### API Interceptors
- Request interceptor adds JWT token to headers (except public endpoints like `/auth/login`, `/auth/signup`)
- Response interceptor handles 401 errors by clearing auth state and redirecting to login
- All API errors are normalized to `ApiError` type with message, status, and code

### Voice WebSocket Service
- Singleton service managing WebSocket connection lifecycle
- Audio recording uses expo-audio with m4a format at 16kHz
- Audio chunks sent as base64-encoded strings
- Receives audio responses for playback
- Manages speaking/recording states with callbacks for UI updates
- Handles session management and subscription to channels

### Platform Considerations
- Android emulator networking: uses `10.0.2.2` to access host machine
- iOS simulator/device: uses local network IP (e.g., `192.168.0.10`)
- WebSocket and API URLs configured differently per platform in development mode
- Production/staging builds use hosted backend URLs

## Common Patterns

### Making API Requests
Use the domain-specific hooks (e.g., `useTasks`, `useComments`) which wrap TanStack Query for automatic caching, refetching, and optimistic updates. These hooks use the services layer which uses the configured `apiClient` from `services/api.ts`.

### Adding New Authenticated Routes
1. Create route file in `app/(authenticated)/` directory
2. Add screen component in `/screens/`
3. Route is automatically protected by `AuthGuard` in the layout

### Using WebSocket for Voice
Access the singleton `voiceWebSocketService` instance, call `connect()`, subscribe to callbacks for state changes, and use `startRecording()`/`stopRecording()` for voice input.
