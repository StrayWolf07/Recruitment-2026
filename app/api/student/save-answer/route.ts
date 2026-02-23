import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { examQuestionId, answerText, firstOpened, firstTyped, lastModified } = body;
    if (!examQuestionId) {
      return Response.json({ error: "examQuestionId required" }, { status: 400 });
    }
    const eq = await db.examQuestion.findUnique({ where: { id: examQuestionId } });
    if (!eq) return Response.json({ error: "Question not found" }, { status: 404 });
    const examSession = await db.examSession.findFirst({
      where: { id: eq.sessionId, studentId: session.studentId },
    });
    if (!examSession) {
      return Response.json({ error: "Session not found" }, { status: 404 });
    }
    if (examSession.submittedAt) {
      return Response.json({ error: "Exam already submitted" }, { status: 400 });
    }
    const existing = await db.answer.findFirst({
      where: { sessionId: examSession.id, examQuestionId },
    });
    const now = new Date();
    const elapsed = existing && lastModified && existing.lastModified
      ? Math.max(0, Math.floor((new Date(lastModified).getTime() - existing.lastModified.getTime()) / 1000))
      : 0;
    const totalTimeSpent = (existing?.totalTimeSpent ?? 0) + elapsed;

    const data: {
      answerText?: string;
      firstOpened?: Date;
      firstTyped?: Date;
      lastModified?: Date;
      totalTimeSpent?: number;
    } = {};
    if (typeof answerText === "string") data.answerText = answerText;
    if (firstOpened) data.firstOpened = new Date(firstOpened);
    if (firstTyped) data.firstTyped = new Date(firstTyped);
    if (lastModified) data.lastModified = new Date(lastModified);
    data.totalTimeSpent = Math.max(0, totalTimeSpent);

    await db.answer.upsert({
      where: {
        sessionId_examQuestionId: { sessionId: examSession.id, examQuestionId },
      },
      create: {
        sessionId: examSession.id,
        examQuestionId,
        ...data,
      },
      update: data,
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Save answer failed" }, { status: 500 });
  }
}
