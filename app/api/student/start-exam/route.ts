import { NextRequest } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { startExam } from "@/lib/examSessionManager";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const profile = await db.studentProfile.findFirst({
      where: { studentId: session.studentId },
      orderBy: { createdAt: "desc" },
    });
    if (!profile) {
      return Response.json({ error: "Complete profile first" }, { status: 400 });
    }
    const roleIds = JSON.parse(profile.roleIds) as string[];
    const active = await db.examSession.findFirst({
      where: { studentId: session.studentId, submittedAt: null },
    });
    if (active) {
      return Response.json({ sessionId: active.id });
    }
    const result = await startExam(session.studentId, roleIds);
    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }
    return Response.json({ sessionId: result.sessionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("START EXAM ERROR:", error);
    if (message.includes("connect") || message.includes("ECONNREFUSED") || message.includes("P1001") || message.includes("P1017")) {
      return Response.json(
        { error: "Database unavailable. Please try again or contact support.", message },
        { status: 503 }
      );
    }
    return Response.json(
      { error: "Start exam failed. Please try again.", message },
      { status: 500 }
    );
  }
}
