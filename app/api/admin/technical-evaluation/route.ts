import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return Response.json({ error: "sessionId required" }, { status: 400 });
  try {
    const session = await db.examSession.findUnique({
      where: { id: sessionId, technicalEligible: true },
      include: {
        student: true,
        technicalInterviewEvaluation: true,
      },
    });
    if (!session) return Response.json({ error: "Session not found or not eligible" }, { status: 404 });
    const roleIds = JSON.parse(session.roleIds) as string[];
    const roles = await db.role.findMany({ where: { id: { in: roleIds } } });
    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

    return Response.json({
      session: {
        id: session.id,
        studentName: session.student.name,
        college: session.student.college,
        roles: roleIds.map((rid) => roleMap[rid] ?? rid),
        totalScore: session.totalScore,
      },
      evaluation: session.technicalInterviewEvaluation
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
        : null,
    });
  } catch (err) {
    console.error("Technical evaluation get error:", err);
    return Response.json({ error: "Failed to load" }, { status: 500 });
  }
}
