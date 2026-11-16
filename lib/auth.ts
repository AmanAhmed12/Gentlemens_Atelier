import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import type { Role } from "@prisma/client";

export const ACCESS_COOKIE = "atelier_access";
export const REFRESH_COOKIE = "atelier_refresh";

export interface AuthPayload {
  sub: string;
  role: Role;
  name: string;
  email: string;
}

function accessSecret() {
  const value = process.env.JWT_ACCESS_SECRET;
  if (!value) throw new Error("JWT_ACCESS_SECRET is not set");
  return value;
}

function refreshSecret() {
  const value = process.env.JWT_REFRESH_SECRET;
  if (!value) throw new Error("JWT_REFRESH_SECRET is not set");
  return value;
}

function accessTtl() {
  return process.env.JWT_ACCESS_TTL ?? "15m";
}

function refreshTtl() {
  return process.env.JWT_REFRESH_TTL ?? "7d";
}

function ttlToSeconds(ttl: string) {
  const match = /^(\d+)\s*([smhd])$/.exec(ttl.trim());
  if (!match) return 15 * 60;
  const amount = Number(match[1]);
  const unit = match[2];
  const multiplier = { s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 60;
  return amount * multiplier;
}

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(payload: AuthPayload) {
  return jwt.sign(payload, accessSecret(), { expiresIn: accessTtl() as jwt.SignOptions["expiresIn"] });
}

export function signRefreshToken(payload: AuthPayload) {
  return jwt.sign(payload, refreshSecret(), { expiresIn: refreshTtl() as jwt.SignOptions["expiresIn"] });
}

export function verifyAccessToken(token: string | undefined): AuthPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, accessSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string | undefined): AuthPayload | null {
  if (!token) return null;
  try {
    return jwt.verify(token, refreshSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

function baseCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSeconds,
  };
}

export function accessCookieOptions() {
  return baseCookieOptions(ttlToSeconds(accessTtl()));
}

export function refreshCookieOptions() {
  return baseCookieOptions(ttlToSeconds(refreshTtl()));
}

export async function setAuthCookies(payload: AuthPayload) {
  const store = await cookies();
  store.set(ACCESS_COOKIE, signAccessToken(payload), accessCookieOptions());
  store.set(REFRESH_COOKIE, signRefreshToken(payload), refreshCookieOptions());
}

export async function clearAuthCookies() {
  const store = await cookies();
  store.delete(ACCESS_COOKIE);
  store.delete(REFRESH_COOKIE);
}

export async function getAuthUser(): Promise<AuthPayload | null> {
  const store = await cookies();
  return verifyAccessToken(store.get(ACCESS_COOKIE)?.value);
}
