import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { generateStudentInfoPDF } from "@/lib/pdfGenerator";

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
      include: { student: true },
    });
    if (!session) return Response.json({ error: "Session not found" }, { status: 404 });
    if (!session.submittedAt) return Response.json({ error: "Exam not submitted" }, { status: 400 });

    const roleIds = JSON.parse(session.roleIds) as string[];
    const roles = await db.role.findMany({ where: { id: { in: roleIds } } });
    const roleMap = Object.fromEntries(roles.map((r) => [r.id, r.name]));
    const s = session.student;

    const pdfBytes = await generateStudentInfoPDF({
      name: s.name,
      email: s.email,
      gender: s.gender,
      college: s.college,
      degree: s.degree,
      branch: s.branch,
      cgpa: s.cgpa,
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
      roleNames: roleIds.map((rid) => roleMap[rid] ?? rid),
    });

    const filename = `student_info_${sessionId}.pdf`;
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
