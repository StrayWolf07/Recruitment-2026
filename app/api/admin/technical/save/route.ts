import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const BEHAVIOR_RATINGS = ["VERY_GOOD", "GOOD", "AVERAGE", "POOR"] as const;
const OVERALL_RATINGS = ["Excellent", "Very Good", "Good", "Average"];
const FURTHER_ACTIONS = ["Hold", "Next Round", "Suitable", "Not Suitable"];

export async function POST(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { sessionId, ...rest } = body;
    if (!sessionId || typeof sessionId !== "string") {
      return Response.json({ error: "sessionId required" }, { status: 400 });
    }

    const session = await db.examSession.findUnique({
      where: { id: sessionId, technicalEligible: true },
    });
    if (!session) return Response.json({ error: "Session not found or not eligible" }, { status: 404 });

    const mapRating = (v: unknown) =>
      v && typeof v === "string" && BEHAVIOR_RATINGS.includes(v as (typeof BEHAVIOR_RATINGS)[number])
        ? (v as (typeof BEHAVIOR_RATINGS)[number])
        : null;
    const str = (v: unknown) => (v != null && typeof v === "string" ? v.trim() || null : null);
    const date = (v: unknown) => {
      if (v == null) return null;
      if (typeof v === "string") {
        const d = new Date(v);
        return isNaN(d.getTime()) ? null : d;
      }
      return null;
    };

    const data = {
      sessionId,
      conductRating: mapRating(rest.conductRating),
      conductRemarks: str(rest.conductRemarks),
      disciplineRating: mapRating(rest.disciplineRating),
      disciplineRemarks: str(rest.disciplineRemarks),
      knowledgeRating: mapRating(rest.knowledgeRating),
      knowledgeRemarks: str(rest.knowledgeRemarks),
      analysisRating: mapRating(rest.analysisRating),
      analysisRemarks: str(rest.analysisRemarks),
      communicationRating: mapRating(rest.communicationRating),
      communicationRemarks: str(rest.communicationRemarks),
      maturityRating: mapRating(rest.maturityRating),
      maturityRemarks: str(rest.maturityRemarks),
      reliabilityRating: mapRating(rest.reliabilityRating),
      reliabilityRemarks: str(rest.reliabilityRemarks),
      understandingRating: mapRating(rest.understandingRating),
      understandingRemarks: str(rest.understandingRemarks),
      attitudeRating: mapRating(rest.attitudeRating),
      attitudeRemarks: str(rest.attitudeRemarks),
      overallRating: rest.overallRating && OVERALL_RATINGS.includes(rest.overallRating) ? rest.overallRating : null,
      furtherAction: rest.furtherAction && FURTHER_ACTIONS.includes(rest.furtherAction) ? rest.furtherAction : null,
      suggestedRole: str(rest.suggestedRole),
      suggestedProject: str(rest.suggestedProject),
      suggestedLead: str(rest.suggestedLead),
      others: str(rest.others),
      interviewerName: str(rest.interviewerName),
      interviewerPlace: str(rest.interviewerPlace),
      interviewDate: date(rest.interviewDate),
    };

    await db.technicalInterviewEvaluation.upsert({
      where: { sessionId },
      create: data,
      update: data,
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error("Technical save error:", e);
    return Response.json({ error: "Save failed" }, { status: 500 });
  }
}
