import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

export function logAudit(
  actorId: string,
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, unknown>,
) {
  return prisma.auditLog.create({
    data: { actorId, action, targetType, targetId, metadata: metadata as Prisma.InputJsonValue },
  });
}
