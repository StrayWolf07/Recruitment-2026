import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Debug endpoint: returns ExamSession table columns from information_schema.
 * Use to verify production DB has technicalEligible (and other columns) in sync with Prisma schema.
 */
export async function GET() {
  try {
    const rows = await db.$queryRawUnsafe<{ column_name: string }[]>(
      `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'ExamSession' ORDER BY ordinal_position`
    );
    const columnNames = rows.map((r) => r.column_name);
    return NextResponse.json({ tableName: "ExamSession", columnNames });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("db-check error:", message, error);
    return NextResponse.json(
      { error: "db-check failed", message },
      { status: 500 }
    );
  }
}
