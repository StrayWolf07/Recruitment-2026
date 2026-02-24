import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const sessions = await db.examSession.findMany({
      where: { submittedAt: { not: null } },
      include: { student: true },
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
      studentEmail: s.student.email,
      college: s.student.college,
      degree: s.student.degree,
      branch: s.student.branch,
      cgpa: s.student.cgpa,
      roles: (JSON.parse(s.roleIds) as string[]).map((rid) => roleMap[rid] ?? rid),
      submittedAt: s.submittedAt!.toISOString(),
      theoryTabViolation: s.theoryTabViolation ?? false,
      terminationReason: s.terminationReason ?? null,
      terminatedAt: s.terminatedAt?.toISOString() ?? null,
      terminatedEarly: s.terminatedAt != null,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      evaluationStatus: s.evaluationStatus,
      totalScore: s.totalScore,
    }));
    return Response.json(items);
  } catch (err) {
    console.error("Get submissions error:", err);
    return Response.json([], { status: 200 });
  }
}
