import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { AUTH_COOKIE_NAME, AUTH_ROUTES, isAuthPublicPath } from "@/lib/auth/routes"

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const isPublicAuthRoute = isAuthPublicPath(pathname)

  if (!token && !isPublicAuthRoute) {
    const loginUrl = new URL(AUTH_ROUTES.LOGIN, request.url)
    const returnTo = `${pathname}${search}`

    if (returnTo !== AUTH_ROUTES.HOME) {
      loginUrl.searchParams.set("returnTo", returnTo)
    }

    return NextResponse.redirect(loginUrl)
  }

  if (token && pathname === AUTH_ROUTES.LOGIN) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.HOME, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
