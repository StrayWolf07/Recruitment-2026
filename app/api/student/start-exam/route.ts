import { NextRequest } from "next/server";
import { getStudentSession } from "@/lib/auth";
import { startExam } from "@/lib/examSessionManager";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getStudentSession();
    if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

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
  } catch (error: unknown) {
    console.error("START EXAM ERROR:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
