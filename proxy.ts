import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  verifyAccessToken,
  verifyRefreshToken,
  signAccessToken,
  accessCookieOptions,
  type AuthPayload,
} from "@/lib/auth";

const roleGuardedPrefixes: { prefix: string; roles: string[] }[] = [
  { prefix: "/admin", roles: ["ADMIN"] },
  { prefix: "/vendor", roles: ["VENDOR"] },
];

const loginRequiredPrefixes = ["/account", "/checkout", "/orders"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  let user: AuthPayload | null = verifyAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);
  let rotatedAccessToken: string | null = null;

  if (!user) {
    const refreshed = verifyRefreshToken(request.cookies.get(REFRESH_COOKIE)?.value);
    if (refreshed) {
      user = refreshed;
      rotatedAccessToken = signAccessToken(refreshed);
    }
  }

  function withRotatedCookie(response: NextResponse) {
    if (rotatedAccessToken) {
      response.cookies.set(ACCESS_COOKIE, rotatedAccessToken, accessCookieOptions());
    }
    return response;
  }

  const roleGuard = roleGuardedPrefixes.find((guard) => pathname.startsWith(guard.prefix));
  if (roleGuard) {
    if (!user) {
      const url = new URL("/login", request.url);
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }
    if (!roleGuard.roles.includes(user.role)) {
      return withRotatedCookie(NextResponse.redirect(new URL("/", request.url)));
    }
    return withRotatedCookie(NextResponse.next());
  }

  if (loginRequiredPrefixes.some((prefix) => pathname.startsWith(prefix)) && !user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return withRotatedCookie(NextResponse.next());
}

export const config = {
  matcher: ["/admin/:path*", "/vendor/:path*", "/account/:path*", "/checkout/:path*", "/orders/:path*"],
};
