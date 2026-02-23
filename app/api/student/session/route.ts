import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const active = await db.examSession.findFirst({
    where: { studentId: session.studentId, submittedAt: null },
  });
  if (!active) {
    return Response.json({ error: "No active exam" }, { status: 404 });
  }
  const [questions, answers] = await Promise.all([
    db.examQuestion.findMany({
      where: { sessionId: active.id },
      orderBy: { orderIndex: "asc" },
    }),
    db.answer.findMany({
      where: { sessionId: active.id },
    }),
  ]);
  const answersMap: Record<string, { answerText?: string; firstOpened?: string; firstTyped?: string; lastModified?: string; totalTimeSpent: number }> = {};
  for (const a of answers) {
    answersMap[a.examQuestionId] = {
      answerText: a.answerText ?? undefined,
      firstOpened: a.firstOpened?.toISOString(),
      firstTyped: a.firstTyped?.toISOString(),
      lastModified: a.lastModified?.toISOString(),
      totalTimeSpent: a.totalTimeSpent,
    };
  }
  return Response.json({
    sessionId: active.id,
    phase: active.phase,
    startTime: active.startTime.toISOString(),
    endTime: active.endTime.toISOString(),
    questions: questions.map((q) => ({
      id: q.id,
      section: q.section,
      questionType: q.questionType,
      questionText: q.questionText,
      orderIndex: q.orderIndex,
    })),
    answers: answersMap,
  });
}
