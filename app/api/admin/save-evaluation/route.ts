import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { sessionId, scores } = body; // scores: { [answerId]: number }

    if (!sessionId || typeof sessionId !== "string") {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }
    if (!scores || typeof scores !== "object") {
      return Response.json({ error: "scores required" }, { status: 400 });
    }

    const session = await db.examSession.findUnique({
      where: { id: sessionId },
      include: { answers: true },
    });
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
    if (!session.submittedAt) return Response.json({ error: "Exam not submitted" }, { status: 400 });

    let totalScore = 0;
    for (const answer of session.answers) {
      const score = scores[answer.id];
      const value = typeof score === "number" ? Math.max(0, Math.round(score)) : 0;
      await db.answer.update({
        where: { id: answer.id },
        data: { scoreAwarded: value },
      });
      totalScore += value;
    }

    await db.examSession.update({
      where: { id: sessionId },
      data: {
        totalScore,
        evaluationStatus: "evaluated",
        evaluatedAt: new Date(),
      },
    });

    return Response.json({ success: true, totalScore });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Save evaluation failed" }, { status: 500 });
  }
}
