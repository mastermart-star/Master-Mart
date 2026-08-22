import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED = ["/admin"];

/**
 * OPTIMISTIC redirect only — this is NOT a security boundary.
 *  - It reads the cookie's presence, not its validity.
 *  - Server Actions POST to their own page route, so a matcher exclusion
 *    silently skips them.
 * The real check is requireSession()/requireRole() inside every action,
 * route handler, and protected page.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!PROTECTED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }
  if (!getSessionCookie(request)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
