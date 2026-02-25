import { PrismaClient } from "@prisma/client";

// Prisma uses process.env.DATABASE_URL only. Do not hardcode any database URL.
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
