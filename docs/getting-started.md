# Getting Started

## Prerequisites

- **Node.js** >= 22 (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- **pnpm** 10.x (install via [corepack](https://nodejs.org/api/corepack.html))

```bash
# Install Node 22
nvm install 22
nvm use 22

# Enable pnpm via corepack
corepack enable
corepack prepare pnpm@10.32.1 --activate
```

## Initial Setup

```bash
cd subi-frontend

# Install all dependencies (apps + packages)
pnpm install
```

## Running the Apps

### Web (Next.js)

```bash
# From monorepo root
pnpm dev:web

# Or from inside the app
cd web && pnpm dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Mobile (Expo)

```bash
# From monorepo root
pnpm dev:mobile

# Or from inside the app
cd mobile && pnpm dev
```

Opens the Expo dev server at [http://localhost:8081](http://localhost:8081). Press `i` for iOS simulator, `a` for Android emulator.

#### Running on iOS Device/Simulator

```bash
cd mobile

# Generate native iOS project (first time only)
npx expo prebuild --platform ios

# Run on simulator
pnpm ios
```

#### Running on Android Device/Emulator

```bash
cd mobile

# Generate native Android project (first time only)
npx expo prebuild --platform android

# Run on emulator
pnpm android
```

## Common Tasks

### Install a dependency for a specific app

```bash
# Add to web app
pnpm add <package> --filter @subi/web

# Add to mobile app
pnpm add <package> --filter @subi/mobile

# Add a dev dependency to root
pnpm add -Dw <package>
```

### Build everything

```bash
pnpm build
```

### Type-check everything

```bash
pnpm typecheck
```

### Clean all build artifacts

```bash
pnpm clean
```

## Environment Variables

### Web (`web/`)

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp web/.env.example web/.env.local
```

Key variables:
- `NEXT_PUBLIC_API_BASE_URL` -- Backend API URL
- `NEXT_PUBLIC_APP_ENV` -- `development` | `staging` | `production`

### Mobile (`mobile/`)

Create a `.env` file in `mobile/` with the required values. See `Config.ts` for the expected variables.

## Troubleshooting

### Metro can't find a module

Make sure `mobile/metro.config.js` has `watchFolders` pointing to the monorepo root and `nodeModulesPaths` includes both the app-level and root-level `node_modules`.

### pnpm install fails with peer dependency errors

Try `pnpm install --no-frozen-lockfile`. If a specific package causes issues, add it to `pnpm.overrides` in the root `package.json`.

### Expo warns about React version mismatch

This is cosmetic. Expo SDK 54 was built against React 19.1.0 but 19.2.1 is a compatible patch release. The warning is safe to ignore.

### Next.js build fails with "cannot find module @subi/*"

Make sure the package is listed in `transpilePackages` inside `web/next.config.ts`.
