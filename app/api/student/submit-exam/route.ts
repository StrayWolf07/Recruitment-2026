import { getStudentSession } from "@/lib/auth";
import { submitExam } from "@/lib/examSessionManager";

export async function POST(request: Request) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { db } = await import("@/lib/db");
  const active = await db.examSession.findFirst({
    where: { studentId: session.studentId, submittedAt: null },
  });
  if (!active) {
    return Response.json({ error: "No active exam" }, { status: 400 });
  }
  let options: { theoryTabViolation?: boolean; terminationReason?: string } | undefined;
  try {
    const text = await request.text();
    const body = text ? (JSON.parse(text) as Record<string, unknown>) : {};
    if (body?.theoryTabViolation === true) {
      options = {
        theoryTabViolation: true,
        terminationReason: (body.terminationReason as string) ?? "Tab switched during theory section",
      };
    }
  } catch {
    // ignore - empty or invalid body
  }
  const result = await submitExam(active.id, session.studentId, options);
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 400 });
  }
  return Response.json({ success: true });
}
