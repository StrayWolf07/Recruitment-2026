import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sessions = await db.examSession.findMany({
      where: { technicalEligible: true, submittedAt: { not: null } },
      include: {
        student: true,
        technicalInterviewEvaluation: true,
      },
      orderBy: { submittedAt: "desc" },
    });
    const roleIds = Array.from(new Set(sessions.flatMap((s) => JSON.parse(s.roleIds) as string[])));
    const roles =
      roleIds.length > 0
        ? await db.role.findMany({ where: { id: { in: roleIds } } })
        : [];
    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

    const items = sessions.map((s) => ({
      id: s.id,
      studentName: s.student.name,
      college: s.student.college,
      roles: (JSON.parse(s.roleIds) as string[]).map((rid) => roleMap[rid] ?? rid),
      totalScore: s.totalScore,
      hasEvaluation: !!s.technicalInterviewEvaluation,
    }));
    return Response.json(items);
  } catch (err) {
    console.error("Technical list error:", err);
    return Response.json([], { status: 200 });
  }
}
