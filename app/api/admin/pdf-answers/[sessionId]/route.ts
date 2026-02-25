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
        technicalInterviewEvaluation: true,
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

    const technicalInterview = session.technicalInterviewEvaluation
      ? {
          conductRating: session.technicalInterviewEvaluation.conductRating,
          conductRemarks: session.technicalInterviewEvaluation.conductRemarks,
          disciplineRating: session.technicalInterviewEvaluation.disciplineRating,
          disciplineRemarks: session.technicalInterviewEvaluation.disciplineRemarks,
          knowledgeRating: session.technicalInterviewEvaluation.knowledgeRating,
          knowledgeRemarks: session.technicalInterviewEvaluation.knowledgeRemarks,
          analysisRating: session.technicalInterviewEvaluation.analysisRating,
          analysisRemarks: session.technicalInterviewEvaluation.analysisRemarks,
          communicationRating: session.technicalInterviewEvaluation.communicationRating,
          communicationRemarks: session.technicalInterviewEvaluation.communicationRemarks,
          maturityRating: session.technicalInterviewEvaluation.maturityRating,
          maturityRemarks: session.technicalInterviewEvaluation.maturityRemarks,
          reliabilityRating: session.technicalInterviewEvaluation.reliabilityRating,
          reliabilityRemarks: session.technicalInterviewEvaluation.reliabilityRemarks,
          understandingRating: session.technicalInterviewEvaluation.understandingRating,
          understandingRemarks: session.technicalInterviewEvaluation.understandingRemarks,
          attitudeRating: session.technicalInterviewEvaluation.attitudeRating,
          attitudeRemarks: session.technicalInterviewEvaluation.attitudeRemarks,
          overallRating: session.technicalInterviewEvaluation.overallRating,
          furtherAction: session.technicalInterviewEvaluation.furtherAction,
          suggestedRole: session.technicalInterviewEvaluation.suggestedRole,
          suggestedProject: session.technicalInterviewEvaluation.suggestedProject,
          suggestedLead: session.technicalInterviewEvaluation.suggestedLead,
          others: session.technicalInterviewEvaluation.others,
          interviewerName: session.technicalInterviewEvaluation.interviewerName,
          interviewerPlace: session.technicalInterviewEvaluation.interviewerPlace,
          interviewDate: session.technicalInterviewEvaluation.interviewDate?.toISOString() ?? null,
        }
      : null;

    const pdfBytes = await generateAnswersPDF({
      studentName: session.student.name,
      studentEmail: session.student.email,
      questions,
      technicalInterview,
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
