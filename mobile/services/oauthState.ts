// Separate module to track OAuth state
// This breaks the circular dependency between api.ts and authService.ts

let isGoogleSignInInProgress = false;

export const getGoogleSignInInProgress = () => isGoogleSignInInProgress;

export const setGoogleSignInInProgress = (value: boolean) => {
  isGoogleSignInInProgress = value;
};
