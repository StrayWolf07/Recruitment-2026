import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

export async function GET() {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const student = await db.student.findUnique({
    where: { id: session.studentId },
  });
  if (!student) return Response.json({ error: "Student not found" }, { status: 404 });
  return Response.json({
    name: student.name,
    gender: student.gender,
    college: student.college,
    degree: student.degree,
    branch: student.branch,
    cgpa: student.cgpa,
    contactNumber: student.contactNumber,
    emailId: student.emailId,
    age: student.age,
    location: student.location,
    source: student.source,
    readyToRelocate: student.readyToRelocate,
    fatherName: student.fatherName,
    motherName: student.motherName,
    brotherName: student.brotherName,
    sisterName: student.sisterName,
    spouseName: student.spouseName,
    childrenName: student.childrenName,
    graduation: student.graduation,
    engineering: student.engineering,
    masters: student.masters,
    pgDiploma: student.pgDiploma,
    additionalQualifications: student.additionalQualifications,
    presentOrganization: student.presentOrganization,
    designation: student.designation,
    currentJobDetails: student.currentJobDetails,
    teamSizeHandled: student.teamSizeHandled,
    reportingTo: student.reportingTo,
    currentMonthlyCTC: student.currentMonthlyCTC,
    currentAnnualCTC: student.currentAnnualCTC,
    expectedMonthlyCTC: student.expectedMonthlyCTC,
    expectedAnnualCTC: student.expectedAnnualCTC,
    totalExperience: student.totalExperience,
    noticePeriod: student.noticePeriod,
    reasonsForChange: student.reasonsForChange,
  });
}
