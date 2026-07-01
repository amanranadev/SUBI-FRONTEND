export const AUTH_COOKIE_NAME = "subi_auth_token";

export const AUTH_ROUTES = {
  LOGIN: "/login",
  SIGNUP: "/signup",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  OAUTH_CALLBACK: "/auth/callback",
  LOGOUT: "/logout",
  HOME: "/",
} as const;

export const AUTH_PUBLIC_PATHS = [
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.SIGNUP,
  AUTH_ROUTES.FORGOT_PASSWORD,
  AUTH_ROUTES.RESET_PASSWORD,
  AUTH_ROUTES.OAUTH_CALLBACK,
] as const;

// Add future unauthenticated app pages here
export const APP_PUBLIC_PATHS = [
  "/wait-listing",
  "/team_invitations",
  "/demo",
  "/monitoring", // Sentry tunnel — must bypass auth gate for unauthenticated error reporting
  "/privacy",
  "/terms",
] as const;

const PUBLIC_PATHS: readonly string[] = [
  ...AUTH_PUBLIC_PATHS,
  ...APP_PUBLIC_PATHS,
];

function matchesPath(pathname: string, path: string) {
  if (path === "/") {
    return pathname === "/";
  }

  return pathname === path || pathname.startsWith(`${path}/`);
}

export function isAuthPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => matchesPath(pathname, path));
}
