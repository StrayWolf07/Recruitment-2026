import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getStudentSession();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const {
      name,
      gender,
      college,
      degree,
      branch,
      cgpa,
      roleIds,
      contactNumber,
      emailId,
      age,
      location,
      source,
      readyToRelocate,
      fatherName,
      motherName,
      brotherName,
      sisterName,
      spouseName,
      childrenName,
      graduation,
      engineering,
      masters,
      pgDiploma,
      additionalQualifications,
      presentOrganization,
      designation,
      currentJobDetails,
      teamSizeHandled,
      reportingTo,
      currentMonthlyCTC,
      currentAnnualCTC,
      expectedMonthlyCTC,
      expectedAnnualCTC,
      totalExperience,
      noticePeriod,
      reasonsForChange,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return Response.json({ error: "Name required" }, { status: 400 });
    }
    if (!gender || typeof gender !== "string" || !gender.trim()) {
      return Response.json({ error: "Gender required" }, { status: 400 });
    }
    if (!college || typeof college !== "string" || !college.trim()) {
      return Response.json({ error: "College required" }, { status: 400 });
    }
    if (!degree || typeof degree !== "string" || !degree.trim()) {
      return Response.json({ error: "Degree required" }, { status: 400 });
    }
    if (!branch || typeof branch !== "string" || !branch.trim()) {
      return Response.json({ error: "Branch required" }, { status: 400 });
    }

    const cgpaNum = typeof cgpa === "number" ? cgpa : parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      return Response.json({ error: "CGPA must be between 0 and 10" }, { status: 400 });
    }

    if (!Array.isArray(roleIds) || roleIds.length < 1 || roleIds.length > 2) {
      return Response.json({ error: "Select 1 or 2 roles" }, { status: 400 });
    }

    const reqStr = (v: unknown, msg: string): string | null => {
      if (v == null || (typeof v === "string" && !v.trim())) return msg;
      if (typeof v === "string") return v.trim() ? null : msg;
      return null;
    };
    let err = reqStr(contactNumber, "Contact number required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(emailId, "Email ID required");
    if (err) return Response.json({ error: err }, { status: 400 });
    if (age == null || (typeof age === "string" && !String(age).trim())) return Response.json({ error: "Age required" }, { status: 400 });
    const ageNum = typeof age === "number" ? age : parseInt(String(age), 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) return Response.json({ error: "Age must be 1-120" }, { status: 400 });
    err = reqStr(location, "Location required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(source, "Source required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(readyToRelocate, "Ready to relocate required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(fatherName, "Father's name required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(motherName, "Mother's name required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(brotherName, "Brother's name required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(sisterName, "Sister's name required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(spouseName, "Spouse's name required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(childrenName, "Children's name required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(graduation, "Graduation required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(engineering, "Engineering required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(masters, "Masters required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(pgDiploma, "PG Diploma required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(additionalQualifications, "Additional qualifications required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(presentOrganization, "Present organization required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(designation, "Designation required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(currentJobDetails, "Current job details required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(teamSizeHandled, "Team size handled required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(reportingTo, "Reporting to required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(currentMonthlyCTC, "Current monthly CTC required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(currentAnnualCTC, "Current annual CTC required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(expectedMonthlyCTC, "Expected monthly CTC required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(expectedAnnualCTC, "Expected annual CTC required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(totalExperience, "Total experience required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(noticePeriod, "Notice period required");
    if (err) return Response.json({ error: err }, { status: 400 });
    err = reqStr(reasonsForChange, "Reasons for change required");
    if (err) return Response.json({ error: err }, { status: 400 });

    const validRoles = await db.role.count({
      where: { id: { in: roleIds }, isActive: true },
    });
    if (validRoles !== roleIds.length) {
      return Response.json({ error: "Invalid role selection" }, { status: 400 });
    }

    const profileData = {
      studentId: session.studentId,
      name: name.trim(),
      gender: gender.trim(),
      college: college.trim(),
      degree: degree.trim(),
      branch: branch.trim(),
      cgpa: cgpaNum,
      roleIds: JSON.stringify(roleIds),
    };

    await db.studentProfile.create({ data: profileData });

    const trim = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v));
    const studentUpdate: Record<string, unknown> = {
      name: name.trim(),
      gender: gender.trim(),
      college: college.trim(),
      degree: degree.trim(),
      branch: branch.trim(),
      cgpa: cgpaNum,
      contactNumber: trim(contactNumber),
      emailId: trim(emailId),
      age: ageNum,
      location: trim(location),
      source: trim(source),
      readyToRelocate: trim(readyToRelocate),
      fatherName: trim(fatherName),
      motherName: trim(motherName),
      brotherName: trim(brotherName),
      sisterName: trim(sisterName),
      spouseName: trim(spouseName),
      childrenName: trim(childrenName),
      graduation: trim(graduation),
      engineering: trim(engineering),
      masters: trim(masters),
      pgDiploma: trim(pgDiploma),
      additionalQualifications: trim(additionalQualifications),
      presentOrganization: trim(presentOrganization),
      designation: trim(designation),
      currentJobDetails: trim(currentJobDetails),
      teamSizeHandled: trim(teamSizeHandled),
      reportingTo: trim(reportingTo),
      currentMonthlyCTC: trim(currentMonthlyCTC),
      currentAnnualCTC: trim(currentAnnualCTC),
      expectedMonthlyCTC: trim(expectedMonthlyCTC),
      expectedAnnualCTC: trim(expectedAnnualCTC),
      totalExperience: trim(totalExperience),
      noticePeriod: trim(noticePeriod),
      reasonsForChange: trim(reasonsForChange),
    };

    await db.student.update({
      where: { id: session.studentId },
      data: studentUpdate as Parameters<typeof db.student.update>[0]["data"],
    });
    return Response.json({ success: true });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Save profile failed" }, { status: 500 });
  }
}
