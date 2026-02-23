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
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Start exam failed" }, { status: 500 });
  }
}
