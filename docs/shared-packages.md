# Shared Packages

## Current Packages

### `@subi/types` (active)

Shared TypeScript type definitions used by both web and mobile apps.

**Location:** `packages/types/`

**Currently exports:**
- `ApiError` -- Standard error shape returned by the backend
- `TransactionCategory` -- `"PSA" | "LISTING"` union type
- `TaskStatus` -- `"ON_TRACK" | "OVERDUE" | "DUE_SOON" | "COMPLETED"` union type
- `Pagination` -- Standard pagination metadata shape
- `PaginatedResponse<T>` -- Generic paginated API response wrapper

**Usage:**

```typescript
// In any app
import type { ApiError, TransactionCategory } from "@subi/types";
```

### Placeholder Packages (not yet active)

These packages exist as empty scaffolds, ready for future extraction:

| Package | Purpose | When to Extract |
|---------|---------|-----------------|
| `@subi/validation` | Shared Zod schemas | When both apps validate the same data shapes |
| `@subi/api` | Shared Axios client, endpoints, React Query hooks | When API layer is standardized |
| `@subi/config` | Shared constants, environment helpers | When config patterns are aligned |
| `@subi/ui` | Shared UI primitives | Last -- web uses Radix/shadcn, mobile uses RN components |

## Extraction Playbook

Follow this process when moving code from an app into a shared package:

### Step 1: Identify the Candidate

- The type/function/hook must be used in **both** apps
- The shapes must be **identical or nearly identical**
- Start with types, then validation, then logic -- never UI first

### Step 2: Create the Shared Code

```bash
# Example: adding a Zod schema to @subi/validation
```

1. Write the code in `packages/<name>/src/`
2. Export it from `packages/<name>/src/index.ts`
3. Add a `tsconfig.json` if the package doesn't have one yet

### Step 3: Wire the Dependency

```bash
# Add the package as a dependency
pnpm add @subi/<name> --filter @subi/web --workspace
pnpm add @subi/<name> --filter @subi/mobile --workspace
```

For web, also add to `transpilePackages` in `next.config.ts`:

```typescript
transpilePackages: [
  // ...existing packages
  '@subi/<name>',
],
```

### Step 4: Update Imports

Replace the local definition with an import from the shared package:

```typescript
// Before
export interface ApiError {
  message: string;
  status?: number;
}

// After
import type { ApiError } from "@subi/types";
export type { ApiError };
```

Re-exporting (`export type { ApiError }`) preserves backward compatibility for files that already import from the local module.

### Step 5: Verify

```bash
# Type-check everything
pnpm typecheck

# Run both apps
pnpm dev:web
pnpm dev:mobile
```

## Rules

1. **No premature abstractions** -- Only extract code that is genuinely shared and stable
2. **Types first, logic second, UI last** -- Follow the dependency pyramid
3. **Keep apps working at every step** -- Each extraction should be a safe, reversible change
4. **Re-export for compatibility** -- When removing a local type, re-export from the same file to avoid breaking imports
5. **One package at a time** -- Don't extract multiple packages in the same PR
