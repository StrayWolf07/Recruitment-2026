import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateAndSavePDF } from "@/lib/pdfGenerator";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { sessionId } = await params;
  try {
    const session = await db.examSession.findUnique({
      where: { id: sessionId },
      include: {
        student: true,
        examQuestions: { orderBy: { orderIndex: "asc" } },
        answers: true,
        examLogs: { orderBy: { timestamp: "asc" } },
        practicalFiles: true,
      },
    });
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
    if (!session.submittedAt) return Response.json({ error: "Exam not submitted" }, { status: 400 });
    if (session.evaluationStatus !== "evaluated") {
      return Response.json({ error: "Evaluation required before PDF download" }, { status: 400 });
    }

    const roleIds = JSON.parse(session.roleIds) as string[];
    const roles = await db.role.findMany({ where: { id: { in: roleIds } } });
    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

    const answersMap = Object.fromEntries(
      session.answers.map((a) => [
        a.examQuestionId,
        {
          answerText: a.answerText,
          firstOpened: a.firstOpened?.toISOString(),
          lastModified: a.lastModified?.toISOString(),
          totalTimeSpent: a.totalTimeSpent,
          scoreAwarded: a.scoreAwarded,
        },
      ])
    );

    const filesByQuestion: Record<string, { filename: string }[]> = {};
    for (const f of session.practicalFiles ?? []) {
      if (!filesByQuestion[f.questionId]) filesByQuestion[f.questionId] = [];
      filesByQuestion[f.questionId].push({ filename: f.filename });
    }
    const questions = session.examQuestions.map((q) => ({
      questionText: q.questionText,
      section: q.section,
      answerText: answersMap[q.id]?.answerText,
      firstOpened: answersMap[q.id]?.firstOpened,
      lastModified: answersMap[q.id]?.lastModified,
      totalTimeSpent: answersMap[q.id]?.totalTimeSpent ?? 0,
      scoreAwarded: answersMap[q.id]?.scoreAwarded ?? 0,
      attachmentFilenames: (filesByQuestion[q.id] ?? []).map((x) => x.filename),
    }));

    const pdfData = {
      studentName: session.student.name,
      studentEmail: session.student.email,
      college: session.student.college,
      degree: session.student.degree,
      branch: session.student.branch,
      cgpa: session.student.cgpa,
      roleNames: roleIds.map((rid) => roleMap[rid] ?? rid),
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      submittedAt: session.submittedAt.toISOString(),
      theoryTabViolation: session.theoryTabViolation ?? false,
      terminationReason: session.terminationReason ?? null,
      terminatedAt: session.terminatedAt?.toISOString() ?? null,
      totalScore: session.totalScore ?? 0,
      questions,
      blurEvents: session.examLogs.map((l) => ({
        eventType: l.eventType,
        timestamp: l.timestamp.toISOString(),
        duration: l.duration,
      })),
    };

    const url = await generateAndSavePDF(sessionId, pdfData);
    return Response.redirect(new URL(url, request.url));
  } catch (e) {
    console.error(e);
    return Response.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
