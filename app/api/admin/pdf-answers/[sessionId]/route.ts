import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateAnswersPDF } from "@/lib/pdfGenerator";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
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
        practicalFiles: true,
      },
    });
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
    if (!session.submittedAt) return Response.json({ error: "Exam not submitted" }, { status: 400 });

    const answersMap = Object.fromEntries(
      session.answers.map((a) => [a.examQuestionId, a.answerText])
    );
    const filesByQuestion: Record<string, string[]> = {};
    for (const f of session.practicalFiles ?? []) {
      if (!filesByQuestion[f.questionId]) filesByQuestion[f.questionId] = [];
      filesByQuestion[f.questionId].push(f.filename);
    }

    const questions = session.examQuestions.map((q) => ({
      questionText: q.questionText,
      section: q.section,
      answerText: answersMap[q.id] ?? null,
      attachmentFilenames: filesByQuestion[q.id] ?? [],
    }));

    const pdfBytes = await generateAnswersPDF({
      studentName: session.student.name,
      studentEmail: session.student.email,
      questions,
    });

    const filename = `answers_${sessionId}.pdf`;
    const body = Buffer.from(pdfBytes);
    return new Response(body, {
      headers: {
        "Content-Type": "application/pdf",
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "PDF generation failed" }, { status: 500 });
  }
}
