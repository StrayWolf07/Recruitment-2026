/**
 * Safe production startup DB check. Does NOT run destructive migrations.
 * Only verifies DB connectivity with SELECT 1 and logs on failure.
 */
export async function register() {
  if (process.env.NODE_ENV !== "production") return;
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { db } = await import("@/lib/db");
    await db.$executeRawUnsafe("SELECT 1");
  } catch (error) {
    console.error("[PRODUCTION DB STARTUP CHECK FAILED]", error);
  }
}
