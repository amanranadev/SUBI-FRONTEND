# Subi Web — Component Breakdown Plan

> Detailed analysis of component refactoring opportunities
> Date: 2026-03-17
> Branch: `subi-new`

---

## Table of Contents

1. [Overview](#overview)
2. [Critical Breakdowns](#critical-breakdowns)
3. [High Priority Breakdowns](#high-priority-breakdowns)
4. [Medium Priority Breakdowns](#medium-priority-breakdowns)
5. [Hooks to Extract](#hooks-to-extract)
6. [Shared Patterns Across Auth Views](#shared-patterns-across-auth-views)
7. [Workspace Context Refactor](#workspace-context-refactor)
8. [Summary Table](#summary-table)
9. [Implementation Priority](#implementation-priority)

---

## Overview

The codebase has several large components that handle multiple responsibilities. Breaking these down will improve:

- **Testability** — smaller components are easier to unit test
- **Readability** — each file has a single clear purpose
- **Reusability** — extracted components/hooks can be shared
- **Performance** — smaller components reduce unnecessary re-renders

**Estimated total reduction:** ~2,000 lines through extraction and deduplication.

---

## Critical Breakdowns

### 1. TransactionDetail — 900 lines (LARGEST)

**File:** `src/features/transactions/components/transaction-detail.tsx`

This is a mega-component with 4 tab views, checklist state management, note editing, form fields, and a delete dialog all in one file.

**Current responsibilities:**
- Header with status badge and back navigation
- Details tab (form fields in accordion sections)
- Documents tab (file list with upload)
- Checklist tab (task groups with status toggles, notes, confetti)
- Notes tab (general notes with add/edit/delete)
- Delete confirmation dialog
- Form state management for all editable fields
- Task checklist state (statuses, notes, confetti animation)

**Proposed breakdown:**

```
src/features/transactions/
├── components/
│   ├── transaction-detail.tsx            # ~100 lines (parent, tab routing)
│   ├── transaction-detail-header.tsx     # ~80 lines (status, nav, actions)
│   ├── transaction-details-tab.tsx       # ~135 lines (form accordion)
│   ├── transaction-documents-tab.tsx     # ~62 lines (file list)
│   ├── transaction-checklist-tab.tsx     # ~143 lines (task groups)
│   │   ├── Uses: ChecklistTaskRow       # ~116 lines (single task item)
│   │   └── Uses: ChecklistNoteEditor    # ~35 lines (inline note form)
│   ├── transaction-notes-tab.tsx         # ~96 lines (general notes)
│   │   └── Uses: GeneralNoteCard        # ~58 lines (single note)
│   └── transaction-delete-dialog.tsx     # ~25 lines (confirmation modal)
└── hooks/
    ├── use-task-checklist.ts             # ~60 lines (statuses, notes, confetti)
    ├── use-general-notes.ts              # ~40 lines (notes CRUD)
    └── use-transaction-form.ts           # ~30 lines (field state)
```

**Before:** 1 file, 900 lines
**After:** 11 files, ~100 lines each (parent drops to ~100 lines)

**Parent component after refactor:**
```tsx
// transaction-detail.tsx (~100 lines)
export function TransactionDetail({ transaction }) {
  const [activeTab, setActiveTab] = useState('details');
  const checklist = useTaskChecklist();
  const notes = useGeneralNotes();
  const form = useTransactionForm(transaction);

  return (
    <div>
      <TransactionDetailHeader transaction={transaction} onDelete={...} />
      <TabNav activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'details' && <TransactionDetailsTab form={form} />}
      {activeTab === 'documents' && <TransactionDocumentsTab />}
      {activeTab === 'checklist' && <TransactionChecklistTab {...checklist} />}
      {activeTab === 'notes' && <TransactionNotesTab {...notes} />}
    </div>
  );
}
```

---

### 2. ChatWidget — ~~345 lines~~ DONE

**Status:** Completed on 2026-03-17

**Result:** 345 lines → ~140 lines parent (60% reduction)

**Final structure:**

```
src/features/chat/
├── types.ts                          # Shared Message interface
├── hooks/
│   ├── use-chat.ts                   # Message state, send handler, reset/append
│   ├── use-chat-widget.ts            # Open/close animation with cleanup
│   └── use-chat-scroll.ts            # Auto-scroll + scroll-to-top
└── components/
    ├── chat-widget.tsx               # ~140 lines (orchestrator)
    ├── chat-widget-header.tsx        # Header with property badge + close
    ├── chat-widget-input.tsx         # Textarea + voice toggle + send button
    ├── chat-messages.tsx             # Message list + special action buttons
    ├── chat-message.tsx              # Single message bubble (unchanged)
    ├── chat-input.tsx                # Standalone input for ChatInterface (unchanged)
    └── chat-interface.tsx            # Full-page chat (updated to use shared types/hooks)
```

**What was extracted:**
- `useChat` hook — message state, AI send handler, reset/append helpers
- `useChatWidget` hook — open/close animation state with timer cleanup
- `useChatScroll` hook — auto-scroll on deps change + scroll-to-top
- `ChatWidgetHeader` — header bar with SUBI title, property badge, close button
- `ChatMessages` — message list with loading skeleton + special action buttons
- `ChatWidgetInput` — textarea with auto-resize, voice toggle, send button
- `Message` type — shared across widget, interface, and hooks

---

## High Priority Breakdowns

### 3. TransactionDialog — 366 lines

**File:** `src/features/transactions/components/transaction-dialog.tsx`

Has 4 accordion sections with an identical rendering pattern repeated 4 times.

**Repeated pattern (appears 4x):**
```tsx
<AccordionItem value="summary">
  <AccordionTrigger>
    <div className="flex items-center gap-4">
      <span className="text-xl font-bold tracking-tighter uppercase opacity-40">
        {TITLE}
      </span>
      <SectionStatusBadge isVerified={verifiedSections.summary} />
    </div>
  </AccordionTrigger>
  <AccordionContent className="pt-6 space-y-8">
    {/* Section-specific fields */}
    <SectionCheckmark isVerified={...} onToggle={...} />
  </AccordionContent>
</AccordionItem>
```

**Proposed breakdown:**

```
src/features/transactions/components/
├── transaction-dialog.tsx                  # ~120 lines (dialog shell + accordion)
├── dialog-sections/
│   ├── transaction-summary-section.tsx     # ~30 lines
│   ├── client-information-section.tsx      # ~40 lines
│   ├── property-information-section.tsx    # ~40 lines
│   └── forms-and-tasks-section.tsx         # ~35 lines
├── section-field.tsx                       # ~15 lines (reusable label+input)
├── section-checkmark.tsx                   # ~15 lines (verify toggle)
├── section-status-badge.tsx               # ~8 lines
└── task-card.tsx                           # ~16 lines
```

**Shared section wrapper to eliminate repetition:**
```tsx
// dialog-section-wrapper.tsx
interface DialogSectionProps {
  id: string;
  title: string;
  isVerified: boolean;
  onVerify: () => void;
  children: React.ReactNode;
}

export function DialogSection({ id, title, isVerified, onVerify, children }: DialogSectionProps) {
  return (
    <AccordionItem value={id}>
      <AccordionTrigger>
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold tracking-tighter uppercase opacity-40">
            {title}
          </span>
          <SectionStatusBadge isVerified={isVerified} />
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-6 space-y-8">
        {children}
        <SectionCheckmark isVerified={isVerified} onToggle={onVerify} />
      </AccordionContent>
    </AccordionItem>
  );
}
```

**Before:** 1 file, 366 lines
**After:** 8 files, ~120 lines parent

---

### 4. TasksView — 267 lines

**File:** `src/features/tasks/views/tasks-view.tsx`

Contains deeply nested loops with 75+ lines per task item rendering.

**Current nesting:**
```
TasksView
└── Object.entries(groupedTasks).map()      // date groups
    ├── Date header section                  // ~20 lines
    └── dayTasks.map()                       // task items
        ├── Task item UI                     // ~75 lines (buttons, status, icons)
        └── Inline note editor               // ~35 lines
```

**Proposed breakdown:**

```
src/features/tasks/
├── views/
│   └── tasks-view.tsx           # ~100 lines (layout + loop)
├── components/
│   ├── task-date-group.tsx      # ~20 lines (date header + task list)
│   ├── task-item.tsx            # ~75 lines (single task row)
│   └── task-note-editor.tsx     # ~35 lines (inline note form)
└── hooks/
    └── use-tasks-grouping.ts    # ~20 lines (group tasks by date)
```

**Before:** 1 file, 267 lines
**After:** 5 files, ~100 lines parent

---

### 5. Workspace Context Split

**File:** `src/features/workspace/context.tsx` — 150 lines

Currently mixes UI state with business data in a single context. Every consumer re-renders when any value changes.

**Current state shape (too many concerns):**
```tsx
type WorkspaceContextValue = {
  // Business data
  transactions: Transaction[]
  userRole: "AGENT" | "BROKER"
  brokerInvited: boolean

  // UI preferences
  viewMode: "grid" | "list"
  sortBy: "recent" | "status"

  // Dialog state
  isDialogOpen: boolean
  extractedData: Partial<TransactionFormData> | null

  // File processing
  isProcessingFile: boolean
  processingError: string | null
  fileInputRef: React.RefObject<HTMLInputElement>

  // 10+ setter functions
  // 3+ handler functions
}
```

**Proposed split:**

```
src/features/workspace/
├── context/
│   ├── workspace-data-context.tsx    # ~60 lines (transactions, role, CRUD)
│   └── workspace-ui-context.tsx      # ~40 lines (viewMode, sortBy, dialog)
└── hooks/
    └── use-file-processing.ts        # ~50 lines (upload, PSA processing, error)
```

**WorkspaceDataContext:**
```tsx
type WorkspaceDataContextValue = {
  transactions: Transaction[];
  userRole: "AGENT" | "BROKER";
  brokerInvited: boolean;
  onSaveTransaction: (t: Transaction) => void;
  onUpdateTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}
```

**WorkspaceUIContext:**
```tsx
type WorkspaceUIContextValue = {
  viewMode: "grid" | "list";
  sortBy: "recent" | "status";
  isDialogOpen: boolean;
  setViewMode: (mode: "grid" | "list") => void;
  setSortBy: (sort: "recent" | "status") => void;
  openDialog: (data?: Partial<TransactionFormData>) => void;
  closeDialog: () => void;
}
```

**Benefit:** Components that only need `viewMode` won't re-render when `transactions` changes.

---

## Medium Priority Breakdowns

### 6. ProfileSettings — 150 lines

**File:** `src/features/settings/views/profile-settings.tsx`

Has 8 form fields with identical structure repeated inline.

**Repeated pattern (8 times):**
```tsx
<div className="space-y-4">
  <Label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-4">
    {LABEL}
  </Label>
  <div className="relative flex items-center">
    <Icon className="absolute left-6 size-5 opacity-20" />
    <Input
      value={profile[field]}
      onChange={(e) => setProfile({...profile, [field]: e.target.value})}
      className="h-16 pl-16 rounded-[2rem] bg-black/[0.02] border-black/5 font-bold text-lg"
    />
  </div>
</div>
```

**Extract a `ProfileField` component:**
```tsx
// src/features/settings/components/profile-field.tsx
interface ProfileFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  type?: string;
}

export function ProfileField({ label, value, onChange, icon: Icon, type = "text" }: ProfileFieldProps) {
  return (
    <div className="space-y-4">
      <Label className="text-[10px] font-bold uppercase tracking-widest opacity-30 ml-4">
        {label}
      </Label>
      <div className="relative flex items-center">
        <Icon className="absolute left-6 size-5 opacity-20" />
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-16 pl-16 rounded-[2rem] bg-black/[0.02] border-black/5 font-bold text-lg"
        />
      </div>
    </div>
  );
}
```

**Usage after refactor:**
```tsx
<ProfileField label="First Name" value={profile.firstName} onChange={v => setProfile({...profile, firstName: v})} icon={User} />
<ProfileField label="Last Name" value={profile.lastName} onChange={v => setProfile({...profile, lastName: v})} icon={User} />
<ProfileField label="Email" value={profile.email} onChange={v => setProfile({...profile, email: v})} icon={Mail} />
// ... 5 more
```

**Before:** 150 lines
**After:** ~60 lines + 25-line ProfileField component

---

### 7. CalendarView — 178 lines

**File:** `src/features/calendar/views/calendar-view.tsx`

Linear structure that could benefit from splitting the header, day grid, and cell rendering.

**Proposed breakdown:**

```
src/features/calendar/
├── views/
│   └── calendar-view.tsx         # ~60 lines (layout)
└── components/
    ├── calendar-header.tsx       # ~35 lines (month nav, today button)
    ├── calendar-day-headers.tsx  # ~12 lines (Sun-Sat row)
    └── calendar-cell.tsx         # ~40 lines (single day with events)
```

---

### 8. TransactionsPage — 261 lines

**File:** `src/app/(workspace)/transactions/page.tsx`

Contains an inline `BrokerOnboarding` component (~67 lines) and filtering/sorting logic.

**Proposed extraction:**

```
src/features/transactions/
├── components/
│   ├── broker-onboarding-modal.tsx    # ~67 lines (move from page)
│   └── transaction-filters.tsx        # ~45 lines (view mode + sort toggles)
└── hooks/
    └── use-transaction-filtering.ts   # ~20 lines (filter + sort logic)
```

---

## Hooks to Extract

| Hook | Source File | Lines Saved | Purpose |
|---|---|---|---|
| `useTaskChecklist` | transaction-detail.tsx | ~60 | Task status toggles, notes, confetti |
| `useGeneralNotes` | transaction-detail.tsx | ~40 | General notes CRUD |
| `useTransactionForm` | transaction-detail.tsx | ~30 | Editable field state |
| ~~`useChat`~~ | ~~chat-widget.tsx~~ | ~~~60~~ | ~~Message state, send handler~~ DONE |
| ~~`useChatWidget`~~ | ~~chat-widget.tsx~~ | ~~~40~~ | ~~Open/close animation~~ DONE |
| ~~`useChatScroll`~~ | ~~chat-widget.tsx~~ | ~~~20~~ | ~~Auto-scroll to bottom~~ DONE |
| `useTasksGrouping` | tasks-view.tsx | ~20 | Group tasks by date (useMemo) |
| `useFileProcessing` | workspace-context.tsx | ~50 | PSA upload + processing |
| `useTransactionFiltering` | transactions/page.tsx | ~20 | Filter + sort transactions |
| `useAuthForm` | auth views (shared) | ~15 | Error state, loading, isBusy |

**Total lines extracted to hooks:** ~355 lines

---

## Shared Patterns Across Auth Views

**Files affected:**
- `login-view.tsx` (174 lines)
- `signup-view.tsx` (150 lines)
- `forgot-password-view.tsx` (128 lines)
- `reset-password-view.tsx` (180 lines)

**Repeated patterns:**

### Auth Layout Wrapper (appears 4x)
```tsx
<div className="fixed inset-0 flex min-h-dvh w-screen items-center overflow-y-auto bg-card font-body">
  <div className="w-full h-full flex flex-col p-2">
    <div className="h-10 w-auto">
      <SubiTextLogo className="h-full w-auto" variant="s-only" />
    </div>
    <div className="flex w-full flex-1 justify-center max-w-{X} flex-col gap-4 p-4 sm:p-8 mx-auto">
      {children}
    </div>
  </div>
</div>
```

**Extract:** `AuthLayout` component (~15 lines, saves ~60 lines total)

### Error/Success Alert (appears 4x)
```tsx
{submitError && (
  <Alert variant="danger" className="px-3 py-2">
    <AlertDescription>{submitError}</AlertDescription>
  </Alert>
)}
```

**Extract:** `AuthAlert` component (~8 lines, saves ~24 lines total)

### Footer Links (appears 4x)
```tsx
<div className="mt-10 flex flex-col gap-2 text-center">
  <Txt as="p" size="sm" tone="muted">
    Already have an account? <Link href="/login">Log in</Link>
  </Txt>
</div>
```

**Extract:** `AuthFooterLink` component (~10 lines, saves ~30 lines total)

### Auth Form Hook (appears 4x)
```tsx
const [submitError, setSubmitError] = useState<string | null>(null);
const { status, isLoading } = useAuth();
const isBusy = isLoading || form.formState.isSubmitting;
```

**Extract:** `useAuthForm` hook (~15 lines, saves ~40 lines total)

**Total savings across auth views:** ~154 lines (~24% reduction)

---

## Summary Table

| Component | Current Lines | After Refactor | Files Created | Reduction |
|---|---|---|---|---|
| TransactionDetail | 900 | ~100 (parent) | 11 | 89% |
| ~~ChatWidget~~ | ~~345~~ | ~~140 (parent)~~ | ~~7~~ | ~~60%~~ DONE |
| TransactionDialog | 366 | ~120 (parent) | 8 | 67% |
| TasksView | 267 | ~100 (parent) | 5 | 63% |
| WorkspaceContext | 150 | ~60 (per context) | 3 | 60% |
| ProfileSettings | 150 | ~60 (parent) | 2 | 60% |
| Auth Views (4 files) | 632 | ~478 | 4 shared | 24% |
| CalendarView | 178 | ~60 (parent) | 4 | 66% |
| TransactionsPage | 261 | ~140 (parent) | 3 | 46% |
| **Totals** | **~3,249** | **~1,268** | **46 files** | **~61%** |

---

## Implementation Priority

### Phase 1 — Critical (do first)
1. Break down `TransactionDetail` (900 lines) into tabs + hooks
2. ~~Break down `ChatWidget` (345 lines) into hooks + sub-components~~ DONE (2026-03-17)
3. Extract `useTaskChecklist` hook (reusable across transaction views)

### Phase 2 — High (do next)
4. Split `WorkspaceContext` into data + UI contexts
5. Break down `TransactionDialog` sections
6. Extract shared auth view components (`AuthLayout`, `AuthAlert`, `AuthFooterLink`)

### Phase 3 — Medium (polish)
7. Extract `TasksView` sub-components
8. Extract `ProfileField` for settings
9. Extract `BrokerOnboarding` from transactions page
10. Break down `CalendarView`

### Phase 4 — Maintenance
11. Create remaining hooks (`useFileProcessing`, `useTransactionFiltering`)
12. Move utility functions to proper locations (`getCurrentView` to utils)
13. ~~Consolidate duplicate chat input logic~~ DONE (shared `Message` type + `useChatScroll` hook now used by both `ChatWidget` and `ChatInterface`)
