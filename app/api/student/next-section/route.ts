import { getStudentSession } from "@/lib/auth";
import { moveToPractical } from "@/lib/examSessionManager";

export async function POST() {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { db } = await import("@/lib/db");
  const active = await db.examSession.findFirst({
    where: { studentId: session.studentId, submittedAt: null },
  });
  if (!active) {
    return Response.json({ error: "No active exam" }, { status: 400 });
  }
  const result = await moveToPractical(active.id, session.studentId);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ success: true, phase: "practical" });
}
