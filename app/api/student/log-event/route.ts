import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

const VALID_EVENT_TYPES = [
  "window_blur",
  "window_focus",
  "visibility_hidden",
  "visibility_visible",
  "fullscreen_exit",
  "pagehide",
  "inactive_start",
  "inactive_end",
  "blur",
  "focus",
] as const;

const FOCUS_LIKE_EVENTS = new Set([
  "window_focus",
  "visibility_visible",
  "inactive_end",
  "focus",
]);

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const {
      event_type,
      eventType,
      timestamp,
      duration_away,
      durationAway,
      question_id,
      questionId,
      sessionId: bodySessionId,
    } = body;
    const eventTypeVal = event_type ?? eventType;
    const durationVal = duration_away ?? durationAway;
    const examQuestionId = question_id ?? questionId;

    if (!eventTypeVal || typeof eventTypeVal !== "string") {
      return Response.json({ error: "event_type required" }, { status: 400 });
    }
    if (!VALID_EVENT_TYPES.includes(eventTypeVal as (typeof VALID_EVENT_TYPES)[number])) {
      return Response.json({ error: "Invalid event_type" }, { status: 400 });
    }

    const active = await db.examSession.findFirst({
      where: { studentId: session.studentId, submittedAt: null },
    });
    if (!active) return Response.json({ error: "No active exam" }, { status: 400 });

    const durationMs = typeof durationVal === "number" ? Math.max(0, Math.floor(durationVal)) : null;
    const ts = timestamp ? new Date(timestamp) : new Date();

    const lastLog = await db.examLog.findFirst({
      where: { sessionId: active.id },
      orderBy: { createdAt: "desc" },
    });
    if (lastLog) {
      const sameEvent = lastLog.eventType === eventTypeVal;
      const timeDiff = Math.abs(ts.getTime() - lastLog.timestamp.getTime());
      if (sameEvent && timeDiff < 2000) {
        return Response.json({ success: true, duplicate: true });
      }
    }

    await db.examLog.create({
      data: {
        sessionId: active.id,
        eventType: eventTypeVal,
        timestamp: ts,
        durationAway: durationMs,
        examQuestionId: typeof examQuestionId === "string" ? examQuestionId : null,
      },
    });

    let tabIncrement = 0;
    let timeAwayIncrementSec = 0;
    if (FOCUS_LIKE_EVENTS.has(eventTypeVal) && durationMs != null && durationMs >= 0) {
      tabIncrement = 1;
      timeAwayIncrementSec = Math.floor(durationMs / 1000);
    }

    const updateData: {
      totalTabSwitches?: { increment: number };
      totalTimeAway?: { increment: number };
    } = {};
    if (tabIncrement > 0) updateData.totalTabSwitches = { increment: tabIncrement };
    if (timeAwayIncrementSec > 0) updateData.totalTimeAway = { increment: timeAwayIncrementSec };
    if (Object.keys(updateData).length > 0) {
      await db.examSession.update({
        where: { id: active.id },
        data: updateData,
      });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Log event failed" }, { status: 500 });
  }
}
