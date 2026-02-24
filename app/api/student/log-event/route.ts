import { getStudentSession } from "@/lib/auth";
import { db } from "@/lib/db";

// Tab-switch logging removed. Theory-section protection (auto-submit + disqualify) is handled
// by the frontend calling submit-exam with theoryTabViolation when visibility is lost in theory.
// This endpoint remains for backwards compatibility; it does not write to the database.
export async function POST() {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const active = await db.examSession.findFirst({
    where: { studentId: session.studentId, submittedAt: null },
  });
  if (!active) return Response.json({ error: "No active exam" }, { status: 400 });
  return Response.json({ success: true });
}
