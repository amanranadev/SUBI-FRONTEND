# OkSubi

React Native (Expo) mobile app with task management, voice chat, and team collaboration. Uses file-based routing with expo-router.

## Prerequisites

- **Node.js 22** (via [nvm](https://github.com/nvm-sh/nvm)). From the project root run `nvm use` (uses `.nvmrc`). Check with `node -v`.
- **Java 17 (JDK 17)** for Android builds (e.g. [Eclipse Temurin](https://adoptium.net/) or [Oracle JDK 17](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html)). Check with `java -version`.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Run the app

   **iOS (simulator or device)** — full native features including Google Sign-In:

   ```bash
   npx expo run:ios
   ```

   **Android (emulator or device)** — full native features including Google Sign-In:

   ```bash
   npx expo run:android
   ```

   **Web**

   ```bash
   npx expo start --web
   ```

   **Dev server only** (e.g. to connect an existing dev build):

   ```bash
   npx expo start
   ```

## Important: Google Sign-In and Expo Go

Google Sign-In uses native code and **does not work in Expo Go**. Use a development build:

- **iOS:** `npx expo run:ios` (builds and runs the app with native modules).
- **Android:** `npx expo run:android` (builds and runs the app with native modules).

Do not open the project in the standalone Expo Go app if you need Google Sign-In; use the app produced by `npx expo run:ios` or `npx expo run:android` (or an EAS build).

## Commands (npx)

| Command | Description |
| ------- | ----------- |
| `npx expo start` | Start dev server (Metro). Use with a dev build or Expo Go for web. |
| `npx expo run:ios` | Prebuild (if needed), build native iOS app, and run on simulator/device. |
| `npx expo run:android` | Prebuild (if needed), build native Android app, and run on emulator/device. |
| `npx expo start --web` | Start dev server and open in browser. |
| `npx expo prebuild` | Generate `ios/` and `android/` from config and plugins. Run automatically by `run:ios` / `run:android` when folders are missing. |
| `npx expo prebuild --clean` | Delete existing `ios/` and `android/`, then regenerate. Use when native config or linking is broken. |

**Other:** `npm run lint` (ESLint), `npm test` (Jest).

## Troubleshooting

**Android build fails with “Process 'command 'node'' finished with non-zero exit value 1”**

Gradle runs Expo’s autolinking via Node; Node 12 is too old (Expo needs Node 14+). Use Node 22 in the same terminal where you run the build:

```bash
nvm use          # or: nvm install 22 && nvm use
npx expo run:android
```

Confirm with `node -v` (should be v22.x.x) before running the Android build.

## Learn more

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
