import type { Role } from "@prisma/client";
import { getAuthUser, type AuthPayload } from "@/lib/auth";

export async function requireUser(): Promise<AuthPayload | null> {
  return getAuthUser();
}

export async function requireRole(roles: Role[]): Promise<AuthPayload | null> {
  const user = await getAuthUser();
  if (!user || !roles.includes(user.role)) return null;
  return user;
}
