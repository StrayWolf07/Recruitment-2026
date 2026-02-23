import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const ok = await getAdminSession();
  if (!ok) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const sessionId = request.nextUrl.searchParams.get("sessionId");
  if (!sessionId) return Response.json({ error: "sessionId required" }, { status: 400 });

  const session = await db.examSession.findUnique({
    where: { id: sessionId },
    include: {
      student: true,
      examQuestions: { orderBy: { orderIndex: "asc" } },
      answers: true,
      practicalFiles: true,
      examLogs: true,
    },
  });
  if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
  if (!session.submittedAt) return Response.json({ error: "Exam not submitted" }, { status: 400 });

  const roleIds = JSON.parse(session.roleIds) as string[];
  const roles = await db.role.findMany({ where: { id: { in: roleIds } } });
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));

  const logs = session.examLogs ?? [];
  const returnLogs = logs.filter((l) => l.durationAway != null && l.durationAway >= 0);
  const totalTabSwitchesFromLogs = returnLogs.length;
  const totalTimeAwayMsFromLogs = returnLogs.reduce((s, l) => s + (l.durationAway ?? 0), 0);

  const answersMap = Object.fromEntries(
    session.answers.map((a) => [
      a.examQuestionId,
      {
        id: a.id,
        answerText: a.answerText,
        firstOpened: a.firstOpened?.toISOString(),
        lastModified: a.lastModified?.toISOString(),
        totalTimeSpent: a.totalTimeSpent,
        scoreAwarded: a.scoreAwarded,
        openedAt: a.openedAt?.toISOString(),
        closedAt: a.closedAt?.toISOString(),
        activeTimeMs: a.activeTimeMs,
      },
    ])
  );

  const totalExamTimeSec = Math.floor(
    (session.submittedAt.getTime() - session.startTime.getTime()) / 1000
  );

  const s = session.student;
  return Response.json({
    session: {
      id: session.id,
      studentName: s.name,
      studentEmail: s.email,
      college: s.college,
      degree: s.degree,
      branch: s.branch,
      cgpa: s.cgpa,
      roles: roleIds.map((rid) => roleMap[rid] ?? rid),
      startTime: session.startTime.toISOString(),
      endTime: session.endTime.toISOString(),
      submittedAt: session.submittedAt.toISOString(),
      totalExamTimeSec,
      totalTabSwitches: totalTabSwitchesFromLogs,
      totalTimeAway: Math.floor(totalTimeAwayMsFromLogs / 1000),
      theoryTabViolation: session.theoryTabViolation ?? false,
      terminationReason: session.terminationReason ?? null,
      terminatedAt: session.terminatedAt?.toISOString() ?? null,
      totalScore: session.totalScore,
      evaluationStatus: session.evaluationStatus,
      candidateDetails: {
        contactNumber: s.contactNumber,
        emailId: s.emailId,
        age: s.age,
        location: s.location,
        source: s.source,
        readyToRelocate: s.readyToRelocate,
        fatherName: s.fatherName,
        motherName: s.motherName,
        brotherName: s.brotherName,
        sisterName: s.sisterName,
        spouseName: s.spouseName,
        childrenName: s.childrenName,
        graduation: s.graduation,
        engineering: s.engineering,
        masters: s.masters,
        pgDiploma: s.pgDiploma,
        additionalQualifications: s.additionalQualifications,
        presentOrganization: s.presentOrganization,
        designation: s.designation,
        currentJobDetails: s.currentJobDetails,
        teamSizeHandled: s.teamSizeHandled,
        reportingTo: s.reportingTo,
        currentMonthlyCTC: s.currentMonthlyCTC,
        currentAnnualCTC: s.currentAnnualCTC,
        expectedMonthlyCTC: s.expectedMonthlyCTC,
        expectedAnnualCTC: s.expectedAnnualCTC,
        totalExperience: s.totalExperience,
        noticePeriod: s.noticePeriod,
        reasonsForChange: s.reasonsForChange,
      },
    },
    questions: session.examQuestions.map((q) => {
      const files = session.practicalFiles
        .filter((f) => f.questionId === q.id)
        .map((f) => ({ id: f.id, filename: f.filename, storedPath: f.storedPath, sizeBytes: f.sizeBytes }));
      return { id: q.id, questionText: q.questionText, section: q.section, answer: answersMap[q.id], files };
    }),
  });
}
