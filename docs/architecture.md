# Architecture

## Overview

This monorepo contains the Subi frontend applications and shared packages, managed with **pnpm workspaces** and **Turborepo**.

```
subi-frontend/
  apps/
    web/          Next.js 15 web application (@subi/web)
    mobile/       Expo SDK 54 React Native application (@subi/mobile)
  packages/
    types/        Shared TypeScript types (@subi/types)
    validation/   Shared Zod schemas (@subi/validation) [placeholder]
    api/          Shared API client and hooks (@subi/api) [placeholder]
    config/       Shared constants and config (@subi/config) [placeholder]
    ui/           Shared UI primitives (@subi/ui) [placeholder]
```

## Technology Stack

| Layer | Web | Mobile |
|-------|-----|--------|
| Framework | Next.js 15.5.9 | Expo SDK 54 |
| Runtime | React 19.2.1 | React Native 0.81.5 + React 19.2.1 |
| Routing | App Router (file-based) | expo-router 6.x (file-based) |
| State / Data | React Query 5.x | React Query 5.x + Zustand |
| Forms | react-hook-form + zod | react-hook-form |
| HTTP | Axios | Axios |
| Styling | Tailwind CSS 3.4 + Radix | React Native StyleSheet |
| Testing | Vitest + Testing Library | Jest + Testing Library |
| Bundler | Turbopack (dev) / Webpack (build) | Metro |

## Package Manager

- **pnpm 10.x** with workspaces
- `.npmrc` uses `shamefully-hoist=true` and `node-linker=hoisted` because Metro (React Native bundler) does not support pnpm's default symlinked `node_modules` structure
- React version is aligned to **19.2.1** across all apps via `pnpm.overrides` in the root `package.json`

## Build Orchestration

**Turborepo** manages task execution across the workspace:

- `pnpm dev:web` -- starts the Next.js dev server (port 3000)
- `pnpm dev:mobile` -- starts the Expo/Metro dev server (port 8081)
- `pnpm build` -- builds all apps and packages (respects dependency order)
- `pnpm lint` -- lints all apps
- `pnpm typecheck` -- type-checks all apps
- `pnpm clean` -- removes all build artifacts and node_modules

Turbo caches build outputs (`.next/`, `dist/`, `web-build/`, `android/`, `ios/`) and skips tasks whose inputs haven't changed.

## Dependency Graph

```
@subi/web ────────┐
                  ├──> @subi/types
@subi/mobile ─────┘
```

Shared packages are consumed as workspace dependencies (`"@subi/types": "workspace:*"`). TypeScript resolves directly to the source files (`src/index.ts`) -- no build step is required during development.

## How Shared Packages Work

### Internal Packages Pattern

Shared packages use the **internal packages** pattern:

1. `package.json` points `main` and `types` to `src/index.ts` (raw TypeScript)
2. Each consuming app transpiles the package itself:
   - **Web**: via `transpilePackages` in `next.config.ts`
   - **Mobile**: Metro resolves it automatically via `nodeModulesPaths` in `metro.config.js`
3. No separate build step needed for development -- changes are picked up instantly

### Adding a New Shared Type

1. Add the type to `packages/types/src/`
2. Export it from `packages/types/src/index.ts`
3. Import it in any app: `import type { MyType } from "@subi/types"`
4. That's it -- no rebuild, no version bump

### Adding a New Shared Package

1. Create the folder under `packages/`
2. Add a `package.json` with `"name": "@subi/<name>"` and `"main": "src/index.ts"`
3. Add a `tsconfig.json` extending `../../tsconfig.base.json`
4. Write code in `src/`
5. In consuming apps, add `"@subi/<name>": "workspace:*"` to dependencies
6. For web: add `"@subi/<name>"` to `transpilePackages` in `next.config.ts`
7. Run `pnpm install` from the root
