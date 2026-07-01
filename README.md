# Subi Frontend

Monorepo for Subi's web and mobile applications, managed with **pnpm workspaces** and **Turborepo**.

## Repository Structure

```
subi-frontend/
├── web/                     @subi/web -- Next.js 15 web application
│   ├── src/
│   │   ├── app/             Next.js App Router (file-based routing)
│   │   ├── features/        Feature modules (auth, transactions, calendar, chat, ...)
│   │   ├── lib/             Core libraries (api client, auth, sentry, env)
│   │   └── shared/          Shared UI components (shadcn/radix), hooks, utils
│   ├── next.config.ts
│   └── package.json
│
├── mobile/                  @subi/mobile -- Expo SDK 54 React Native app
│   ├── app/                 expo-router (file-based routing)
│   ├── components/          React Native UI components
│   ├── hooks/               Custom hooks (auth, chat, calendar, tasks, ...)
│   ├── screens/             Screen-level components
│   ├── services/            API services (axios-based)
│   ├── stores/              Zustand stores (auth, calendar, chat, user)
│   ├── types/               TypeScript type definitions
│   ├── metro.config.js
│   └── package.json
│
├── packages/
│   ├── types/               @subi/types -- Shared TypeScript types (active)
│   ├── validation/          @subi/validation -- Shared Zod schemas (placeholder)
│   ├── api/                 @subi/api -- Shared API client & hooks (placeholder)
│   ├── config/              @subi/config -- Shared constants (placeholder)
│   └── ui/                  @subi/ui -- Shared UI primitives (placeholder)
│
├── docs/                    Project documentation
├── package.json             Root workspace config
├── pnpm-workspace.yaml      Workspace definition
├── turbo.json               Turborepo task pipeline
├── tsconfig.base.json       Shared TypeScript config
└── .npmrc                   pnpm settings (hoisted for Metro compatibility)
```

## Technology Stack

| Layer         | Web (`web/`)                      | Mobile (`mobile/`)                 |
| ------------- | --------------------------------- | ---------------------------------- |
| Framework     | Next.js 15.5.9                    | Expo SDK 54                        |
| Runtime       | React 19.2.1                      | React Native 0.81.5 + React 19.2.1 |
| Routing       | App Router (file-based)           | expo-router 6.x (file-based)       |
| Data Fetching | React Query 5.x                   | React Query 5.x                    |
| State         | React Query cache                 | React Query + Zustand              |
| Forms         | react-hook-form + zod             | react-hook-form                    |
| HTTP Client   | Axios                             | Axios                              |
| Styling       | Tailwind CSS 3.4 + Radix/shadcn   | React Native StyleSheet            |
| Testing       | Vitest + Testing Library          | Jest + Testing Library             |
| Bundler       | Turbopack (dev) / Webpack (build) | Metro                              |

## Getting Started

### Prerequisites

- **Node.js** >= 22 (use [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** 10.x (use [corepack](https://nodejs.org/api/corepack.html))

```bash
nvm install 22 && nvm use 22
corepack enable && corepack prepare pnpm@10.32.1 --activate
```

### Install & Run

```bash
pnpm install

pnpm dev:web        # http://localhost:3000
pnpm dev:mobile     # http://localhost:8081
```

### Running on Device (Mobile)

```bash
cd mobile
npx expo prebuild   # generates ios/ and android/ (first time only)
pnpm ios            # run on iOS simulator
pnpm android        # run on Android emulator
```

## Commands

| Command           | Description                                 |
| ----------------- | ------------------------------------------- |
| `pnpm dev:web`    | Start Next.js dev server (port 3000)        |
| `pnpm dev:mobile` | Start Expo/Metro dev server (port 8081)     |
| `pnpm build`      | Build all apps and packages                 |
| `pnpm lint`       | Lint all apps                               |
| `pnpm typecheck`  | Type-check all apps and packages            |
| `pnpm clean`      | Remove all build artifacts and node_modules |

### Scoped Commands

```bash
# Install a dependency for a specific app
pnpm add <package> --filter @subi/web
pnpm add <package> --filter @subi/mobile

# Add a root dev dependency
pnpm add -Dw <package>

# Run tests for mobile only
cd mobile && pnpm test
```

## Shared Packages

Both apps share code through workspace packages under `packages/`. Packages export raw TypeScript -- each app transpiles them during its own build (no intermediate compile step needed).

### How It Works

```
@subi/web ─────────┐
                   ├──> @subi/types ──> ApiError, Pagination, TransactionCategory, ...
@subi/mobile ──────┘
```

1. Each package has `"main": "src/index.ts"` pointing to raw `.ts` source
2. Web transpiles via `transpilePackages` in `next.config.ts`
3. Mobile resolves via `nodeModulesPaths` in `metro.config.js`
4. Changes are picked up instantly -- no rebuild, no version bump

### Active: `@subi/types`

Shared type definitions already consumed by both apps:

- `ApiError` -- Standard API error shape
- `TransactionCategory` -- `"PSA" | "LISTING"`
- `TaskStatus` -- `"ON_TRACK" | "OVERDUE" | "DUE_SOON" | "COMPLETED"`
- `Pagination` / `PaginatedResponse<T>` -- Paginated response wrappers

```typescript
import type { ApiError, TransactionCategory } from "@subi/types";
```

### What Can Be Shared

| Shareable (platform-agnostic)                | Not Shareable (platform-specific)      |
| -------------------------------------------- | -------------------------------------- |
| TypeScript types & interfaces                | UI components (Radix vs RN)            |
| Zod validation schemas                       | Navigation logic                       |
| Axios API client & endpoints                 | Storage (localStorage vs AsyncStorage) |
| React Query hooks (useQuery wrappers)        | Platform-specific hooks                |
| Pure utility functions (formatters, parsers) | Styling (Tailwind vs StyleSheet)       |
| Constants, enums, status maps                | Native modules                         |

### Adding a New Shared Package

1. Create folder: `packages/<name>/`
2. Add `package.json` with `"name": "@subi/<name>"` and `"main": "src/index.ts"`
3. Add `tsconfig.json` extending `../../tsconfig.base.json`
4. Write code in `src/`
5. In consuming apps: `pnpm add @subi/<name> --filter @subi/web --workspace`
6. For web: add `@subi/<name>` to `transpilePackages` in `next.config.ts`

## Architecture Decisions

### Why pnpm + hoisted node_modules?

Metro (React Native bundler) does not support pnpm's default symlinked `node_modules`. The `.npmrc` sets `shamefully-hoist=true` and `node-linker=hoisted` to create a flat layout that Metro can resolve.

### Why React 19.2.1 everywhere?

Both apps must use the same React version to avoid silent bugs with hooks and context when dependencies are hoisted. The root `package.json` enforces this via `pnpm.overrides`.

### Why `transpilePackages` for web?

Next.js does not transpile workspace packages by default. Without `transpilePackages`, importing raw `.ts` from `@subi/*` would fail during build.

### Why Metro `watchFolders` + `nodeModulesPaths`?

Metro needs to know the monorepo root exists so it can resolve hoisted dependencies and watch for changes in shared packages.

## Environment Variables

### Web

```bash
cp web/.env.example web/.env.local
```

- `NEXT_PUBLIC_API_BASE_URL` -- Backend API URL
- `NEXT_PUBLIC_APP_ENV` -- `development` | `staging` | `production`

### Mobile

Create `.env` in `mobile/`. See `Config.ts` for expected variables...

## Further Documentation

- [Architecture Details](docs/architecture.md)
- [Getting Started (extended)](docs/getting-started.md)
- [Shared Packages Guide](docs/shared-packages.md)
