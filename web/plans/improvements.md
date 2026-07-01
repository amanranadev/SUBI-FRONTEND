# Subi Web — Improvement Plan

> Comprehensive codebase analysis and improvement roadmap
> Date: 2026-03-17
> Branch: `subi-new`

---

## Table of Contents

1. [Current Architecture Overview](#current-architecture-overview)
2. [Critical Issues](#critical-issues)
3. [High Priority Improvements](#high-priority-improvements)
4. [Medium Priority Improvements](#medium-priority-improvements)
5. [Low Priority / Nice-to-Have](#low-priority--nice-to-have)
6. [Quick Wins](#quick-wins)
7. [File Reference](#file-reference)

---

## Current Architecture Overview

### Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5.9 (App Router, Turbopack) |
| UI | React 19.2.1 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS + tailwindcss-animate |
| Components | shadcn/ui (40+ Radix-based components) |
| Forms | react-hook-form + @hookform/resolvers + Zod |
| Data Fetching | TanStack React Query 5 + Axios |
| Auth | Custom backend auth (cookie-based tokens) |
| AI | Genkit 1.28.0 + Google GenAI (Gemini 2.5 Flash) |
| Icons | lucide-react |
| Charts | recharts |
| Deployment | Firebase AppHosting |

### Directory Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with providers
│   ├── providers.tsx     # QueryClient + AuthProvider
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   ├── auth/             # Reset, forgot, OAuth callback
│   └── (workspace)/      # Protected route group
│       ├── home/         # PSA upload & processing
│       ├── transactions/ # Transaction list/grid
│       ├── [id]/         # Transaction detail
│       ├── calendar/     # Calendar view
│       ├── tasks/        # Tasks view
│       └── settings/     # Profile, billing, notifications
├── features/             # Feature modules (auth, workspace, transactions, chat, etc.)
├── lib/                  # Core utilities (API client, auth service, env)
├── shared/               # Reusable UI components and hooks
├── types/                # Global TypeScript definitions
└── ai/                   # Genkit AI flows
```

### Strengths

- **Clean feature-based architecture** — each domain is self-contained with views, components, hooks, types
- **Strong type safety** — TypeScript strict mode + Zod schemas at API boundaries
- **Solid form handling** — react-hook-form with Zod resolvers and custom field wrappers
- **Good error extraction** — recursive error parsing in `src/features/auth/utils.ts`
- **Accessible UI** — Radix-based components are accessible by default
- **Proper state management** — React Query for server state, Context for app state
- **Auth lifecycle** — session bootstrap, 401 handling, team resolution, OAuth support

---

## Critical Issues

### 1. No Test Coverage

**Impact:** High — no safety net for refactoring or new features
**Current state:** Zero test files in the entire `src/` directory. No Jest, Vitest, or Playwright configuration.

**What to add:**

- **Unit tests** (Vitest recommended for Next.js):
  - Auth service functions (`src/lib/auth/service.ts`)
  - Error extraction utility (`src/features/auth/utils.ts`)
  - Zod validation schemas (`src/features/auth/schemas.ts`)
  - Auth storage helpers (`src/lib/auth/storage.ts`)
  - PSA API processing (`src/lib/psa-api.ts`)

- **Component tests** (React Testing Library):
  - Form components (login, signup, reset password)
  - TransactionCard rendering
  - ChatWidget message display
  - WorkspaceProvider state management

- **E2E tests** (Playwright):
  - Login/signup flows
  - OAuth callback handling
  - Transaction creation via PSA upload
  - Protected route redirects

**Estimated effort:** 2-3 days for initial setup + core test suite

---

### 2. Build Errors Suppressed in Production

**Impact:** High — real TypeScript and ESLint errors are silently ignored
**File:** `next.config.ts`

```typescript
// Current (dangerous):
typescript: { ignoreBuildErrors: true }
eslint: { ignoreDuringBuilds: true }
```

**Fix:**
1. Remove both `ignoreBuildErrors` and `ignoreDuringBuilds`
2. Run `npx tsc --noEmit` to find all TypeScript errors
3. Run `npx next lint` to find all ESLint issues
4. Fix all errors before merging to main

**Estimated effort:** 1-2 hours to fix existing errors

---

### 3. Firebase Dependency Unused

**Impact:** Medium — adds ~500KB+ to bundle for no reason
**Current state:** `firebase@11.9.1` is in `package.json` dependencies, but authentication is handled entirely by the custom backend at `staging-backend.oksubi.com`. No Firebase Auth, Firestore, or other Firebase SDK calls exist in the codebase.

**Fix:** Either:
- **Remove it** if Firebase is not planned: `npm uninstall firebase`
- **Integrate it** if Firebase Auth is the intended long-term solution

**Estimated effort:** 5 minutes (removal) or 1-2 days (integration)

---

## High Priority Improvements

### 4. Add Next.js Auth Middleware

**Impact:** Prevents flash of unauthorized content, faster redirects
**Current state:** Auth redirects happen client-side inside `AuthProvider` (`src/lib/auth/context.tsx`). Users briefly see protected pages before being redirected.

**Fix:** Create `src/middleware.ts`:
- Check for `subi_auth_token` cookie on every request
- Redirect unauthenticated users to `/login` for protected routes
- Redirect authenticated users away from `/login`, `/signup`
- Use the existing path lists from `src/lib/auth/routes.ts`

**Estimated effort:** 30 minutes

---

### 5. Environment Variable Cleanup

**Impact:** Prevents confusion and misconfiguration
**Current state:** Mixed naming conventions — `.env` had `VITE_*` variables but code reads `NEXT_PUBLIC_*` via `process.env`. The `src/lib/env.ts` file references `NEXT_PUBLIC_API_BASE_URL` and `NEXT_PUBLIC_PSA_API_URL` as fallback.

**Fix:**
- Ensure `.env` only contains `NEXT_PUBLIC_*` variables (done partially)
- Update `src/types/env.d.ts` to include `NEXT_PUBLIC_WEBSOCKET_URL`
- Remove any leftover `VITE_*` references
- Document all required env vars in a `.env.example` file

**Estimated effort:** 15 minutes

---

### 6. Add Error Tracking (Sentry or similar)

**Impact:** Critical for production debugging
**Current state:** The only logging is a single `console.warn` in `src/lib/env.ts`. API errors, rendering errors, and unhandled exceptions are invisible.

**Fix:**
- Install `@sentry/nextjs`
- Configure in `next.config.ts` and `sentry.client.config.ts`
- Wrap API client errors with Sentry captures
- Add React Error Boundaries to key routes
- Track auth failures, API 5xx errors, and unhandled rejections

**Estimated effort:** 1 hour

---

### 7. API Error Messages Are Too Generic

**Impact:** Poor user experience when things go wrong
**Current state:** Many catch blocks show "Something went wrong" or "Failed" without context.

**Examples found in:**
- `src/features/auth/views/login-view.tsx` — uses `extractErrorMessage` which is good, but fallback is generic
- `src/features/workspace/workspace-context.tsx` — processing errors show raw error messages

**Fix:**
- Create an error code mapping for common API responses (400, 403, 404, 409, 422, 500)
- Show actionable messages: "Your session has expired, please log in again" vs "Unauthorized"
- Add retry suggestions where appropriate
- Toast notifications for non-blocking errors

**Estimated effort:** 2-3 hours

---

## Medium Priority Improvements

### 8. Loading Skeletons & Suspense Boundaries

**Impact:** Better perceived performance
**Current state:** Pages go from blank/spinner to full content. No skeleton screens.

**Fix:**
- Add skeleton components for: transaction list/grid, settings pages, transaction detail
- Use Next.js `loading.tsx` files in route segments
- Wrap data-dependent sections with `<Suspense>` and skeleton fallbacks
- The existing `SubiLoading` spinner can be a fallback, but skeletons are preferred

**Estimated effort:** 2-3 hours

---

### 9. WebSocket Integration (or Removal)

**Impact:** Real-time features are configured but not implemented
**Current state:** `NEXT_PUBLIC_WEBSOCKET_URL=wss://staging-backend.oksubi.com/cable` is set in `.env` but no WebSocket client exists in the codebase. The URL suggests ActionCable (Rails).

**Fix — if implementing:**
- Install `@rails/actioncable` or use native WebSocket
- Create a WebSocket provider/hook
- Use for: real-time transaction status updates, chat messages, notifications
- Reconnection logic with exponential backoff

**Fix — if not needed yet:**
- Remove `NEXT_PUBLIC_WEBSOCKET_URL` from `.env`
- Remove from `src/types/env.d.ts`
- Add a TODO/ticket for future implementation

**Estimated effort:** 4-6 hours (implementation) or 5 minutes (removal)

---

### 10. Chat AI Enhancement

**Impact:** Better AI-assisted user experience
**Current state:** `src/ai/flows/receiveAIMessage.ts` is the only Genkit flow. Chat widget sends messages but AI responses appear basic.

**Fix:**
- Add streaming responses for better UX (Genkit supports streaming)
- Provide transaction context to AI (current transaction data, user role)
- Add suggested prompts/quick actions
- Implement conversation history persistence
- Add typing indicators

**Estimated effort:** 1-2 days

---

### 11. Mobile Responsiveness Audit

**Impact:** Users on mobile may have broken layouts
**Current state:** `src/shared/hooks/use-mobile.tsx` exists (768px breakpoint) but usage is limited. Sidebar uses sheet on mobile, which is good. Other pages need verification.

**Pages to audit:**
- Transaction list/grid — does grid collapse to single column?
- Transaction detail — accordion sections on small screens?
- PSA upload dropzone — touch-friendly?
- Settings pages — form layouts on mobile?
- Chat widget — positioning and sizing?

**Estimated effort:** 3-4 hours

---

## Low Priority / Nice-to-Have

### 12. Analytics & User Tracking

**Current state:** No analytics whatsoever.

**Options:**
- PostHog (open-source, self-hostable) — feature flags + analytics
- Mixpanel — event-based tracking
- Google Analytics — basic page views

**Key events to track:**
- PSA document uploads (success/failure)
- Transaction creation and completion rates
- Feature usage (calendar, tasks, chat)
- Auth funnel (signup → onboarding → first transaction)

**Estimated effort:** 1-2 hours for basic setup

---

### 13. Component Documentation

**Current state:** No JSDoc comments on complex components or hooks.

**Priority files for documentation:**
- `src/lib/auth/context.tsx` — AuthProvider state machine
- `src/features/workspace/workspace-context.tsx` — workspace state management
- `src/features/transactions/components/transaction-dialog.tsx` — complex multi-section form
- `src/features/chat/components/chat-widget.tsx` — chat interaction logic

**Estimated effort:** 1-2 hours

---

### 14. Create `.env.example`

**Current state:** No `.env.example` file. New developers won't know what env vars are needed.

**Content:**
```env
# API
NEXT_PUBLIC_API_BASE_URL=https://staging-backend.oksubi.com

# WebSocket (optional — not yet implemented)
NEXT_PUBLIC_WEBSOCKET_URL=wss://staging-backend.oksubi.com/cable
```

**Estimated effort:** 5 minutes

---

### 15. Performance Optimization

**Areas to investigate:**
- Bundle analysis with `@next/bundle-analyzer` — check if tree-shaking is working
- Image optimization — ensure Next.js `<Image>` is used instead of `<img>`
- Font loading — custom `Sty` font loading strategy
- React Query cache tuning — current 30s stale time may be too aggressive or too lenient depending on data freshness needs

**Estimated effort:** 2-4 hours

---

## Quick Wins

| # | Task | Effort | Impact |
|---|---|---|---|
| 1 | Remove unused Firebase dependency | 5 min | Smaller bundle |
| 2 | Create `.env.example` | 5 min | Better DX |
| 3 | Clean up env variable naming | 15 min | Prevents bugs |
| 4 | Add Next.js auth middleware | 30 min | No auth flash |
| 5 | Enable TS/ESLint in build | 1-2 hrs | Catch real errors |
| 6 | Add Sentry error tracking | 1 hr | Production visibility |
| 7 | Add loading skeletons | 2-3 hrs | Better UX |

---

## File Reference

Key files referenced in this analysis:

| File | Purpose |
|---|---|
| `src/lib/auth/context.tsx` | Auth provider, session management |
| `src/lib/auth/service.ts` | Auth API calls (login, signup, etc.) |
| `src/lib/auth/storage.ts` | Cookie-based token storage |
| `src/lib/auth/routes.ts` | Public/protected path definitions |
| `src/lib/auth/types.ts` | Auth TypeScript interfaces |
| `src/lib/api/client.ts` | Axios instance with interceptors |
| `src/lib/env.ts` | Environment variable access |
| `src/lib/psa-api.ts` | PSA document processing API |
| `src/types/env.d.ts` | Env variable type declarations |
| `src/features/auth/schemas.ts` | Zod validation schemas |
| `src/features/auth/utils.ts` | Error extraction utilities |
| `src/features/workspace/workspace-context.tsx` | Workspace state provider |
| `src/features/transactions/components/transaction-dialog.tsx` | Transaction form dialog |
| `src/features/chat/components/chat-widget.tsx` | AI chat widget |
| `src/app/(workspace)/layout.tsx` | Protected workspace shell |
| `src/app/providers.tsx` | React Query + Auth providers |
| `next.config.ts` | Next.js configuration |
| `tailwind.config.ts` | Tailwind theme config |
| `components.json` | shadcn/ui config |
| `apphosting.yaml` | Firebase AppHosting config |
