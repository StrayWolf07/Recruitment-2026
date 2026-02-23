import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

const MAX_DELTA_MS = 24 * 60 * 60 * 1000; // 24 hours
const MAX_FUTURE_MS = 60 * 1000; // 1 min

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { sessionId, questionId, action, clientTs } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }
    if (!questionId || typeof questionId !== "string") {
      return Response.json({ error: "questionId required" }, { status: 400 });
    }
    if (action !== "open" && action !== "close") {
      return Response.json({ error: "action must be open or close" }, { status: 400 });
    }

    const examSession = await db.examSession.findFirst({
      where: { id: sessionId, studentId: session.studentId },
    });
    if (!examSession) return Response.json({ error: "Session not found" }, { status: 404 });
    if (examSession.submittedAt) return Response.json({ error: "Exam already submitted" }, { status: 400 });

    const examQuestion = await db.examQuestion.findFirst({
      where: { id: questionId, sessionId },
    });
    if (!examQuestion) return Response.json({ error: "Question not found" }, { status: 404 });

    const clientTsNum = typeof clientTs === "number" ? clientTs : Date.now();
    const now = Date.now();
    if (clientTsNum > now + MAX_FUTURE_MS) {
      return Response.json({ error: "Invalid client timestamp" }, { status: 400 });
    }

    const existing = await db.answer.findFirst({
      where: { sessionId, examQuestionId: questionId },
    });

    if (action === "open") {
      const updates: {
        openedAt?: Date;
        lastOpenedAt: Date;
      } = {
        lastOpenedAt: new Date(clientTsNum),
      };
      if (!existing?.openedAt) {
        updates.openedAt = new Date(clientTsNum);
      }
      await db.answer.upsert({
        where: {
          sessionId_examQuestionId: { sessionId, examQuestionId: questionId },
        },
        create: {
          sessionId,
          examQuestionId: questionId,
          ...updates,
        },
        update: updates,
      });
    } else {
      // close
      const lastOpenedAt = existing?.lastOpenedAt;
      let delta = 0;
      if (lastOpenedAt) {
        delta = Math.max(0, clientTsNum - lastOpenedAt.getTime());
        if (delta > MAX_DELTA_MS) delta = MAX_DELTA_MS;
      }
      const newActiveTimeMs = (existing?.activeTimeMs ?? 0) + delta;
      await db.answer.upsert({
        where: {
          sessionId_examQuestionId: { sessionId, examQuestionId: questionId },
        },
        create: {
          sessionId,
          examQuestionId: questionId,
          lastOpenedAt: null,
          closedAt: new Date(clientTsNum),
          activeTimeMs: newActiveTimeMs,
        },
        update: {
          lastOpenedAt: null,
          closedAt: new Date(clientTsNum),
          activeTimeMs: newActiveTimeMs,
        },
      });
    }

    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Question activity failed" }, { status: 500 });
  }
}
