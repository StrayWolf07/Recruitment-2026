import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return Response.json({ error: "sessionId required" }, { status: 400 });
  }
  const [session, logs] = await Promise.all([
    db.examSession.findUnique({
      where: { id: sessionId },
      select: { totalTabSwitches: true, totalTimeAway: true },
    }),
    db.examLog.findMany({
      where: { sessionId },
      orderBy: { timestamp: "asc" },
    }),
  ]);

  const fullscreenExits = logs.filter((l) => l.eventType === "fullscreen_exit").length;
  const inactivityEvents = logs.filter(
    (l) => l.eventType === "inactive_start" || l.eventType === "inactive_end"
  ).length;

  return Response.json({
    session: session
      ? {
          totalTabSwitches: session.totalTabSwitches,
          totalTimeAway: session.totalTimeAway,
          fullscreenExits,
          inactivityEvents,
        }
      : null,
    logs: logs.map((l) => ({
      id: l.id,
      eventType: l.eventType,
      timestamp: l.timestamp.toISOString(),
      durationAway: l.durationAway ?? l.duration,
    })),
  });
}
