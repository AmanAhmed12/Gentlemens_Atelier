import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  REFRESH_COOKIE,
  ACCESS_COOKIE,
  verifyRefreshToken,
  signAccessToken,
  accessCookieOptions,
} from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  const store = await cookies();
  const payload = verifyRefreshToken(store.get(REFRESH_COOKIE)?.value);
  if (!payload) {
    return NextResponse.json({ error: "Session expired, please log in again" }, { status: 401 });
  }

  store.set(ACCESS_COOKIE, signAccessToken(payload), accessCookieOptions());

  return NextResponse.json({ user: { id: payload.sub, name: payload.name, email: payload.email, role: payload.role } });
}
